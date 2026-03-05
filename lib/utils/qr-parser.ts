/**
 * QR Code Parser Utility
 * 
 * Utility untuk mem-parse QR code value menjadi data terstruktur.
 * Mendukung format: rak gudang, kardus obat, dan obat satuan.
 * 
 * Format QR Code yang didukung:
 * - Rak Gudang:  RACK:{id}:{code}:{name}
 * - Kardus Obat:  BOX:{id}:{code}:{name}
 * - Obat Satuan:  MED:{id}:{code}:{name}
 * - URL:          http(s)://...
 * - JSON:         { "type": "...", ... }
 * 
 * Format bisa disesuaikan sesuai kebutuhan.
 */

import type { QrCodeType, QrParsedData, QrScanResult } from "@/lib/types/qr-scanner";

/** Prefix mapping untuk deteksi jenis QR code */
const QR_PREFIX_MAP: Record<string, QrCodeType> = {
  "RACK": "rack",
  "RAK": "rack",
  "BOX": "box",
  "KARDUS": "box",
  "MED": "medicine",
  "OBAT": "medicine",
  "MEDICINE": "medicine",
};

/**
 * Parse raw QR code value menjadi QrScanResult
 */
export function parseQrCode(rawValue: string): QrScanResult {
  const trimmed = rawValue.trim();
  
  // Coba parse sebagai JSON
  const jsonResult = tryParseJson(trimmed);
  if (jsonResult) {
    return {
      rawValue: trimmed,
      type: jsonResult.type,
      data: jsonResult.data,
      scannedAt: new Date(),
    };
  }

  // Coba parse sebagai URL
  const urlResult = tryParseUrl(trimmed);
  if (urlResult) {
    return {
      rawValue: trimmed,
      type: urlResult.type,
      data: urlResult.data,
      scannedAt: new Date(),
    };
  }

  // Coba parse sebagai format prefix (RACK:id:code:name)
  const prefixResult = tryParsePrefixed(trimmed);
  if (prefixResult) {
    return {
      rawValue: trimmed,
      type: prefixResult.type,
      data: prefixResult.data,
      scannedAt: new Date(),
    };
  }

  // Default: unknown
  return {
    rawValue: trimmed,
    type: "unknown",
    data: {
      description: trimmed,
    },
    scannedAt: new Date(),
  };
}

/**
 * Coba parse sebagai JSON
 */
function tryParseJson(value: string): { type: QrCodeType; data: QrParsedData } | null {
  try {
    if (!value.startsWith("{") && !value.startsWith("[")) return null;
    
    const parsed = JSON.parse(value);
    
    const typeStr = (parsed.type || parsed.tipe || "").toString().toUpperCase();
    const type = QR_PREFIX_MAP[typeStr] || "unknown";
    
    return {
      type,
      data: {
        id: parsed.id?.toString(),
        code: parsed.code || parsed.kode,
        name: parsed.name || parsed.nama,
        description: parsed.description || parsed.deskripsi,
        redirectUrl: parsed.url || parsed.redirectUrl,
        metadata: parsed,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Coba parse sebagai URL
 */
function tryParseUrl(value: string): { type: QrCodeType; data: QrParsedData } | null {
  try {
    if (!value.startsWith("http://") && !value.startsWith("https://")) return null;
    
    const url = new URL(value);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Deteksi tipe dari path URL
    let type: QrCodeType = "unknown";
    for (const part of pathParts) {
      const upper = part.toUpperCase();
      if (upper in QR_PREFIX_MAP) {
        type = QR_PREFIX_MAP[upper];
        break;
      }
    }

    // Cek juga query params
    const typeParam = url.searchParams.get("type") || url.searchParams.get("tipe");
    if (typeParam && typeParam.toUpperCase() in QR_PREFIX_MAP) {
      type = QR_PREFIX_MAP[typeParam.toUpperCase()];
    }
    
    return {
      type,
      data: {
        id: url.searchParams.get("id") || pathParts[pathParts.length - 1],
        code: url.searchParams.get("code") || url.searchParams.get("kode") || undefined,
        name: url.searchParams.get("name") || url.searchParams.get("nama") || undefined,
        redirectUrl: value,
        metadata: {
          host: url.host,
          pathname: url.pathname,
          params: Object.fromEntries(url.searchParams),
        },
      },
    };
  } catch {
    return null;
  }
}

/**
 * Coba parse sebagai format prefix (PREFIX:id:code:name)
 * Contoh: RACK:001:R-A1:Rak Utama Lantai 1
 */
function tryParsePrefixed(value: string): { type: QrCodeType; data: QrParsedData } | null {
  const separators = [":", "|", ";", "-"];
  
  for (const sep of separators) {
    if (!value.includes(sep)) continue;
    
    const parts = value.split(sep).map(s => s.trim());
    if (parts.length < 2) continue;
    
    const prefix = parts[0].toUpperCase();
    if (prefix in QR_PREFIX_MAP) {
      return {
        type: QR_PREFIX_MAP[prefix],
        data: {
          id: parts[1] || undefined,
          code: parts[2] || undefined,
          name: parts.slice(3).join(" ") || undefined,
        },
      };
    }
  }
  
  return null;
}

/**
 * Mendapatkan label Indonesia untuk tipe QR code
 */
export function getQrTypeLabel(type: QrCodeType): string {
  const labels: Record<QrCodeType, string> = {
    rack: "Rak Gudang",
    box: "Kardus Obat",
    medicine: "Obat Satuan",
    unknown: "Tidak Diketahui",
  };
  return labels[type];
}

/**
 * Mendapatkan icon name (iconify) untuk tipe QR code
 */
export function getQrTypeIcon(type: QrCodeType): string {
  const icons: Record<QrCodeType, string> = {
    rack: "heroicons:archive-box-20-solid",
    box: "heroicons:cube-20-solid",
    medicine: "heroicons:beaker-20-solid",
    unknown: "heroicons:question-mark-circle-20-solid",
  };
  return icons[type];
}

/**
 * Mendapatkan warna badge untuk tipe QR code
 */
export function getQrTypeColor(type: QrCodeType): string {
  const colors: Record<QrCodeType, string> = {
    rack: "info",
    box: "warning",
    medicine: "success",
    unknown: "default",
  };
  return colors[type];
}

/**
 * Generate URL navigasi berdasarkan hasil scan
 */
export function getNavigationUrl(result: QrScanResult): string | null {
  // Jika ada redirectUrl langsung, gunakan itu
  if (result.data.redirectUrl) {
    try {
      const url = new URL(result.data.redirectUrl);
      // Hanya gunakan pathname untuk navigasi internal
      return url.pathname + url.search;
    } catch {
      return result.data.redirectUrl;
    }
  }

  // Generate URL berdasarkan tipe
  const id = result.data.id || result.data.code;
  if (!id) return null;

  switch (result.type) {
    case "rack":
      return `/inventory/racks/${id}`;
    case "box":
      return `/inventory/boxes/${id}`;
    case "medicine":
      return `/inventory/medicines/${id}`;
    default:
      return null;
  }
}
