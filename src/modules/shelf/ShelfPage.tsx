// src/modules/shelf/ShelfPage.tsx
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../../lib/firebase";

import {
  listPlants,
  toggleFavorite,
  updatePlant,
  isNameUnique,
} from "../../services/plants.service";

// If you keep a separate Plant type file, switch this import to that path.
import type { Plant } from "../../services/plants.service";

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
    // auth listener
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setErr(null);
      setLoading(true);

      // clean up any previous plants listener when auth changes
      if (!u) {
        setPlants([]);
        setLoading(false);
        return;
      }

      // LIVE updates: subscribe to Firestore and update state on every change
      const unsubPlants = listPlants(u.uid, (data) => {
        setPlants(data);
        setLoading(false);
      });

      // when auth listener fires again (or unmount), also stop listening to plants
      return () => unsubPlants();
    });

    return () => unsubAuth();
  }, []);

  // Filter + sort (favorites first, then nextWaterAt soonest, then newest)
  const view = useMemo(() => {
    const rows = showFavs ? plants.filter((p) => p.favorite) : plants.slice();
    rows.sort((a, b) => {
      const favDiff = Number(b.favorite) - Number(a.favorite);
      if (favDiff) return favDiff;

      const aWhen = a.nextWaterAt ? new Date(a.nextWaterAt).getTime() : Number.POSITIVE_INFINITY;
      const bWhen = b.nextWaterAt ? new Date(b.nextWaterAt).getTime() : Number.POSITIVE_INFINITY;
      if (aWhen !== bWhen) return aWhen - bWhen;

      return b.createdAt - a.createdAt;
    });
    return rows;
  }, [plants, showFavs]);

  async function onToggleFav(p: Plant) {
    if (!user) return;
    try {
      await toggleFavorite(user.uid, p.id, !p.favorite);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to toggle favorite");
    }
  }

  async function onSaveEdit(plantId: string, patch: Partial<Plant>) {
    if (!user) return;

    try {
      // If name changed, enforce uniqueness
      if (patch.name && patch.name.trim().toLowerCase() !== patch.nameLower) {
        const ok = await isNameUnique(user.uid, patch.name.trim(), plantId);
        if (!ok) throw new Error("You already have a plant with that name.");
      }
      await updatePlant(user.uid, plantId, {
        name: patch.name?.trim(),
        nickname: patch.nickname?.trim(),
        notes: patch.notes?.trim(),
        nextWaterAt: patch.nextWaterAt,
        favorite: patch.favorite,
      });
      setEditing(null);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to save changes");
    }
  }

  if (!user) {
    return <div className="p-4">Please sign in to view your shelf.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Your Shelf</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFavs}
              onChange={(e) => setShowFavs(e.target.checked)}
            />
            Show favorites only
          </label>
        </div>
      </div>

      {err && <p className="text-sm text-red-500 mb-2">{err}</p>}
      {loading && <p className="text-sm text-gray-500">Loading…</p>}

      {!loading && view.length === 0 && (
        <p className="text-sm text-gray-500">No plants yet.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {view.map((p) => (
          <PlantCard
            key={p.id}
            plant={p}
            onEdit={() => setEditing(p)}
            onToggleFavorite={() => onToggleFav(p)}
          />
        ))}
      </div>

      {editing && (
        <EditPlantModal
          plant={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => onSaveEdit(editing.id, patch)}
        />
      )}
    </div>
  );
}
