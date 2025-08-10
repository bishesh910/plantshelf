export type Plant = {
  id: string;
  name: string;
  species?: string;
  lastWatered?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: number | any; // Firestore timestamp/number
  nextWaterOn?: string;
  userId?: string; // stored but filtered via rules
};
