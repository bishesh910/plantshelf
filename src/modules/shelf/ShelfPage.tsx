import { useEffect, useMemo, useState } from "react";
import { auth } from "../../lib/firebase"; // adjust path if needed
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { listPlants, toggleFavorite, updatePlant, isNameUnique } from "../../services/plants.service";
import type { Plant } from "../../types/plant";
import PlantCard from "./PlantCard";
import EditPlantModal from "./EditPlantModal";

export default function ShelfPage() {
  const [user, setUser] = useState<User | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [showFavs, setShowFavs] = useState(false);
  const [editing, setEditing] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setErr(null);
      setLoading(true);
      try {
        if (u) {
          const data = await listPlants(u.uid);
          setPlants(data as any);
        } else {
          setPlants([]);
        }
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load plants");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, []);

  const sorted = useMemo(() => {
    const arr = [...plants];
    const toMillis = (d?: string) => (d ? new Date(d).getTime() : Number.MAX_SAFE_INTEGER);
    arr.sort((a, b) =>
      Number(b.favorite) - Number(a.favorite) ||
      toMillis(a.nextWaterAt) - toMillis(b.nextWaterAt) ||
      b.createdAt - a.createdAt
    );
    return showFavs ? arr.filter((p) => p.favorite) : arr;
  }, [plants, showFavs]);

  async function handleToggleFav(id: string, fav: boolean) {
    if (!user) return;
    try {
      await toggleFavorite(user.uid, id, fav);
      setPlants((prev) => prev.map((p) => (p.id === id ? { ...p, favorite: fav } : p)));
    } catch (e) {
      // no-op; in real app show toast
    }
  }

  async function handleSaveEdit(data: { name: string; nickname?: string; notes?: string; nextWaterAt?: string; }) {
    if (!user || !editing) return;
    const name = data.name.trim();
    if (!name) { alert("Name is required"); return; }
    const unique = await isNameUnique(user.uid, name, editing.id);
    if (!unique) { alert("You already have a plant with this name."); return; }
    await updatePlant(user.uid, editing.id, data as any);
    setPlants((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data, nameLower: name.toLowerCase(), updatedAt: Date.now() } : p)));
    setEditing(null);
  }

  if (!user) return <div className="p-4">Please sign in to view your shelf.</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-bold">Your Shelf</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showFavs} onChange={(e) => setShowFavs(e.target.checked)} />
            Show favorites only
          </label>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {err && <div className="text-sm text-red-500">{err}</div>}

      <div className="grid gap-3 sm:grid-cols-2">
        {sorted.map((p) => (
          <PlantCard
            key={p.id}
            plant={p}
            onEdit={(pl) => setEditing(pl)}
            onToggleFavorite={handleToggleFav}
          />
        ))}
        {!loading && sorted.length === 0 && (
          <div className="text-sm text-gray-600">No plants yet.</div>
        )}
      </div>

      {editing && (
        <EditPlantModal
          plant={editing}
          onClose={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}