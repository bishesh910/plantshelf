// src/modules/auth/useIsAdmin.ts
import { useEffect, useState } from "react";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "./AuthContext";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState<boolean>(!!user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setIsAdmin(false);
      setLoading(false);
      setError(null);
      return;
    }

    const ref = doc(db, "admins", user.email);
    setLoading(true);
    setError(null);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        setIsAdmin(snap.exists());
        setLoading(false);
      },
      async (err) => {
        try {
          const once = await getDoc(ref);
          setIsAdmin(once.exists());
        } catch (e: any) {
          setIsAdmin(false);
          setError(e?.message ?? "Failed to read admin doc");
          console.warn("useIsAdmin read error:", e);
        } finally {
          setLoading(false);
        }
      }
    );
    return () => unsub();
  }, [user?.email]);

  return { isAdmin, loading, error };
}
