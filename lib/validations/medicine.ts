// # START OF Medicine Validation Schema - Centralized validation for medicine forms
// Purpose: Provides validation schemas and utilities for medicine-related forms
// Features: Add medicine validation, edit medicine validation, form utilities
// Returns: Zod schemas and validation utilities
// Dependencies: zod, date validation utilities

import { z } from "zod";

// Base medicine validation schema
const baseMedicineSchema = {
  name: z
    .string()
    .min(1, "Nama obat wajib diisi")
    .min(3, "Nama obat minimal 3 karakter")
    .max(100, "Nama obat maksimal 100 karakter"),
  
  producer: z
    .string()
    .min(1, "Produsen wajib diisi")
    .max(50, "Nama produsen maksimal 50 karakter"),
  
  content: z
    .string()
    .min(1, "Kandungan wajib diisi")
    .max(200, "Kandungan maksimal 200 karakter"),
  
  categoryId: z
    .string()
    .min(1, "Kategori wajib dipilih"),
  
  supplier: z
    .string()
    .min(1, "Supplier wajib diisi"),
  
  stock: z
    .number()
    .min(0, "Stok tidak boleh negatif")
    .max(999999, "Stok maksimal 999,999 unit"),
  
  unit: z
    .string()
    .min(1, "Satuan wajib diisi"),
  
  largePack: z.object({
    quantity: z
      .number()
      .min(0, "Jumlah kemasan tidak boleh negatif")
      .max(9999, "Jumlah kemasan maksimal 9,999"),
    
    unit: z
      .string()
      .min(1, "Satuan kemasan wajib diisi"),
    
    itemsPerPack: z
      .number()
      .min(1, "Jumlah per kemasan minimal 1")
      .max(1000, "Jumlah per kemasan maksimal 1,000"),
  }),
  
  pricePerUnit: z
    .number()
    .min(0, "Harga tidak boleh negatif")
    .max(999999999, "Harga terlalu tinggi")
    .optional(),
  
  targetPest: z
    .string()
    .min(1, "Jenis OPT wajib diisi")
    .max(500, "Jenis OPT maksimal 500 karakter"),
  
  storageLocation: z
    .string()
    .min(1, "Lokasi penyimpanan wajib diisi")
    .max(100, "Lokasi penyimpanan maksimal 100 karakter"),
  
  notes: z
    .string()
    .max(1000, "Catatan maksimal 1,000 karakter")
    .optional(),
};

// Add medicine validation schema
export const addMedicineSchema = z.object({
  ...baseMedicineSchema,
  
  entryDate: z
    .date({
      required_error: "Tanggal masuk wajib diisi",
    })
    .max(new Date(), "Tanggal masuk tidak boleh di masa depan"),
  
  expiryDate: z
    .date({
      required_error: "Tanggal expired wajib diisi",
    })
    .min(new Date(), "Tanggal expired harus di masa depan"),
    
}).refine((data) => {
  if (data.expiryDate && data.entryDate) {
    return data.expiryDate > data.entryDate;
  }
  return true;
}, {
  message: "Tanggal expired harus lebih dari tanggal masuk",
  path: ["expiryDate"],
}).refine((data) => {
  // Check if entry date is not too far in the past (more than 5 years)
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  
  return data.entryDate >= fiveYearsAgo;
}, {
  message: "Tanggal masuk tidak boleh lebih dari 5 tahun yang lalu",
  path: ["entryDate"],
}).refine((data) => {
  // Check if expiry date is not too far in the future (more than 10 years)
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
  
  return data.expiryDate <= tenYearsFromNow;
}, {
  message: "Tanggal expired tidak boleh lebih dari 10 tahun ke depan",
  path: ["expiryDate"],
});

// Edit medicine validation schema (allows past dates for entry)
export const editMedicineSchema = z.object({
  ...baseMedicineSchema,
  
  entryDate: z
    .date({
      required_error: "Tanggal masuk wajib diisi",
    }),
  
  expiryDate: z
    .date({
      required_error: "Tanggal expired wajib diisi",
    }),
    
}).refine((data) => {
  if (data.expiryDate && data.entryDate) {
    return data.expiryDate > data.entryDate;
  }
  return true;
}, {
  message: "Tanggal expired harus lebih dari tanggal masuk",
  path: ["expiryDate"],
});

// Stock adjustment validation schema
export const stockAdjustmentSchema = z.object({
  adjustmentType: z.enum(['increase', 'decrease', 'set'], {
    required_error: "Tipe penyesuaian wajib dipilih",
  }),
  
  quantity: z
    .number()
    .min(0, "Jumlah tidak boleh negatif")
    .max(999999, "Jumlah maksimal 999,999"),
  
  reason: z
    .string()
    .min(1, "Alasan penyesuaian wajib diisi")
    .max(200, "Alasan maksimal 200 karakter"),
  
  notes: z
    .string()
    .max(500, "Catatan maksimal 500 karakter")
    .optional(),
});

// Medicine search/filter validation schema
export const medicineFilterSchema = z.object({
  search: z.string().optional(),
  
  categories: z.array(z.string()).optional(),
  
  suppliers: z.array(z.string()).optional(),
  
  status: z.array(z.enum(['normal', 'low', 'expired', 'near_expiry'])).optional(),
  
  stockRange: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  
  expiryRange: z.object({
    start: z.date().optional(),
    end: z.date().optional(),
  }).optional(),
  
  sortBy: z.enum(['name', 'category', 'stock', 'expiryDate', 'entryDate']).optional(),
  
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Type exports
export type AddMedicineFormData = z.infer<typeof addMedicineSchema>;
export type EditMedicineFormData = z.infer<typeof editMedicineSchema>;
export type StockAdjustmentData = z.infer<typeof stockAdjustmentSchema>;
export type MedicineFilterData = z.infer<typeof medicineFilterSchema>;

// Validation utilities
export const validateMedicineName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 100;
};

export const validateExpiryDate = (expiryDate: Date, entryDate?: Date): boolean => {
  const now = new Date();
  
  // Must be in the future
  if (expiryDate <= now) return false;
  
  // Must be after entry date if provided
  if (entryDate && expiryDate <= entryDate) return false;
  
  // Must not be more than 10 years in the future
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);
  if (expiryDate > tenYearsFromNow) return false;
  
  return true;
};

export const validateStock = (stock: number): boolean => {
  return stock >= 0 && stock <= 999999;
};

export const validatePrice = (price: number): boolean => {
  return price >= 0 && price <= 999999999;
};

// Form field error messages
export const getFieldErrorMessage = (field: string, error: any): string => {
  if (!error) return '';
  
  const defaultMessages: Record<string, string> = {
    name: 'Nama obat tidak valid',
    producer: 'Nama produsen tidak valid',
    content: 'Kandungan tidak valid',
    categoryId: 'Kategori harus dipilih',
    supplier: 'Supplier harus dipilih',
    stock: 'Jumlah stok tidak valid',
    unit: 'Satuan harus dipilih',
    entryDate: 'Tanggal masuk tidak valid',
    expiryDate: 'Tanggal expired tidak valid',
    targetPest: 'Jenis OPT tidak valid',
    storageLocation: 'Lokasi penyimpanan tidak valid',
  };
  
  return error.message || defaultMessages[field] || 'Field tidak valid';
};

// # END OF Medicine Validation Schema 