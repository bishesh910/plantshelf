import { db } from "../lib/firebase";
import {
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  doc,
  query,
  where,
} from "firebase/firestore";

// Keep this in one place so components can import the same shape
export interface Plant {
  id: string;
  name: string;
  nameLower: string;
  nickname?: string;
  notes?: string;
  // Stored as "YYYY-MM-DD" (string)
  nextWaterAt?: string;
  favorite: boolean;
  createdAt: number; // millis (int)
  updatedAt: number; // millis (int)
}

function plantsCol(uid: string) {
  return collection(db, `users/${uid}/plants`);
}

/** Helper: normalize any date string into YYYY-MM-DD or undefined */
function toYMD(input?: string): string | undefined {
  if (!input) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input; // already correct
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Subscribe to all plants for a user. Client can sort/filter. */
export function listPlants(
  uid: string,
  onChange: (plants: Plant[]) => void
) {
  const q = query(plantsCol(uid));
  return onSnapshot(q, (snap) => {
    const items: Plant[] = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Plant, "id">),
    }));
    onChange(items);
  });
}

/** Add a plant. Assumes caller already checked name uniqueness. */
export async function addPlant(
  uid: string,
  data: {
    name: string;
    nickname?: string;
    notes?: string;
    nextWaterAt?: string; // any string date, will normalize
    favorite?: boolean;
  }
) {
  const now = Date.now();
  const docData: Omit<Plant, "id"> = {
    name: data.name,
    nameLower: data.name.toLowerCase(),
    nickname: data.nickname || undefined,
    notes: data.notes || undefined,
    nextWaterAt: toYMD(data.nextWaterAt),
    favorite: Boolean(data.favorite),
    createdAt: now,
    updatedAt: now,
  };


  try {
  await addDoc(plantsCol(uid), docData);
} catch (e: any) {
  if (import.meta.env.DEV) {
    console.error("addPlant failed:", e?.code, e?.message);
  }
  throw e;
}
}


/** Update fields on a plant. If name changes, you should call isNameUnique before this. */
export async function updatePlant(
  uid: string,
  plantId: string,
  patch: Partial<Pick<Plant, "name" | "nickname" | "notes" | "nextWaterAt" | "favorite">>
) {
  const ref = doc(db, `users/${uid}/plants/${plantId}`);
  const update: any = { updatedAt: Date.now() };

  if (patch.name !== undefined) {
    update.name = patch.name;
    update.nameLower = patch.name.toLowerCase();
  }
  if (patch.nickname !== undefined) update.nickname = patch.nickname || undefined;
  if (patch.notes !== undefined) update.notes = patch.notes || undefined;
  if (patch.nextWaterAt !== undefined) update.nextWaterAt = toYMD(patch.nextWaterAt);
  if (patch.favorite !== undefined) update.favorite = !!patch.favorite;

  await updateDoc(ref, update);
}

/** Delete a plant. */
export async function deletePlant(uid: string, plantId: string) {
  const ref = doc(db, `users/${uid}/plants/${plantId}`);
  await deleteDoc(ref);
}

/** Toggle favorite (or set to a specific value). */
export async function toggleFavorite(
  uid: string,
  plantId: string,
  next?: boolean
) {
  const ref = doc(db, `users/${uid}/plants/${plantId}`);
  await updateDoc(ref, {
    favorite: next,
    updatedAt: Date.now(),
  } as any);
}

/** Case-insensitive uniqueness check for name within a user. */
export async function isNameUnique(
  uid: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const q = query(plantsCol(uid), where("nameLower", "==", name.toLowerCase()));
  const snap = await getDocs(q);
  const dup = snap.docs.find((d) => d.id !== excludeId);
  return !dup;
}
