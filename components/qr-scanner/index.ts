/**
 * QR Scanner Components
 * 
 * Barrel export untuk semua komponen QR scanner.
 * 
 * Penggunaan:
 * 
 * 1. Di layout (otomatis semua halaman):
 *    import { QrScannerProvider } from "@/components/qr-scanner";
 *    <QrScannerProvider />
 * 
 * 2. Custom trigger di komponen lain:
 *    import { useQrScanner } from "@/hooks/use-qr-scanner";
 *    const { openScanner } = useQrScanner();
 *    <button onClick={openScanner}>Scan</button>
 * 
 * 3. Komponen individual:
 *    import { QrScannerCamera, QrScannerDialog, ... } from "@/components/qr-scanner";
 */

export { default as QrScannerProvider } from "./qr-scanner-provider";
export { default as QrScannerDialog } from "./qr-scanner-dialog";
export { default as QrScannerCamera } from "./qr-scanner-camera";
export { default as QrScanResultDialog } from "./qr-scan-result-dialog";
export { default as FloatingScanButton } from "./floating-scan-button";
