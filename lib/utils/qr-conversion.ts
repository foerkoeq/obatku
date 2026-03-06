import { DrugInventory } from "@/lib/types/inventory";
import { MedicineData } from "@/components/print/qr-label-template";
import { extractExpiryDates } from "@/lib/utils/date-utils";

// Define print settings type locally to avoid circular import
interface PrintSettings {
  labelsPerItem: number;
  includeItemInfo: boolean;
  includeDates: boolean;
  includeLocation: boolean;
  paperSize?: "A4" | "Letter";
  orientation?: "portrait" | "landscape";
}

/**
 * Convert DrugInventory to MedicineData format for QR label printing
 */
export const convertDrugToMedicine = (
  drug: DrugInventory, 
  printSettings?: PrintSettings
): MedicineData => {
  // Format dates
  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString().split('T')[0];
  };

  const getPrimaryExpiryDate = (expiryDate: DrugInventory["expiryDate"]): Date | null => {
    const dates = extractExpiryDates(expiryDate)
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    return dates[0] ?? null;
  };

  const primaryExpiryDate = getPrimaryExpiryDate(drug.expiryDate);

  // Create base medicine data
  const medicine: MedicineData = {
    id: drug.id,
    name: printSettings?.includeItemInfo ? drug.name : "",
    producer: printSettings?.includeItemInfo ? drug.producer : "",
    activeIngredient: printSettings?.includeItemInfo ? drug.content : "",
    source: drug.barcode || `OBAT-${drug.id}`, // Use barcode or generate from ID
    entryDate: printSettings?.includeDates ? formatDate(drug.entryDate) : "",
    expiryDate: printSettings?.includeDates ? formatDate(primaryExpiryDate) : "",
    location: printSettings?.includeLocation ? drug.storageLocation : "",
  };

  return medicine;
};

/**
 * Convert multiple DrugInventory items to MedicineData array
 */
export const convertDrugsToMedicines = (
  drugs: DrugInventory[],
  printSettings?: PrintSettings
): MedicineData[] => {
  return drugs.map(drug => convertDrugToMedicine(drug, printSettings));
};

/**
 * Generate QR code data string from DrugInventory
 */
export const generateQRDataFromDrug = (drug: DrugInventory): string => {
  const primaryExpiryDate = extractExpiryDates(drug.expiryDate)
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())[0];

  const qrData = {
    type: "MEDICINE",
    id: drug.id,
    name: drug.name,
    barcode: drug.barcode,
    location: drug.storageLocation,
    expiryDate: primaryExpiryDate ? primaryExpiryDate.toISOString().split('T')[0] : "",
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(qrData);
};

/**
 * Validate if DrugInventory has required data for QR printing
 */
export const validateDrugForQR = (drug: DrugInventory): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!drug.id?.trim()) {
    errors.push("ID obat tidak boleh kosong");
  }

  if (!drug.name?.trim()) {
    errors.push("Nama obat tidak boleh kosong");
  }

  if (!drug.producer?.trim()) {
    errors.push("Nama produsen tidak boleh kosong");
  }

  if (!drug.storageLocation?.trim()) {
    errors.push("Lokasi penyimpanan tidak boleh kosong");
  }

  if (!drug.entryDate) {
    errors.push("Tanggal masuk tidak boleh kosong");
  }

  if (!drug.expiryDate) {
    errors.push("Tanggal kadaluarsa tidak boleh kosong");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Filter drugs that are valid for QR printing
 */
export const filterValidDrugsForQR = (drugs: DrugInventory[]): {
  valid: DrugInventory[];
  invalid: { drug: DrugInventory; errors: string[] }[];
} => {
  const valid: DrugInventory[] = [];
  const invalid: { drug: DrugInventory; errors: string[] }[] = [];

  drugs.forEach(drug => {
    const validation = validateDrugForQR(drug);
    if (validation.isValid) {
      valid.push(drug);
    } else {
      invalid.push({ drug, errors: validation.errors });
    }
  });

  return { valid, invalid };
};
