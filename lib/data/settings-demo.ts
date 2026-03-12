import { User } from '@/lib/types/user';

export type SettingsOption = {
  label: string;
  value: string;
};

export const settingsLanguageOptions: SettingsOption[] = [
  { label: 'Bahasa Indonesia', value: 'id' },
  { label: 'English', value: 'en' },
];

export const settingsTimezoneOptions: SettingsOption[] = [
  { label: 'Asia/Jakarta (WIB)', value: 'Asia/Jakarta' },
  { label: 'Asia/Makassar (WITA)', value: 'Asia/Makassar' },
  { label: 'Asia/Jayapura (WIT)', value: 'Asia/Jayapura' },
];

export const settingsDateFormatOptions: SettingsOption[] = [
  { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
  { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
  { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
];

export const applicationPreferenceDefaults = {
  language: 'id',
  timezone: 'Asia/Jakarta',
  dateFormat: 'DD/MM/YYYY',
  compactMode: false,
  autoSaveDraft: true,
  stockAlert: true,
  transactionAlert: true,
};

/** Mock data: Current logged-in user for settings page (frontend-only) */
export const currentUserMock: User = {
  id: 'user-006',
  username: 'ppl.palang01',
  name: 'Wahyu Hidayat, S.P.',
  email: 'wahyu.hidayat@dinaspertanian.tuban.go.id',
  role: 'PPL',
  avatar: '/images/avatar/avatar-5.png',
  status: 'active',
  isActive: true,
  lastLogin: '2026-03-12T08:30:00Z',
  nip: '199201082016011001',
  phone: '081789012345',
  birthDate: '1992-01-08',
  address: 'Jl. Raya Palang No. 12, Kec. Palang, Kab. Tuban',
  pangkat: 'Penata Muda Tk. I',
  golongan: 'III/b',
  jabatan: 'Penyuluh Pertanian Lapangan',
  lokasi: 'Palang',
  createdAt: '2024-06-01T00:00:00Z',
  updatedAt: '2026-03-10T08:30:00Z',
};
