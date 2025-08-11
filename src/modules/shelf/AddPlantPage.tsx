import { useState, useMemo } from "react";
import { useAuth } from "../auth/AuthContext"; // adjust if your path differs
import { addPlant, isNameUnique } from "../../services/plants.service";

// --- date helpers (timezone-safe: clamp to local midnight)
function ymd(d: Date): string {
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayStr() { return ymd(new Date()); }
function addDays(baseISO: string | null, days: number): string {
  const base = baseISO ? new Date(baseISO) : new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + days);
  return ymd(base);
}
function nextWeekendISO(): string {
  const d = new Date(); d.setHours(0,0,0,0);
  // 0=Sun, 6=Sat → pick the closest upcoming Sat
  const day = d.getDay();
  const daysToSat = (6 - day + 7) % 7; // 0 if Sat today
  d.setDate(d.getDate() + daysToSat);
  return ymd(d);
}
function daysFromToday(targetISO: string): number {
  const t = new Date(targetISO); t.setHours(0,0,0,0);
  const n = new Date(); n.setHours(0,0,0,0);
  return Math.round((t.getTime() - n.getTime()) / 86400000);
}

export default function AddPlantPage() {
  const { user } = useAuth() as { user: { uid: string } | null };

  const [plantName, setPlantName] = useState("");
  const [nickname, setNickname] = useState("");
  const [notes, setNotes] = useState("");
  const [nextWater, setNextWater] = useState<string>(todayStr());

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const minDate = useMemo(() => todayStr(), []);
  const daysAway = daysFromToday(nextWater);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setOk(null);

    if (!user) { setErr("Please sign in first."); return; }

    const name = plantName.trim();
    if (!name) { setErr("Plant name is required."); return; }
    if (name.length > 40) { setErr("Plant name must be at most 40 characters."); return; }

    // enforce today/future only (defense-in-depth)
    const chosen = new Date(nextWater); chosen.setHours(0,0,0,0);
    const startOfToday = new Date(); startOfToday.setHours(0,0,0,0);
    if (chosen < startOfToday) { setErr("Next water date must be today or later."); return; }

    setLoading(true);
    try {
      // DEBUG: show which UID we're about to write under

      const unique = await isNameUnique(user.uid, name);
      if (!unique) { setErr("You already have a plant with that name."); return; }

      await addPlant(user.uid, {
        name,
        nickname: nickname.trim() || undefined,
        notes: notes.trim() || undefined,
        nextWaterAt: nextWater,
        favorite: false,
      });

      setOk("Plant added!");
      setPlantName(""); setNickname(""); setNotes("");
      // keep nextWater as-is (practical)
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <div className="p-4">Please sign in to add plants.</div>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-semibold mb-3">Add a Plant</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Plant name */}
        <div>
          <label className="block text-sm mb-1">Plant name</label>
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            maxLength={40}
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 break-words"
            placeholder="e.g., Cyclamen"
          />
          <div className="text-xs text-gray-500 mt-1">{plantName.length}/40</div>
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-sm mb-1">Nickname (optional)</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={30}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 break-words"
            placeholder="e.g., Office Pink"
          />
          <div className="text-xs text-gray-500 mt-1">{nickname.length}/30</div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 whitespace-pre-wrap"
            placeholder="Water from the bottom weekly; avoid hot afternoon sun."
            rows={4}
          />
          <div className="text-xs text-gray-500 mt-1">{notes.length}/1000</div>
        </div>

        {/* Next water: practical UX */}
        <div>
          <label className="block text-sm mb-1">Next water on</label>
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              type="button"
              onClick={() => setNextWater(todayStr())}
              className="text-xs px-2 py-1 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setNextWater(addDays(null, 2))}
              className="text-xs px-2 py-1 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              +2 days
            </button>
            <button
              type="button"
              onClick={() => setNextWater(addDays(null, 7))}
              className="text-xs px-2 py-1 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              +7 days
            </button>
            <button
              type="button"
              onClick={() => setNextWater(nextWeekendISO())}
              className="text-xs px-2 py-1 border rounded hover:bg-zinc-100 dark:hover:bg-zinc-900"
              title="Snap to the upcoming Saturday"
            >
              Next weekend
            </button>
          </div>

          <input
            type="date"
            min={minDate}
            value={nextWater}
            onChange={(e) => setNextWater(e.target.value)}
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
          />

          <p className="text-xs text-gray-500 mt-1">
            {daysAway <= 0 ? (daysAway === 0 ? "That’s today." : "Date must not be in the past.") : `That’s in ${daysAway} day${daysAway === 1 ? "" : "s"}.`}
          </p>
        </div>

        {err && <p className="text-sm text-red-500">{err}</p>}
        {ok && <p className="text-sm text-green-600">{ok}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-60"
        >
          {loading ? "Please wait..." : "Add plant"}
        </button>
      </form>
    </div>
  );
}
