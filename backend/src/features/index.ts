// src/features/index.ts
export * from './inventory';
export * from './qrcode';
export * from './submissions';
export * from './users';

// Feature integration types
export interface FeatureIntegration {
  inventory: {
    linkQRCodeToMedicine: (medicineId: string, qrCodeId: string) => Promise<void>;
    unlinkQRCodeFromMedicine: (qrCodeId: string) => Promise<void>;
    getMedicineByQRCode: (qrCodeString: string) => Promise<any>;
  };
  qrcode: {
    generateForMedicine: (medicineId: string, quantity: number) => Promise<any>;
    scanForInventory: (qrCodeString: string, purpose: string) => Promise<any>;
    validateMedicineAssociation: (qrCodeString: string, medicineId: string) => Promise<boolean>;
  };
}
