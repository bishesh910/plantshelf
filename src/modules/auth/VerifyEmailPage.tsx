// src/modules/auth/VerifyEmailPage.tsx
import { useEffect, useState } from "react";
import { getAuth, sendEmailVerification, reload } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { useIsAdmin } from "./useIsAdmin";

export default function VerifyEmailPage() {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already good, jump to admin
  useEffect(() => {
    if (user?.emailVerified && isAdmin) {
      navigate("/admin", { replace: true });
    }
  }, [user?.emailVerified, isAdmin, navigate]);

  const resend = async () => {
    setMsg(null); setErr(null); setLoading(true);
    try {
      if (!user) throw new Error("Not signed in.");
      await sendEmailVerification(user);
      setMsg("Verification email sent. Please check your inbox.");
    } catch (e: any) {
      setErr(e?.message || "Failed to send verification email.");
    } finally {
      setLoading(false);
    }
  };

  const iveVerified = async () => {
    setMsg(null); setErr(null); setLoading(true);
    try {
      if (!user) throw new Error("Not signed in.");
      await reload(user);
      if (auth.currentUser?.emailVerified) {
        if (isAdmin) {
          setMsg("Email verified! Redirecting to Admin…");
          setTimeout(() => navigate("/admin", { replace: true }), 600);
        } else {
          setErr("Verified, but your account is not in the admin allowlist.");
        }
      } else {
        setErr("Still not verified. Click the link in your inbox, then try again.");
      }
    } catch (e: any) {
      setErr(e?.message || "Verification check failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-2">Verify your email</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Admin access requires a verified email address.
      </p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={resend}
          disabled={loading}
          className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          Send verification email
        </button>
        <button
          onClick={iveVerified}
          disabled={loading}
          className="px-3 py-2 rounded-md bg-green-600 text-white hover:opacity-90"
        >
          I’ve verified
        </button>
      </div>

      {msg && <p className="mt-3 text-green-600 text-sm">{msg}</p>}
      {err && <p className="mt-3 text-red-500 text-sm">{err}</p>}

      <div className="mt-6 text-sm">
        <Link to="/" className="hover:underline">Back to Shelf</Link>
      </div>
    </div>
  );
}
