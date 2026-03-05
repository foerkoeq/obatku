import { TUBAN_DATA } from "@/lib/data/tuban-data";

export type DaerahTubanItem = {
	kecamatan: string;
	desa: string[];
};

export const TUBAN_DAERAH: DaerahTubanItem[] = TUBAN_DATA.map((district) => ({
	kecamatan: district.name,
	desa: district.villages.map((village) => village.name),
}));

export const TUBAN_KECAMATAN = TUBAN_DAERAH.map((item) => item.kecamatan).sort((a, b) =>
	a.localeCompare(b, "id")
);
