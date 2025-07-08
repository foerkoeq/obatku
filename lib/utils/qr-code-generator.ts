let QRCode: any;

try {
  QRCode = require('qrcode');
} catch (error) {
  console.warn('QR Code library not installed. Install with: npm install qrcode @types/qrcode');
  QRCode = null;
}

export interface QRCodeOptions {
  width?: number;
  height?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

export class QRCodeGenerator {
  private static defaultOptions: QRCodeOptions = {
    width: 150,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  };

  // Generate QR code as Data URL (base64)
  static async generateDataURL(
    text: string, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    if (!QRCode) {
      throw new Error('QR Code library not available. Please install qrcode package.');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      return await QRCode.toDataURL(text, {
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate QR code as SVG string
  static async generateSVG(
    text: string, 
    options: QRCodeOptions = {}
  ): Promise<string> {
    if (!QRCode) {
      throw new Error('QR Code library not available. Please install qrcode package.');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      return await QRCode.toString(text, {
        type: 'svg',
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel
      });
    } catch (error) {
      console.error('Error generating QR code SVG:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  // Generate QR code as Canvas element (for browser)
  static async generateCanvas(
    text: string, 
    canvasElement: HTMLCanvasElement,
    options: QRCodeOptions = {}
  ): Promise<void> {
    if (!QRCode) {
      throw new Error('QR Code library not available. Please install qrcode package.');
    }

    const mergedOptions = { ...this.defaultOptions, ...options };
    
    try {
      await QRCode.toCanvas(canvasElement, text, {
        width: mergedOptions.width,
        margin: mergedOptions.margin,
        color: mergedOptions.color,
        errorCorrectionLevel: mergedOptions.errorCorrectionLevel
      });
    } catch (error) {
      console.error('Error generating QR code canvas:', error);
      throw new Error('Failed to generate QR code canvas');
    }
  }

  // Validate QR code text
  static validateText(text: string): boolean {
    if (!text || text.trim() === '') {
      return false;
    }
    
    // Check length - QR codes have limits based on error correction level
    // For alphanumeric: L=4296, M=3391, Q=2420, H=1852
    if (text.length > 1000) { // Conservative limit
      return false;
    }
    
    return true;
  }

  // Generate medicine QR code data format
  static generateMedicineQRData(medicineId: string, additionalData?: Record<string, any>): string {
    const baseData = {
      type: 'MEDICINE',
      id: medicineId,
      timestamp: new Date().toISOString(),
      ...additionalData
    };
    
    // Use JSON format for structured data
    return JSON.stringify(baseData);
  }

  // Parse medicine QR code data
  static parseMedicineQRData(qrData: string): any {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.type === 'MEDICINE' && parsed.id) {
        return parsed;
      }
      throw new Error('Invalid medicine QR code format');
    } catch (error) {
      // Fallback for simple ID format
      if (qrData.startsWith('OBAT-') || qrData.startsWith('MED-')) {
        return {
          type: 'MEDICINE',
          id: qrData,
          timestamp: null
        };
      }
      throw new Error('Unable to parse QR code data');
    }
  }
}
