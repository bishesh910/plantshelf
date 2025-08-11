import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function call(fnName: string) {
    setMsg(null); setErr(null); setLoading(true);
    try {
      const fns = getFunctions();
      const fn = httpsCallable(fns, fnName);
      const res: any = await fn({ email: email.trim() });
      setMsg(res?.data?.message || (res?.data?.ok ? "Done." : "OK"));
      if (res?.data?.link) console.log("Password reset link:", res.data.link);
    } catch (e: any) {
      setErr(e?.message ?? "Operation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Admin</h1>
      <p className="text-sm text-gray-500 mb-2">Manage users: reset password, revoke sessions, delete.</p>

      <label className="block text-sm mb-1">User email</label>
      <input
        type="email"
        className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
      />

      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => call("adminSendPasswordReset")}
          disabled={loading || !email}
          className="text-xs px-2 py-1 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          Send password reset
        </button>
        <button
          onClick={() => call("adminRevokeSessionsByEmail")}
          disabled={loading || !email}
          className="text-xs px-2 py-1 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          Revoke sessions
        </button>
        <button
          onClick={() => {
            const ok = window.confirm(`Delete user ${email}? This removes their account and shelf.`);
            if (ok) call("adminDeleteUserByEmail");
          }}
          disabled={loading || !email}
          className="text-xs px-2 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Delete user
        </button>
      </div>

      {msg && <p className="text-sm text-green-600 mt-3">{msg}</p>}
      {err && <p className="text-sm text-red-500 mt-3">{err}</p>}
    </div>
  );
}
