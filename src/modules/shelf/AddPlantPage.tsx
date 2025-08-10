import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { addPlant } from "./plantService";

export default function AddPlantPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [lastWatered, setLastWatered] = useState<string>("");
  const [nextWaterOn, setNextWaterOn] = useState<string>("");
  const [notes, setNotes] = useState("");

  if (!user) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await addPlant(user.uid, { name, species, lastWatered, notes, nextWaterOn });
    nav("/");
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">Add Plant</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm mb-1">Name *</label>
          <input
            required
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Monstera Deliciosa"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Species</label>
          <input
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            placeholder="e.g., Monstera deliciosa"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Last Watered</label>
            <input
              type="date"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
              value={lastWatered}
              onChange={(e) => setLastWatered(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Next Water On</label>
            <input
              type="date"
              className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
              value={nextWaterOn}
              onChange={(e) => setNextWaterOn(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Notes</label>
          <textarea
            className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Light needs, fertilizer reminders, etc."
          />
        </div>

        <button className="rounded-md border border-zinc-300 dark:border-zinc-700 px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900">
          Save
        </button>
      </form>
    </div>
  );
}
