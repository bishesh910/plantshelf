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

    // Realtime subscription with error handling
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setIsAdmin(snap.exists());
        setLoading(false);
      },
      async (e) => {
        // Use the param so TS doesn't flag it as unused
        console.warn("useIsAdmin onSnapshot error:", e);
        try {
          const once = await getDoc(ref);
          setIsAdmin(once.exists());
        } catch (ee: any) {
          setIsAdmin(false);
          setError(ee?.message ?? "Failed to read admin doc");
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsub();
  }, [user?.email]);

  return { isAdmin, loading, error };
}
