import { useState } from "react";
import type { Plant } from "../../types/plant";

export default function EditPlantModal({
  plant,
  onClose,
  onSave,
}: {
  plant: Plant;
  onClose: () => void;
  onSave: (data: {
    name: string;
    nickname?: string;
    notes?: string;
    nextWaterAt?: string;
  }) => void;
}) {
  const today = new Date().toISOString().split("T")[0];
  const [name, setName] = useState(plant.name);
  const [nickname, setNickname] = useState(plant.nickname || "");
  const [notes, setNotes] = useState(plant.notes || "");
  const [nextWaterAt, setNextWaterAt] = useState(plant.nextWaterAt || today);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h2 className="text-lg font-bold">Edit Plant</h2>
        <input
          maxLength={40}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-2"
        />
        <input
          maxLength={30}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Nickname (optional)"
          className="w-full mt-2"
        />
        <textarea
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full mt-2"
        />
        <input
          type="date"
          min={today}
          value={nextWaterAt}
          onChange={(e) => setNextWaterAt(e.target.value)}
          className="w-full mt-2"
        />
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="px-4 py-1 border rounded">
            Cancel
          </button>
          <button
            onClick={() =>
              onSave({ name, nickname, notes, nextWaterAt })
            }
            className="px-4 py-1 bg-green-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}