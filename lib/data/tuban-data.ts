import tubanRegion from "@/lib/data/tuban-region.json";

export interface Village {
  name: string;
}

export interface District {
  name: string;
  villages: Village[];
}

type TubanRegionDistrict = {
  id: string;
  name: string;
};

type TubanRegionVillage = {
  id: string;
  kecamatanId: string;
  name: string;
};

type TubanRegionData = {
  kecamatan: TubanRegionDistrict[];
  desa: TubanRegionVillage[];
};

const regionData = tubanRegion as TubanRegionData;

const villagesByDistrictId = regionData.desa.reduce<Record<string, Village[]>>((accumulator, village) => {
  if (!accumulator[village.kecamatanId]) {
    accumulator[village.kecamatanId] = [];
  }

  accumulator[village.kecamatanId].push({ name: village.name });
  return accumulator;
}, {});

export const TUBAN_DATA: District[] = regionData.kecamatan
  .map((district) => ({
    name: district.name,
    villages: villagesByDistrictId[district.id] ?? [],
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "id"));
