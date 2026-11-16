import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "./firebase";

export type MatchupVotes = {
  votesA: number;
  votesB: number;
};

export type SeenState = {
  seen: string[];
};

const SEEN_KEY = (categoryId: string) => `www_seen_${categoryId}`;

export function loadSeen(categoryId: string): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY(categoryId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as SeenState;
    return new Set(parsed.seen);
  } catch {
    return new Set();
  }
}

export function markSeen(categoryId: string, matchupId: string): void {
  const seen = loadSeen(categoryId);
  seen.add(matchupId);
  localStorage.setItem(SEEN_KEY(categoryId), JSON.stringify({ seen: [...seen] }));
}

export function clearSeen(categoryId: string): void {
  localStorage.removeItem(SEEN_KEY(categoryId));
}

export async function fetchVotes(matchupId: string): Promise<MatchupVotes> {
  try {
    const ref = doc(db, "whoWouldWin", matchupId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return { votesA: 0, votesB: 0 };
    const data = snap.data() as Partial<MatchupVotes>;
    return { votesA: data.votesA ?? 0, votesB: data.votesB ?? 0 };
  } catch {
    return { votesA: 0, votesB: 0 };
  }
}

export async function castVote(matchupId: string, side: "A" | "B"): Promise<MatchupVotes> {
  const ref = doc(db, "whoWouldWin", matchupId);
  try {
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const current = snap.exists() ? (snap.data() as Partial<MatchupVotes>) : {};
      tx.set(ref, {
        votesA: (current.votesA ?? 0) + (side === "A" ? 1 : 0),
        votesB: (current.votesB ?? 0) + (side === "B" ? 1 : 0),
      });
    });
  } catch {
    // offline — vote silently lost, not worth blocking UX
  }
  return fetchVotes(matchupId);
}

export function totalVotes(v: MatchupVotes): number {
  return v.votesA + v.votesB;
}

export function percentA(v: MatchupVotes): number {
  const t = totalVotes(v);
  return t === 0 ? 50 : Math.round((v.votesA / t) * 100);
}
