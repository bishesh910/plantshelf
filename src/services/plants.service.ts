import { db } from "../lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Plant } from "../types/plant";

const colRef = (uid: string) => collection(db, `users/${uid}/plants`);

export async function listPlants(uid: string): Promise<Plant[]> {
  const q = query(colRef(uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

export async function isNameUnique(
  uid: string,
  name: string,
  excludeId?: string
): Promise<boolean> {
  const q = query(colRef(uid), where("nameLower", "==", name.toLowerCase()));
  const snap = await getDocs(q);
  return snap.docs.every((d) => d.id === excludeId);
}

export async function addPlant(uid: string, data: Partial<Plant>) {
  const now = Date.now();
  const payload: Omit<Plant, "id"> = {
    name: (data.name || "").trim(),
    nameLower: (data.name || "").trim().toLowerCase(),
    nickname: (data.nickname || "").trim() || undefined,
    notes: (data.notes || "").trim() || undefined,
    nextWaterAt: data.nextWaterAt || undefined,
    favorite: Boolean(data.favorite),
    createdAt: now,
    updatedAt: now,
  };
  return await addDoc(colRef(uid), payload);
}

export async function updatePlant(uid: string, id: string, data: Partial<Plant>) {
  const ref = doc(db, `users/${uid}/plants/${id}`);
  const payload: Partial<Plant> = {
    ...(data.name ? { name: data.name.trim(), nameLower: data.name.trim().toLowerCase() } : {}),
    ...(data.nickname !== undefined ? { nickname: data.nickname?.trim() || undefined } : {}),
    ...(data.notes !== undefined ? { notes: data.notes?.trim() || undefined } : {}),
    ...(data.nextWaterAt !== undefined ? { nextWaterAt: data.nextWaterAt } : {}),
    ...(data.favorite !== undefined ? { favorite: Boolean(data.favorite) } : {}),
    updatedAt: Date.now(),
  };
  await updateDoc(ref, payload as any);
}

export async function deletePlant(uid: string, id: string) {
  const ref = doc(db, `users/${uid}/plants/${id}`);
  await deleteDoc(ref);
}

export async function toggleFavorite(uid: string, id: string, fav: boolean) {
  return updatePlant(uid, id, { favorite: fav });
}