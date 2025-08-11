export type Plant = {
  id: string;
  name: string;           // 1–40 chars, unique per user
  nameLower: string;      // derived, for uniqueness checks
  nickname?: string;      // 0–30
  notes?: string;         // 0–1000
  nextWaterAt?: string;   // ISO yyyy-mm-dd (UI date value)
  favorite: boolean;
  createdAt: number;      // Date.now()
  updatedAt: number;      // Date.now()
};