// src/modules/shelf/EditPlantModal.tsx
import { useEffect, useMemo, useState } from "react";
import type { Plant } from "../../types/plant";

/** ---- Date helpers (timezone-safe; matches AddPlantPage style) ---- */
function ymd(d: Date): string {
  const dd = new Date(d);
  dd.setHours(0, 0, 0, 0);
  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");
  const day = String(dd.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayStr() {
  return ymd(new Date());
}
function addDays(baseISO: string | null, days: number): string {
  const base = baseISO ? new Date(baseISO) : new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + days);
  return ymd(base);
}

/** How far in the future we allow scheduling */
const MAX_FUTURE_DAYS = 365 * 3; // ~3 years
const MIN_DATE = todayStr();
const MAX_DATE = addDays(MIN_DATE, MAX_FUTURE_DAYS);

type Patch = {
  name: string;
  nickname?: string;
  notes?: string;
  nextWaterAt?: string;
};

export default function EditPlantModal({
  plant,
  onClose,
  onSave,
}: {
  plant: Plant;
  onClose: () => void;
  onSave: (data: Patch) => void;
}) {
  const [name, setName] = useState(plant.name ?? "");
  const [nickname, setNickname] = useState(plant.nickname ?? "");
  const [notes, setNotes] = useState(plant.notes ?? "");
  const [nextWaterAt, setNextWaterAt] = useState<string | undefined>(
    plant.nextWaterAt || undefined
  );

  // ---- Validation state
  const [errName, setErrName] = useState<string>("");
  const [errNick, setErrNick] = useState<string>("");
  const [errNotes, setErrNotes] = useState<string>("");
  const [errDate, setErrDate] = useState<string>("");

  // Clamp incoming plant.nextWaterAt (e.g., if it’s in the past or too far future)
  useEffect(() => {
    if (!plant.nextWaterAt) return;
    const iso = plant.nextWaterAt;
    if (iso < MIN_DATE) setNextWaterAt(MIN_DATE);
    else if (iso > MAX_DATE) setNextWaterAt(MAX_DATE);
    else setNextWaterAt(iso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plant.id]);

  // Derived validity
  const isValid = useMemo(() => {
    return !errName && !errNick && !errNotes && !errDate && name.trim().length > 0;
  }, [errName, errNick, errNotes, errDate, name]);

  // ---- Field validators
  useEffect(() => {
    const n = name.trim();
    if (!n) setErrName("Name is required.");
    else if (n.length > 40) setErrName("Max 40 characters.");
    else setErrName("");
  }, [name]);

  useEffect(() => {
    if (!nickname) return setErrNick("");
    if (nickname.length > 30) setErrNick("Max 30 characters.");
    else setErrNick("");
  }, [nickname]);

  useEffect(() => {
    if (!notes) return setErrNotes("");
    if (notes.length > 1000) setErrNotes("Max 1000 characters.");
    else setErrNotes("");
  }, [notes]);

  useEffect(() => {
    if (!nextWaterAt) {
      setErrDate("");
      return;
    }
    if (nextWaterAt < MIN_DATE) setErrDate("Date cannot be in the past.");
    else if (nextWaterAt > MAX_DATE)
      setErrDate(`Date cannot be more than 3 years in the future.`);
    else setErrDate("");
  }, [nextWaterAt]);

  // ---- Handlers
  const onChangeDate = (val: string) => {
    if (!val) return setNextWaterAt(undefined);
    // hard clamp
    if (val < MIN_DATE) return setNextWaterAt(MIN_DATE);
    if (val > MAX_DATE) return setNextWaterAt(MAX_DATE);
    setNextWaterAt(val);
  };

  const handleSave = () => {
    if (!isValid) return;
    const patch: Patch = {
      name: name.trim(),
      nickname: nickname.trim() || undefined,
      notes: notes.trim() || undefined,
      nextWaterAt: nextWaterAt || undefined,
    };
    onSave(patch);
  };

  // ---- UI
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Edit plant</h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monstera deliciosa"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errName && <p className="mt-1 text-xs text-red-500">{errName}</p>}
          </div>

          {/* Nickname */}
          <div>
            <label className="mb-1 block text-sm font-medium">Nickname (optional)</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Monty"
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errNick && <p className="mt-1 text-xs text-red-500">{errNick}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1 block text-sm font-medium">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Care notes, light, fert schedule..."
              className="w-full resize-y rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errNotes && <p className="mt-1 text-xs text-red-500">{errNotes}</p>}
          </div>

          {/* Next Water Date */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="block text-sm font-medium">Next water (optional)</label>
              <span className="text-xs text-zinc-500">
                Allowed: {MIN_DATE} to {MAX_DATE}
              </span>
            </div>
            <input
              type="date"
              value={nextWaterAt ?? ""}
              onChange={(e) => onChangeDate(e.target.value)}
              min={MIN_DATE}
              max={MAX_DATE}
              className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            {errDate && <p className="mt-1 text-xs text-red-500">{errDate}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
