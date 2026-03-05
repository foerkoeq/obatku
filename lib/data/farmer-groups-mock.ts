import { TUBAN_DAERAH } from "@/lib/data/tuban-daerah";

export type FarmerGroupType = "Poktan" | "Gapoktan";

export interface FarmerLeader {
  nama: string;
  nik: string;
  noHp: string;
}

export interface PoktanMember {
  namaPoktan: string;
  ketua: FarmerLeader;
}

export interface FarmerGroup {
  id: string;
  kecamatan: string;
  desa: string;
  jenis: FarmerGroupType;
  namaKelompokTani: string;
  namaGapoktan?: string;
  ketuaGapoktan?: FarmerLeader;
  poktan: PoktanMember[];
}

interface GapoktanSeed {
  kecamatan: string;
  desa?: string;
  desaIndex?: number;
  namaGapoktan: string;
  ketuaGapoktanNama: string;
  poktan: Array<{
    namaPoktan: string;
    ketuaNama: string;
  }>;
}

interface PoktanMandiriSeed {
  kecamatan: string;
  desa?: string;
  desaIndex?: number;
  namaPoktan: string;
  ketuaNama: string;
}

const pickDaerah = (kecamatanName: string, villageName?: string, villageIndex = 0) => {
  const daerah = TUBAN_DAERAH.find((item) => item.kecamatan === kecamatanName);

  const desaByName = villageName && daerah?.desa.includes(villageName) ? villageName : undefined;
  const desaByIndex = daerah?.desa[villageIndex];

  return {
    kecamatan: daerah?.kecamatan ?? kecamatanName,
    desa: desaByName ?? desaByIndex ?? villageName ?? "-",
  };
};

const GAPOKTAN_SEEDS: GapoktanSeed[] = [
  {
    kecamatan: "Semanding",
    desa: "Bektiharjo",
    namaGapoktan: "Gapoktan Tani Makmur Semanding",
    ketuaGapoktanNama: "Sutrisno",
    poktan: [
      { namaPoktan: "Poktan Sumber Rejeki", ketuaNama: "Kusnadi" },
      { namaPoktan: "Poktan Karya Tani", ketuaNama: "Wagimin" },
      { namaPoktan: "Poktan Subur Lestari", ketuaNama: "Miskan" },
    ],
  },
  {
    kecamatan: "Jenu",
    desa: "Kaliuntu",
    namaGapoktan: "Gapoktan Bina Tani Jenu",
    ketuaGapoktanNama: "Abdul Rahman",
    poktan: [
      { namaPoktan: "Poktan Harapan Tani", ketuaNama: "Rohman" },
      { namaPoktan: "Poktan Tani Jaya", ketuaNama: "Mulyono" },
      { namaPoktan: "Poktan Sejahtera Jenu", ketuaNama: "Darsono" },
    ],
  },
  {
    kecamatan: "Bancar",
    desa: "Bulumeduro",
    namaGapoktan: "Gapoktan Margo Tani Bancar",
    ketuaGapoktanNama: "Sugeng Riyadi",
    poktan: [
      { namaPoktan: "Poktan Tani Subur Bancar", ketuaNama: "Suharto" },
      { namaPoktan: "Poktan Lestari Pesisir", ketuaNama: "Sutaji" },
      { namaPoktan: "Poktan Nelayan Sawah", ketuaNama: "Kasturi" },
    ],
  },
  {
    kecamatan: "Montong",
    desa: "Manjung",
    namaGapoktan: "Gapoktan Tirto Makmur Montong",
    ketuaGapoktanNama: "Imam Syafi'i",
    poktan: [
      { namaPoktan: "Poktan Tirto Rukun", ketuaNama: "Sukarji" },
      { namaPoktan: "Poktan Makmur Abadi", ketuaNama: "Jumadi" },
      { namaPoktan: "Poktan Wono Asri", ketuaNama: "Parno" },
    ],
  },
  {
    kecamatan: "Palang",
    desa: "Ketambul",
    namaGapoktan: "Gapoktan Mina Tani Palang",
    ketuaGapoktanNama: "Nurhadi",
    poktan: [
      { namaPoktan: "Poktan Padi Bahari", ketuaNama: "Suyanto" },
      { namaPoktan: "Poktan Pesisir Makmur", ketuaNama: "Slamet Widodo" },
      { namaPoktan: "Poktan Sari Laut Tani", ketuaNama: "Miftah" },
    ],
  },
  {
    kecamatan: "Merakurak",
    desa: "Kapu",
    namaGapoktan: "Gapoktan Karya Muda Merakurak",
    ketuaGapoktanNama: "Budi Santoso",
    poktan: [
      { namaPoktan: "Poktan Tunas Harapan", ketuaNama: "Kasdi" },
      { namaPoktan: "Poktan Gemah Ripah", ketuaNama: "Arifin" },
      { namaPoktan: "Poktan Tani Mapan", ketuaNama: "Sukirno" },
    ],
  },
  {
    kecamatan: "Kerek",
    desa: "Kasiman",
    namaGapoktan: "Gapoktan Sumber Urip Kerek",
    ketuaGapoktanNama: "Aminudin",
    poktan: [
      { namaPoktan: "Poktan Wira Tani", ketuaNama: "Rasman" },
      { namaPoktan: "Poktan Barokah Tani", ketuaNama: "Sofyan" },
      { namaPoktan: "Poktan Kembang Sari", ketuaNama: "Nurdin" },
    ],
  },
  {
    kecamatan: "Parengan",
    desa: "Kumpulrejo",
    namaGapoktan: "Gapoktan Agro Lestari Parengan",
    ketuaGapoktanNama: "Sukardi",
    poktan: [
      { namaPoktan: "Poktan Mulyo Tani", ketuaNama: "Heri Purnomo" },
      { namaPoktan: "Poktan Karya Bakti", ketuaNama: "Sutopo" },
      { namaPoktan: "Poktan Mekar Sari", ketuaNama: "Jaswadi" },
    ],
  },
  {
    kecamatan: "Plumpang",
    desa: "Jatimulyo",
    namaGapoktan: "Gapoktan Tirta Tani Plumpang",
    ketuaGapoktanNama: "Mochamad Toha",
    poktan: [
      { namaPoktan: "Poktan Padi Jembar", ketuaNama: "Saifullah" },
      { namaPoktan: "Poktan Sumber Pangan", ketuaNama: "Yatno" },
      { namaPoktan: "Poktan Guyub Rukun", ketuaNama: "Fathoni" },
    ],
  },
  {
    kecamatan: "Rengel",
    desa: "Karangtinoto",
    namaGapoktan: "Gapoktan Sumber Makmur Rengel",
    ketuaGapoktanNama: "Khaerul Anam",
    poktan: [
      { namaPoktan: "Poktan Margo Jaya", ketuaNama: "Tarmin" },
      { namaPoktan: "Poktan Lumbung Pangan", ketuaNama: "Yusuf" },
      { namaPoktan: "Poktan Bumi Tani", ketuaNama: "Tohari" },
    ],
  },
  {
    kecamatan: "Soko",
    desa: "Kenongosari",
    namaGapoktan: "Gapoktan Panen Raya Soko",
    ketuaGapoktanNama: "Subekti",
    poktan: [
      { namaPoktan: "Poktan Tani Joyo", ketuaNama: "Sumarno" },
      { namaPoktan: "Poktan Asri Makmur", ketuaNama: "Zainal" },
      { namaPoktan: "Poktan Maju Bersama", ketuaNama: "Ridwan" },
    ],
  },
  {
    kecamatan: "Tambakboyo",
    desa: "Kenanti",
    namaGapoktan: "Gapoktan Sido Tani Tambakboyo",
    ketuaGapoktanNama: "Masrukin",
    poktan: [
      { namaPoktan: "Poktan Bahari Tani", ketuaNama: "Muslimin" },
      { namaPoktan: "Poktan Mina Padi", ketuaNama: "Rizki" },
      { namaPoktan: "Poktan Tegal Sari", ketuaNama: "Ropi'i" },
    ],
  },
];

const POKTAN_MANDIRI_SEEDS: PoktanMandiriSeed[] = [
  { kecamatan: "Bangilan", desa: "Kablukan", namaPoktan: "Poktan Mekar Bangilan", ketuaNama: "Supriyadi" },
  { kecamatan: "Grabagan", desa: "Gesikan", namaPoktan: "Poktan Sumber Hasil", ketuaNama: "Giman" },
  { kecamatan: "Jatirogo", desa: "Karangtengah", namaPoktan: "Poktan Sekar Tani", ketuaNama: "Wahyudi" },
  { kecamatan: "Kenduruan", desa: "Jlodro", namaPoktan: "Poktan Karya Kenduruan", ketuaNama: "Mukhlis" },
  { kecamatan: "Senori", desa: "Leran", namaPoktan: "Poktan Harapan Senori", ketuaNama: "Nursalim" },
  { kecamatan: "Singgahan", desa: "Laju Lor", namaPoktan: "Poktan Mugi Rahayu", ketuaNama: "Wakijan" },
  { kecamatan: "Tuban", desa: "Kutorejo", namaPoktan: "Poktan Urban Tani Tuban", ketuaNama: "Yudi Prasetyo" },
  { kecamatan: "Widang", desa: "Minohorejo", namaPoktan: "Poktan Wono Widang", ketuaNama: "Kholik" },
];

let leaderSeed = 1;

const createLeader = (nama: string): FarmerLeader => {
  const currentSeed = leaderSeed;
  leaderSeed += 1;

  return {
    nama,
    nik: `3523${String(currentSeed).padStart(12, "0")}`,
    noHp: `08123${String(currentSeed).padStart(7, "0")}`,
  };
};

const gapoktanGroups: FarmerGroup[] = GAPOKTAN_SEEDS.map((seed, index) => {
  const lokasi = pickDaerah(seed.kecamatan, seed.desa, seed.desaIndex);

  return {
    id: `fg-g-${String(index + 1).padStart(3, "0")}`,
    kecamatan: lokasi.kecamatan,
    desa: lokasi.desa,
    jenis: "Gapoktan",
    namaKelompokTani: seed.namaGapoktan,
    namaGapoktan: seed.namaGapoktan,
    ketuaGapoktan: createLeader(seed.ketuaGapoktanNama),
    poktan: seed.poktan.map((item) => ({
      namaPoktan: item.namaPoktan,
      ketua: createLeader(item.ketuaNama),
    })),
  };
});

const poktanDariGapoktan: FarmerGroup[] = gapoktanGroups.flatMap((group, groupIndex) =>
  group.poktan.map((item, itemIndex) => ({
    id: `fg-gp-${String(groupIndex + 1).padStart(3, "0")}-${String(itemIndex + 1).padStart(2, "0")}`,
    kecamatan: group.kecamatan,
    desa: group.desa,
    jenis: "Poktan" as const,
    namaKelompokTani: item.namaPoktan,
    namaGapoktan: group.namaGapoktan,
    poktan: [
      {
        namaPoktan: item.namaPoktan,
        ketua: item.ketua,
      },
    ],
  }))
);

const poktanMandiriGroups: FarmerGroup[] = POKTAN_MANDIRI_SEEDS.map((seed, index) => {
  const lokasi = pickDaerah(seed.kecamatan, seed.desa, seed.desaIndex);

  return {
    id: `fg-p-${String(index + 1).padStart(3, "0")}`,
    kecamatan: lokasi.kecamatan,
    desa: lokasi.desa,
    jenis: "Poktan",
    namaKelompokTani: seed.namaPoktan,
    poktan: [
      {
        namaPoktan: seed.namaPoktan,
        ketua: createLeader(seed.ketuaNama),
      },
    ],
  };
});

export const farmerGroupsMock: FarmerGroup[] = [
  ...gapoktanGroups,
  ...poktanDariGapoktan,
  ...poktanMandiriGroups,
];

export const getFarmerGroupById = (id: string): FarmerGroup | undefined => {
  return farmerGroupsMock.find((item) => item.id === id);
};
