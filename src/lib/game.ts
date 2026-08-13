import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { CARD_INDEX, TOTAL_POSSIBLE } from "../data/cards";

export type GameStatus = "active" | "finalized";

export type Game = {
  id: string;
  name: string;
  ownerUid: string;
  status: GameStatus;
  memberIds: string[];
  members: Record<string, { name: string; photoURL: string | null }>;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  finalizedAt?: Timestamp;
  finalScore?: number;
};

export type Find = {
  cardId: string;
  points: number;
  uid: string;
  name: string;
  foundAt?: Timestamp;
};

/** Long random id so a game URL is unguessable — the link is the permission. */
function makeGameId() {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

function defaultGameName() {
  const d = new Date();
  return `${d.toLocaleDateString(undefined, { month: "long", day: "numeric" })} trip`;
}

export async function createGame(
  uid: string,
  displayName: string,
  photoURL: string | null,
  name?: string
): Promise<string> {
  const id = makeGameId();
  await setDoc(doc(db, "games", id), {
    name: name?.trim() || defaultGameName(),
    ownerUid: uid,
    status: "active" satisfies GameStatus,
    memberIds: [uid],
    members: { [uid]: { name: displayName, photoURL } },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

/** Adds the current player to a game they opened via a shared link. */
export async function joinGame(
  gameId: string,
  uid: string,
  displayName: string,
  photoURL: string | null
) {
  await updateDoc(doc(db, "games", gameId), {
    memberIds: arrayUnion(uid),
    [`members.${uid}`]: { name: displayName, photoURL },
    updatedAt: serverTimestamp(),
  });
}

/** Live game doc + all finds. Both stream from the local cache first. */
export function useGame(gameId: string | undefined) {
  const [game, setGame] = useState<Game | null>(null);
  const [finds, setFinds] = useState<Record<string, Find>>({});
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    setMissing(false);

    const unsubGame = onSnapshot(doc(db, "games", gameId), (snap) => {
      if (!snap.exists()) {
        setMissing(true);
        setGame(null);
      } else {
        setGame({ id: snap.id, ...(snap.data() as Omit<Game, "id">) });
      }
      setLoading(false);
    });

    const unsubFinds = onSnapshot(
      collection(db, "games", gameId, "finds"),
      (snap) => {
        const next: Record<string, Find> = {};
        snap.forEach((d) => {
          next[d.id] = d.data() as Find;
        });
        setFinds(next);
      }
    );

    return () => {
      unsubGame();
      unsubFinds();
    };
  }, [gameId]);

  const score = useMemo(
    () => Object.values(finds).reduce((sum, f) => sum + f.points, 0),
    [finds]
  );

  /** Per-player totals, for shared games. */
  const byPlayer = useMemo(() => {
    const totals: Record<string, { name: string; score: number; count: number }> = {};
    for (const f of Object.values(finds)) {
      const t = (totals[f.uid] ??= { name: f.name, score: 0, count: 0 });
      t.score += f.points;
      t.count += 1;
    }
    return totals;
  }, [finds]);

  return { game, finds, score, byPlayer, loading, missing, possible: TOTAL_POSSIBLE };
}

export function useCardActions(gameId: string | undefined, uid: string | undefined, name: string) {
  /**
   * Toggling writes the find doc and an append-only event. The event log is
   * what makes undo and "who spotted it" possible; the find doc is what the
   * board reads. Untapping deletes the find, which is why the score can never
   * drift out of sync with the board — it's always recomputed from finds.
   */
  const toggle = useCallback(
    async (cardId: string, currentlyFound: boolean) => {
      if (!gameId || !uid) return;
      const card = CARD_INDEX[cardId];
      if (!card) return;

      const findRef = doc(db, "games", gameId, "finds", cardId);
      if (currentlyFound) {
        await deleteDoc(findRef);
      } else {
        await setDoc(findRef, {
          cardId,
          points: card.points,
          uid,
          name,
          // Written as a FieldValue sentinel; reads back as a Timestamp.
          foundAt: serverTimestamp(),
        });
      }

      void addDoc(collection(db, "games", gameId, "events"), {
        type: currentlyFound ? "untap" : "tap",
        cardId,
        points: card.points,
        uid,
        name,
        at: serverTimestamp(),
      });
      void updateDoc(doc(db, "games", gameId), { updatedAt: serverTimestamp() });
    },
    [gameId, uid, name]
  );

  /** Reverses this player's most recent action in the game. */
  const undoLast = useCallback(async () => {
    if (!gameId || !uid) return;
    const snap = await getDocs(
      query(
        collection(db, "games", gameId, "events"),
        where("uid", "==", uid),
        orderBy("at", "desc"),
        limit(1)
      )
    );
    const last = snap.docs[0]?.data() as
      | { type: "tap" | "untap"; cardId: string }
      | undefined;
    if (!last) return;
    await toggle(last.cardId, last.type === "tap");
  }, [gameId, uid, toggle]);

  return { toggle, undoLast };
}

export async function renameGame(gameId: string, name: string) {
  await updateDoc(doc(db, "games", gameId), {
    name: name.trim() || defaultGameName(),
    updatedAt: serverTimestamp(),
  });
}

export async function finalizeGame(gameId: string, finalScore: number) {
  await updateDoc(doc(db, "games", gameId), {
    status: "finalized" satisfies GameStatus,
    finalScore,
    finalizedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function reopenGame(gameId: string) {
  await updateDoc(doc(db, "games", gameId), {
    status: "active" satisfies GameStatus,
    updatedAt: serverTimestamp(),
  });
}

/** All games this player has taken part in, newest first. */
export function useMyGames(uid: string | undefined) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, "games"),
      where("memberIds", "array-contains", uid),
      orderBy("updatedAt", "desc"),
      limit(50)
    );
    return onSnapshot(
      q,
      (snap) => {
        setGames(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Game, "id">) })));
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, [uid]);

  return { games, loading };
}
