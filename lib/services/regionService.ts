// src/services/regionService.ts
import regionData from '@/lib/data/tuban-region.json'; // Import JSON langsung
import { Kecamatan, Desa } from '../types/region';

// Otomatis TypeScript tahu isinya karena JSON statis
const ALL_KECAMATAN = regionData.kecamatan as Kecamatan[];
const ALL_DESA = regionData.desa as Desa[];

export const getAllKecamatan = async (): Promise<Kecamatan[]> => {
  return ALL_KECAMATAN;
};

export const getDesaByKecamatan = async (kecamatanId: string): Promise<Desa[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return ALL_DESA.filter((desa) => desa.kecamatanId === kecamatanId);
};