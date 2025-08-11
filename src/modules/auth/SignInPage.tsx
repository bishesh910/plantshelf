import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { auth } from "../../lib/firebase"; // from step 0
import { updateProfile } from "firebase/auth";

const PASS_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/; // at least 1 letter + 1 number, 8–64 chars

export default function SignInPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    // basic client validation
    if (mode === "signup") {
      const trimmedName = name.trim();
      if (trimmedName.length < 2 || trimmedName.length > 40) {
        setErr("Name must be 2–40 characters.");
        return;
      }
      if (!PASS_RULE.test(password)) {
        setErr("Password must be 8–64 chars and include at least 1 letter and 1 number.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "signin") {
        // allow up to 64 for signin; don't block legacy passwords on regex
        if (password.length > 64) {
          throw new Error("Password must be at most 64 characters.");
        }
        await signIn(email, password);
      } else {
        // create account
        await signUp(email, password);
        // set displayName if possible
        if (auth.currentUser && name.trim()) {
          await updateProfile(auth.currentUser, { displayName: name.trim() });
        }
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
        {mode === "signup" && (
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
              autoComplete="name"
              placeholder="Your name"
            />
            <div className="text-xs text-gray-500 mt-1">{name.length}/40</div>
          </div>
        )}

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm mb-1">Password</label>
            {/* live hint only for signup */}
            {mode === "signup" && (
              <span className="text-[11px] text-gray-500">
                8–64 chars, include a letter & a number
              </span>
            )}
          </div>
          <input
            type="password"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === "signup" ? 8 : undefined}
            maxLength={64}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={mode === "signin" ? "Your password" : "Create a password"}
          />
          <div className="text-xs text-gray-500 mt-1">{password.length}/64</div>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}

        <button
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-60"
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
