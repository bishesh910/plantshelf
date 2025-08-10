import { db } from "../../lib/firebase";
import {
  addDoc, collection, serverTimestamp, getDocs, query, where, orderBy,
  doc, deleteDoc, updateDoc
} from "firebase/firestore";

export async function addPlant(userId: string, data: {
  name: string;
  species?: string;
  lastWatered?: string;
  notes?: string;
  nextWaterOn?: string;
}) {
  const colRef = collection(db, "plants");
  await addDoc(colRef, {
    userId,
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function listPlants(userId: string) {
  const colRef = collection(db, "plants");
  const q = query(colRef, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as any),
  }));
}

export async function removePlant(plantId: string) {
  await deleteDoc(doc(db, "plants", plantId));
}

export async function updatePlant(plantId: string, data: Partial<{
  name: string;
  species?: string;
  lastWatered?: string;
  notes?: string;
  nextWaterOn?: string;
}>) {
  await updateDoc(doc(db, "plants", plantId), data as any);
}
