import { FormEvent, useState } from "react";
import { useAuth } from "./AuthContext";

export default function SignInPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin"|"signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">
        {mode === "signin" ? "Sign in" : "Create your account"}
      </h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}

        <button
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <div className="text-sm mt-3">
        {mode === "signin" ? (
          <button className="underline" onClick={() => setMode("signup")}>
            New here? Create an account
          </button>
        ) : (
          <button className="underline" onClick={() => setMode("signin")}>
            Already have an account? Sign in
          </button>
        )}
      </div>
    </div>
  );
}
