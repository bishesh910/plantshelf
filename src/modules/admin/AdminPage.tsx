import { useState } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";

/** Region MUST match exports in functions/src/index.ts */
const FNS_REGION = "us-central1";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function call(fnName: "adminDeleteUserByEmail" | "adminRevokeSessionsByEmail" | "adminSendPasswordReset") {
    setMsg(null);
    setErr(null);
    setLoading(true);
    try {
      const fns = getFunctions(undefined, FNS_REGION);
      const fn = httpsCallable(fns, fnName);
      const res: any = await fn({ email: email.trim() });
      setMsg(res?.data?.message || res?.data?.link || "OK");
    } catch (e: any) {
      // Surface exact error to debug (permission, app-check, not-found, etc.)
      const code = e?.code || "unknown";
      const message = e?.message || String(e);
      setErr(`${fnName} failed: ${code} — ${message}`);
      console.warn(fnName, "error:", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Admin tools</h1>

      <label className="block text-sm mb-1">Target user email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@example.com"
        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => call("adminSendPasswordReset")}
          disabled={loading || !email.trim()}
          className="text-xs px-2 py-1 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Send reset link
        </button>

        <button
          onClick={() => call("adminRevokeSessionsByEmail")}
          disabled={loading || !email.trim()}
          className="text-xs px-2 py-1 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          Revoke sessions
        </button>

        <button
          onClick={async () => {
            const ok = confirm(`Delete ALL data + auth for ${email.trim()}?`);
            if (ok) await call("adminDeleteUserByEmail");
          }}
          disabled={loading || !email.trim()}
          className="text-xs px-2 py-1 border border-red-500 text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Delete user
        </button>
      </div>

      {msg && <p className="text-sm text-green-600 mt-3 break-all">{msg}</p>}
      {err && <p className="text-sm text-red-500 mt-3 whitespace-pre-wrap break-all">{err}</p>}
    </div>
  );
}
