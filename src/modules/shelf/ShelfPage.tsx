import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { listPlants, removePlant, updatePlant } from "./plantService";
import type { Plant } from "./types";

export default function ShelfPage() {
  const { user } = useAuth();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await listPlants(user.uid);
      setPlants(rows as any);
    } catch (err: any) {
      console.error("Error fetching plants:", err);
      // Common culprit: missing composite index for userId+createdAt
      setError(err?.message ?? "Failed to load plants");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  async function onDelete(id: string) {
    await removePlant(id);
    await load();
  }

  async function markWatered(p: Plant) {
    const today = new Date().toISOString().slice(0, 10);
    await updatePlant(p.id, { lastWatered: today });
    await load();
  }

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">My Shelf</h1>

      {loading && <p>Loading...</p>}

      {!loading && error && (
        <p className="text-red-500 text-sm mb-3">
          {error.includes("index") ? (
            <>This query needs a Firestore composite index. Create it in the console and refresh.</>
          ) : (
            <>Error: {error}</>
          )}
        </p>
      )}

      {!loading && !error && plants.length === 0 && (
        <p className="text-zinc-500">No plants yet. Click “Add Plant” to get started.</p>
      )}

      {!loading && !error && plants.length > 0 && (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((p) => (
            <li key={p.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-medium text-lg">{p.name}</h2>
                  {p.species && <p className="text-sm text-zinc-500">{p.species}</p>}
                </div>
                <button
                  onClick={() => onDelete(p.id)}
                  className="text-sm underline text-red-500"
                >
                  Delete
                </button>
              </div>

              <div className="mt-3 space-y-1 text-sm">
                <p>Last watered: {p.lastWatered ?? "—"}</p>
                {p.nextWaterOn && <p>Next water: {p.nextWaterOn}</p>}
                {p.notes && <p className="text-zinc-500">Notes: {p.notes}</p>}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => markWatered(p)}
                  className="px-3 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm"
                >
                  Mark Watered Today
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
