/**
 * QR Scanner Types
 * 
 * Tipe data untuk fitur QR Code Scanner.
 * Mendukung berbagai jenis QR code: rak gudang, kardus obat, dan obat satuan.
 */

/** Jenis QR code yang bisa di-scan */
export type QrCodeType = "rack" | "box" | "medicine" | "unknown";

/** Status hasil scan */
export type ScanStatus = "idle" | "scanning" | "success" | "error" | "processing";

/** Data hasil scan QR code */
export interface QrScanResult {
  /** Raw string dari QR code */
  rawValue: string;
  /** Jenis QR code yang terdeteksi */
  type: QrCodeType;
  /** Data yang sudah di-parse dari QR code */
  data: QrParsedData;
  /** Timestamp saat scan berhasil */
  scannedAt: Date;
}

/** Data yang diparsing dari QR code */
export interface QrParsedData {
  /** ID unik dari item */
  id?: string;
  /** Kode item (misal: kode rak, kode obat) */
  code?: string;
  /** Nama item */
  name?: string;
  /** Deskripsi atau info tambahan */
  description?: string;
  /** URL redirect jika ada */
  redirectUrl?: string;
  /** Data tambahan */
  metadata?: Record<string, unknown>;
}

/** Konfigurasi scanner */
export interface QrScannerConfig {
  /** FPS kamera (default: 10) */
  fps?: number;
  /** Ukuran kotak scan dalam pixel (default: 250) */
  qrbox?: number | { width: number; height: number };
  /** Gunakan kamera depan atau belakang */
  facingMode?: "user" | "environment";
  /** Aktifkan flash/torch */
  torch?: boolean;
  /** Aspect ratio kamera */
  aspectRatio?: number;
  /** Mute suara beep */
  disableBeep?: boolean;
}

/** Props untuk komponen scanner */
export interface QrScannerProps {
  /** Callback saat QR code berhasil di-scan */
  onScanSuccess: (result: QrScanResult) => void;
  /** Callback saat terjadi error */
  onScanError?: (error: string) => void;
  /** Callback saat scanner dibuka/ditutup */
  onOpenChange?: (open: boolean) => void;
  /** Konfigurasi scanner */
  config?: QrScannerConfig;
  /** Apakah scanner terbuka */
  open?: boolean;
  /** Custom class */
  className?: string;
}

/** Props untuk floating button */
export interface ScanFloatingButtonProps {
  /** Callback saat tombol ditekan */
  onClick?: () => void;
  /** Custom class */
  className?: string;
  /** Position pada mobile bottom nav */
  variant?: "floating" | "bottom-nav";
  /** Ukuran tombol */
  size?: "sm" | "md" | "lg";
}

/** Props untuk scan result */
export interface ScanResultProps {
  /** Hasil scan */
  result: QrScanResult | null;
  /** Apakah dialog terbuka */
  open: boolean;
  /** Callback tutup dialog */
  onOpenChange: (open: boolean) => void;
  /** Callback untuk aksi navigasi */
  onNavigate?: (url: string) => void;
  /** Callback untuk scan ulang */
  onRescan?: () => void;
}
