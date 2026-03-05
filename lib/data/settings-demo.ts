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
