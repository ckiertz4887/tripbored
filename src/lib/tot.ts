import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export type SavedMarathon = {
  savedAt?: unknown;
  mode: "tournament" | "koth";
  screen: "playing" | "round-complete";
  play: { matchupsPlayed: number; totalMatchups: number; [key: string]: unknown };
  roundCompleteInfo: {
    completedLabel: string;
    nextLabel: string;
    advancingCount: number;
  } | null;
};

const ref = (uid: string) => doc(db, "users", uid, "tot_marathon", "progress");

export async function saveMarathon(uid: string, data: Omit<SavedMarathon, "savedAt">) {
  await setDoc(ref(uid), { ...data, savedAt: serverTimestamp() });
}

export async function loadMarathon(uid: string): Promise<SavedMarathon | null> {
  const snap = await getDoc(ref(uid));
  return snap.exists() ? (snap.data() as SavedMarathon) : null;
}

export async function clearMarathon(uid: string) {
  await deleteDoc(ref(uid));
}
