import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut as fbSignOut,
  linkWithPopup,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

type AuthState = {
  user: User | null;
  /** True while we're still figuring out who the user is. */
  loading: boolean;
  /** Anonymous guests can play but get prompted to save their history. */
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

async function ensureProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  await setDoc(ref, {
    displayName: user.displayName ?? "Player",
    photoURL: user.photoURL ?? null,
    isAnonymous: user.isAnonymous,
    createdAt: serverTimestamp(),
    lifetimeScore: 0,
    gamesFinalized: 0,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        void ensureProfile(u);
      } else {
        // Everyone gets an identity immediately. A kid handed a shared link
        // should be able to start tapping without a sign-in wall; we upgrade
        // the same uid to a real account later via linkWithPopup, which keeps
        // their game history attached.
        try {
          await signInAnonymously(auth);
        } catch {
          setUser(null);
        }
      }
      setLoading(false);
    });
  }, []);

  async function signInWithGoogle() {
    const current = auth.currentUser;
    if (current?.isAnonymous) {
      try {
        const cred = await linkWithPopup(current, googleProvider);
        await setDoc(
          doc(db, "users", cred.user.uid),
          {
            displayName: cred.user.displayName ?? "Player",
            photoURL: cred.user.photoURL ?? null,
            isAnonymous: false,
          },
          { merge: true }
        );
        return;
      } catch (err: unknown) {
        // Already-linked Google account: fall through to a normal sign-in.
        const code = (err as { code?: string })?.code;
        if (code !== "auth/credential-already-in-use") throw err;
      }
    }
    const cred = await signInWithPopup(auth, googleProvider);
    await ensureProfile(cred.user);
  }

  async function signOut() {
    await fbSignOut(auth);
  }

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        isGuest: !!user?.isAnonymous,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
