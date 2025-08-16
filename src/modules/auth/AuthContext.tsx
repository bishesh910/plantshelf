// src/modules/auth/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import {
  onAuthStateChanged,
  signOut as fbSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,

      async signIn(email, password) {
        await signInWithEmailAndPassword(auth, email, password);
      },

      async signUp(email, password) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // Send verification email immediately after account creation
        if (cred.user) {
          try {
            await sendEmailVerification(cred.user);
            // optional: you could surface a toast/notice in UI that the email was sent
          } catch (e) {
            // swallow error to avoid blocking sign-up; you can log if desired
            console.warn("sendEmailVerification failed:", e);
          }
        }
      },

      async signOut() {
        await fbSignOut(auth);
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
