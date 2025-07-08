import { MedicineData } from './qr-label-template';

/**
 * Utility functions untuk QR Label Template (Pestisida/Obat Pertanian)
 */

/**
 * Generate QR code data string from agriculture medicine/pesticide
 */
export const generateQRData = (medicine: MedicineData): string => {
  return JSON.stringify({
    id: medicine.id,
    name: medicine.name,
    producer: medicine.producer,
    location: medicine.location,
    expiryDate: medicine.expiryDate
  });
};

/**
 * Validate agriculture medicine/pesticide data
 */
export const validateMedicineData = (medicine: MedicineData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!medicine.id.trim()) errors.push('ID pestisida harus diisi');
  if (!medicine.name.trim()) errors.push('Nama pestisida harus diisi');
  if (!medicine.producer.trim()) errors.push('Nama produsen harus diisi');
  if (!medicine.activeIngredient.trim()) errors.push('Kandungan aktif harus diisi');
  if (!medicine.source.trim()) errors.push('Sumber harus diisi');
  if (!medicine.entryDate.trim()) errors.push('Tanggal masuk harus diisi');
  if (!medicine.expiryDate.trim()) errors.push('Tanggal kadaluarsa harus diisi');
  if (!medicine.location.trim()) errors.push('Lokasi harus diisi');

  // Validate date format
  if (medicine.entryDate && !isValidDate(medicine.entryDate)) {
    errors.push('Format tanggal masuk tidak valid');
  }
  if (medicine.expiryDate && !isValidDate(medicine.expiryDate)) {
    errors.push('Format tanggal kadaluarsa tidak valid');
  }

  // Validate expiry date is after entry date
  if (medicine.entryDate && medicine.expiryDate) {
    const entryDate = new Date(medicine.entryDate);
    const expiryDate = new Date(medicine.expiryDate);
    if (expiryDate <= entryDate) {
      errors.push('Tanggal kadaluarsa harus setelah tanggal masuk');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Check if date string is valid
 */
const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Format source string (APBN, APBD, CSR)
 */
export const formatSource = (type: 'APBN' | 'APBD' | 'CSR', year: number, company?: string): string => {
  switch (type) {
    case 'APBN':
      return `APBN-${year}`;
    case 'APBD':
      return `APBD-${year}`;
    case 'CSR':
      return company ? `CSR ${company}-${year}` : `CSR-${year}`;
    default:
      return `${type}-${year}`;
  }
};

/**
 * Chunk medicines array into pages (12 per page)
 */
export const chunkMedicinesForPages = (medicines: MedicineData[]): MedicineData[][] => {
  const pages: MedicineData[][] = [];
  const itemsPerPage = 12;

  for (let i = 0; i < medicines.length; i += itemsPerPage) {
    pages.push(medicines.slice(i, i + itemsPerPage));
  }

  return pages;
};

/**
 * Convert agriculture medicine/pesticide data from API/database format
 */
export const convertToMedicineData = (rawData: any): MedicineData => {
  return {
    id: rawData.id || rawData.medicine_id || '',
    name: rawData.name || rawData.medicine_name || '',
    producer: rawData.producer || rawData.manufacturer || '',
    activeIngredient: rawData.activeIngredient || rawData.active_ingredient || rawData.composition || '',
    source: rawData.source || rawData.funding_source || '',
    entryDate: rawData.entryDate || rawData.entry_date || rawData.received_date || '',
    expiryDate: rawData.expiryDate || rawData.expiry_date || rawData.expired_date || '',
    location: rawData.location || rawData.storage_location || rawData.rack_location || ''
  };
};

/**
 * Generate batch of agriculture medicine/pesticide data for testing
 */
export const generateTestMedicines = (count: number = 12): MedicineData[] => {
  const medicines: MedicineData[] = [];
  const sampleNames = [
    'Herbisida Roundup 200ml',
    'Insektisida Decis 100ml',
    'Fungisida Antracol 250g',
    'Pupuk NPK 16-16-16 1kg',
    'ZPT Atonik 100ml',
    'Bakterisida Agrept 200g'
  ];
  const sampleProducers = [
    'PT. Syngenta Indonesia',
    'PT. Bayer Indonesia', 
    'PT. BASF Indonesia',
    'PT. Pupuk Kujang',
    'PT. Petrokimia Gresik'
  ];
  const sampleSources = ['APBN-2024', 'APBD-2024', 'CSR PT. Agro-2024'];

  for (let i = 0; i < count; i++) {
    medicines.push({
      id: `MED${String(i + 1).padStart(3, '0')}`,
      name: sampleNames[i % sampleNames.length],
      producer: sampleProducers[i % sampleProducers.length],
      activeIngredient: sampleNames[i % sampleNames.length].split(' ')[0],
      source: sampleSources[i % sampleSources.length],
      entryDate: new Date(2024, Math.floor(i / 4), (i % 4) * 7 + 1).toISOString().split('T')[0],
      expiryDate: new Date(2025 + Math.floor(i / 6), Math.floor(i / 4), (i % 4) * 7 + 1).toISOString().split('T')[0],
      location: `Rak ${String.fromCharCode(65 + Math.floor(i / 3))}-${(i % 3) + 1}`
    });
  }

  return medicines;
};

/**
 * Export configuration object
 */
export const labelConfig = {
  // Ukuran dalam cm
  paperSize: {
    width: 17.58,
    height: 22.27
  },
  labelSize: {
    width: 7.44,
    height: 3.36
  },
  grid: {
    columns: 2,
    rows: 6
  },
  spacing: {
    gap: 0.42
  },
  margins: {
    top: 0.7,
    right: 0.51,
    bottom: 1.27,
    left: 0.77
  }
};
