// # START OF Inventory Demo Data - Sample data for inventory management
// Purpose: Provide comprehensive demo data for testing and development
// Contains: Various drug types, statuses, and scenarios
// Dependencies: Inventory types

import { DrugInventory, DrugCategory, Supplier, StockStatus } from "@/lib/types/inventory";

export const mockCategories: DrugCategory[] = [
  { id: '1', name: 'Herbisida', description: 'Obat pembasmi gulma dan tanaman pengganggu' },
  { id: '2', name: 'Insektisida', description: 'Obat pembasmi serangga hama tanaman' },
  { id: '3', name: 'Fungisida', description: 'Obat pembasmi jamur dan penyakit tanaman' },
  { id: '4', name: 'Bakterisida', description: 'Obat pembasmi bakteri patogen tanaman' },
  { id: '5', name: 'Akarisida', description: 'Obat pembasmi tungau dan kutu tanaman' },
  { id: '6', name: 'Nematisida', description: 'Obat pembasmi nematoda parasit tanaman' },
];

export const mockSuppliers: Supplier[] = [
  { 
    id: '1', 
    name: 'PT Agro Kimia Nusantara', 
    contact: '021-555-0001',
    address: 'Jakarta Selatan'
  },
  { 
    id: '2', 
    name: 'CV Tani Makmur Sejahtera', 
    contact: '021-555-0002',
    address: 'Bogor'
  },
  { 
    id: '3', 
    name: 'PT Pupuk dan Pestisida Indonesia', 
    contact: '021-555-0003',
    address: 'Bekasi'
  },
  { 
    id: '4', 
    name: 'UD Sarana Pertanian Mandiri', 
    contact: '0274-555-0004',
    address: 'Yogyakarta'
  },
  { 
    id: '5', 
    name: 'PT Bayer Indonesia', 
    contact: '021-555-0005',
    address: 'Jakarta Pusat'
  },
];

// Helper function to determine stock status
const getStockStatus = (stock: number, expiryDate: Date): StockStatus => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (expiryDate < now) return 'expired';
  if (expiryDate < thirtyDaysFromNow) return 'near_expiry';
  if (stock < 10) return 'low';
  return 'normal';
};

export const mockInventoryData: DrugInventory[] = [
  {
    id: '1',
    name: 'Roundup 486 SL',
    producer: 'Monsanto',
    content: 'Glifosat 486 g/l',
    category: mockCategories[0],
    supplier: mockSuppliers[0].name,
    stock: 150,
    unit: 'liter',
    largePack: { quantity: 20, unit: 'jerigen', itemsPerPack: 5 },
    entryDate: new Date('2024-01-15'),
    expiryDate: new Date('2026-01-15'),
    pricePerUnit: 125000,
    targetPest: ['Gulma daun lebar', 'Gulma rumput', 'Alang-alang'],
    storageLocation: 'Gudang A-1',
    notes: 'Simpan di tempat sejuk dan kering, jauhkan dari jangkauan anak-anak',
    barcode: 'RU486-240115-001',
    status: getStockStatus(150, new Date('2026-01-15')),
    lastUpdated: new Date('2024-01-20T10:30:00'),
    createdBy: 'Admin',
  },
  {
    id: '2',
    name: 'Decis 25 EC',
    producer: 'Bayer',
    content: 'Deltametrin 25 g/l',
    category: mockCategories[1],
    supplier: mockSuppliers[4].name,
    stock: 8,
    unit: 'liter',
    largePack: { quantity: 12, unit: 'dus', itemsPerPack: 1 },
    entryDate: new Date('2024-02-10'),
    expiryDate: new Date('2025-12-31'),
    pricePerUnit: 285000,
    targetPest: ['Penggerek batang', 'Ulat grayak', 'Thrips', 'Kutu daun'],
    storageLocation: 'Gudang B-2',
    notes: 'Insektisida kontak dan sistemik dengan efektivitas tinggi',
    barcode: 'DCS25-240210-002',
    status: getStockStatus(8, new Date('2025-12-31')),
    lastUpdated: new Date('2024-02-15T14:20:00'),
    createdBy: 'Staff Gudang',
    updatedBy: 'Supervisor'
  },
  {
    id: '3',
    name: 'Score 250 EC',
    producer: 'Syngenta',
    content: 'Difenokonazol 250 g/l',
    category: mockCategories[2],
    supplier: mockSuppliers[2].name,
    stock: 5,
    unit: 'liter',
    largePack: { quantity: 10, unit: 'box', itemsPerPack: 1 },
    entryDate: new Date('2023-11-20'),
    expiryDate: new Date('2024-02-15'),
    pricePerUnit: 450000,
    targetPest: ['Blast', 'Bercak daun', 'Antraknosa', 'Karat daun'],
    storageLocation: 'Gudang C-1',
    notes: 'Fungisida sistemik untuk pengendalian penyakit tanaman',
    barcode: 'SCR250-231120-003',
    status: getStockStatus(5, new Date('2024-02-15')),
    lastUpdated: new Date('2024-01-10T09:15:00'),
    createdBy: 'Admin',
  },
  {
    id: '4',
    name: 'Gramoxone 276 SL',
    producer: 'Syngenta',
    content: 'Paraquat diklorida 276 g/l',
    category: mockCategories[0],
    supplier: mockSuppliers[1].name,
    stock: 75,
    unit: 'liter',
    largePack: { quantity: 15, unit: 'jerigen', itemsPerPack: 5 },
    entryDate: new Date('2024-03-01'),
    expiryDate: new Date('2027-03-01'),
    pricePerUnit: 95000,
    targetPest: ['Gulma annual', 'Gulma perennial', 'Rumput liar'],
    storageLocation: 'Gudang A-2',
    notes: 'Herbisida kontak non-selektif, gunakan dengan hati-hati',
    barcode: 'GMX276-240301-004',
    status: getStockStatus(75, new Date('2027-03-01')),
    lastUpdated: new Date('2024-03-05T11:45:00'),
    createdBy: 'Staff Gudang',
  },
  {
    id: '5',
    name: 'Confidor 200 SL',
    producer: 'Bayer',
    content: 'Imidakloprid 200 g/l',
    category: mockCategories[1],
    supplier: mockSuppliers[4].name,
    stock: 3,
    unit: 'liter',
    largePack: { quantity: 8, unit: 'dus', itemsPerPack: 1 },
    entryDate: new Date('2024-01-25'),
    expiryDate: new Date('2024-12-25'),
    pricePerUnit: 320000,
    targetPest: ['Wereng', 'Aphid', 'Kutu kebul', 'Trips'],
    storageLocation: 'Gudang B-1',
    notes: 'Insektisida sistemik dengan daya tahan lama',
    barcode: 'CFD200-240125-005',
    status: getStockStatus(3, new Date('2024-12-25')),
    lastUpdated: new Date('2024-02-28T16:30:00'),
    createdBy: 'Admin',
    updatedBy: 'Manager'
  },
  {
    id: '6',
    name: 'Antracol 70 WP',
    producer: 'Bayer',
    content: 'Propineb 70%',
    category: mockCategories[2],
    supplier: mockSuppliers[4].name,
    stock: 45,
    unit: 'kg',
    largePack: { quantity: 25, unit: 'karung', itemsPerPack: 1 },
    entryDate: new Date('2024-02-15'),
    expiryDate: new Date('2026-02-15'),
    pricePerUnit: 85000,
    targetPest: ['Busuk daun', 'Bercak ungu', 'Downy mildew'],
    storageLocation: 'Gudang C-2',
    notes: 'Fungisida kontak berbentuk tepung dapat disebar',
    barcode: 'ANT70-240215-006',
    status: getStockStatus(45, new Date('2026-02-15')),
    lastUpdated: new Date('2024-02-20T08:00:00'),
    createdBy: 'Staff Gudang',
  },
  {
    id: '7',
    name: 'Curacron 500 EC',
    producer: 'Syngenta',
    content: 'Profenofos 500 g/l',
    category: mockCategories[1],
    supplier: mockSuppliers[2].name,
    stock: 2,
    unit: 'liter',
    largePack: { quantity: 6, unit: 'dus', itemsPerPack: 1 },
    entryDate: new Date('2023-10-15'),
    expiryDate: new Date('2024-03-15'),
    pricePerUnit: 275000,
    targetPest: ['Ulat buah', 'Penggerek polong', 'Ulat grayak'],
    storageLocation: 'Gudang B-3',
    notes: 'Insektisida dan akarisida dengan spektrum luas',
    barcode: 'CRC500-231015-007',
    status: getStockStatus(2, new Date('2024-03-15')),
    lastUpdated: new Date('2024-01-05T13:20:00'),
    createdBy: 'Admin',
  },
  {
    id: '8',
    name: 'Dithane M-45',
    producer: 'Dow AgroSciences',
    content: 'Mankozeb 80%',
    category: mockCategories[2],
    supplier: mockSuppliers[3].name,
    stock: 0,
    unit: 'kg',
    largePack: { quantity: 20, unit: 'sak', itemsPerPack: 1 },
    entryDate: new Date('2023-08-10'),
    expiryDate: new Date('2024-01-10'),
    pricePerUnit: 72000,
    targetPest: ['Bercak daun', 'Bulai', 'Hawar daun'],
    storageLocation: 'Gudang C-3',
    notes: 'Stok habis - perlu reorder segera',
    barcode: 'DTM45-230810-008',
    status: getStockStatus(0, new Date('2024-01-10')),
    lastUpdated: new Date('2024-01-15T17:45:00'),
    createdBy: 'Staff Gudang',
    updatedBy: 'Supervisor'
  },
  {
    id: '9',
    name: 'Regent 50 SC',
    producer: 'BASF',
    content: 'Fipronil 50 g/l',
    category: mockCategories[1],
    supplier: mockSuppliers[1].name,
    stock: 25,
    unit: 'liter',
    largePack: { quantity: 10, unit: 'jerigen', itemsPerPack: 2.5 },
    entryDate: new Date('2024-02-28'),
    expiryDate: new Date('2026-02-28'),
    pricePerUnit: 180000,
    targetPest: ['Wereng batang coklat', 'Penggerek batang', 'Ganjur'],
    storageLocation: 'Gudang B-4',
    notes: 'Insektisida sistemik untuk tanaman padi',
    barcode: 'RGT50-240228-009',
    status: getStockStatus(25, new Date('2026-02-28')),
    lastUpdated: new Date('2024-03-02T12:10:00'),
    createdBy: 'Admin',
  },
  {
    id: '10',
    name: 'Bayleton 25 WP',
    producer: 'Bayer',
    content: 'Triadimefon 25%',
    category: mockCategories[2],
    supplier: mockSuppliers[4].name,
    stock: 12,
    unit: 'kg',
    largePack: { quantity: 8, unit: 'dus', itemsPerPack: 1 },
    entryDate: new Date('2024-01-10'),
    expiryDate: new Date('2024-04-10'),
    pricePerUnit: 150000,
    targetPest: ['Karat', 'Embun tepung', 'Bercak coklat'],
    storageLocation: 'Gudang C-4',
    notes: 'Fungisida sistemik untuk pencegahan dan pengobatan',
    barcode: 'BYL25-240110-010',
    status: getStockStatus(12, new Date('2024-04-10')),
    lastUpdated: new Date('2024-02-15T09:30:00'),
    createdBy: 'Staff Gudang',
  },
];

// Helper functions for demo data
export const getInventoryByStatus = (status: StockStatus): DrugInventory[] => {
  return mockInventoryData.filter(item => item.status === status);
};

export const getInventoryByCategory = (categoryId: string): DrugInventory[] => {
  return mockInventoryData.filter(item => item.category.id === categoryId);
};

export const getInventoryBySupplier = (supplierName: string): DrugInventory[] => {
  return mockInventoryData.filter(item => item.supplier === supplierName);
};

export const getLowStockItems = (): DrugInventory[] => {
  return mockInventoryData.filter(item => item.stock < 10);
};

export const getExpiredItems = (): DrugInventory[] => {
  return mockInventoryData.filter(item => item.status === 'expired');
};

export const getNearExpiryItems = (): DrugInventory[] => {
  return mockInventoryData.filter(item => item.status === 'near_expiry');
};

export const getTotalStockValue = (): number => {
  return mockInventoryData.reduce((total, item) => {
    return total + (item.stock * (item.pricePerUnit || 0));
  }, 0);
};

// # END OF Inventory Demo Data 