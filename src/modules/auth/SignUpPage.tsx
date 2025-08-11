import type { FormEvent } from "react";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { auth } from "../../lib/firebase"; // from step 0
import { updateProfile } from "firebase/auth";

const PASS_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/; // ≥1 letter & ≥1 number, 8–64 chars

export default function SignUpPage() {
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 40) {
      setErr("Name must be 2–40 characters.");
      return;
    }
    if (!PASS_RULE.test(password)) {
      setErr("Password must be 8–64 chars and include at least 1 letter and 1 number.");
      return;
    }

    setLoading(true);
    try {
      // Create the account
      await signUp(email, password);

      // Set displayName on the Firebase user profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: trimmedName });
      }
      // Optional: redirect or show success message here
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create your account</h1>

      <form onSubmit={onSubmit} className="space-y-3">
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
            <span className="text-[11px] text-gray-500">
              8–64 chars, include a letter & a number
            </span>
          </div>
          <input
            type="password"
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={64}
            autoComplete="new-password"
            placeholder="Create a password"
          />
          <div className="text-xs text-gray-500 mt-1">{password.length}/64</div>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}

        <button
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Sign up"}
        </button>
      </form>
    </div>
  );
}
