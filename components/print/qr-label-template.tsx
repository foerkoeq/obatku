'use client';

import React from 'react';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

// Tipe data untuk pestisida/obat pertanian
export interface MedicineData {
  id: string;
  name: string;
  producer: string;
  activeIngredient: string;
  source: string; // APBN-2024, APBD-2024, CSR PT. A-2024
  entryDate: string;
  expiryDate: string;
  location: string;
}

// Props untuk single label
interface QRLabelProps {
  medicine: MedicineData;
  qrCodeDataUrl?: string;
}

// Props untuk template keseluruhan
interface QRLabelTemplateProps {
  medicines: MedicineData[];
  showGrid?: boolean; // untuk debugging layout
}

// Hook untuk generate QR code
const useQRCode = (data: string) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(data, {
          width: 120,
          margin: 1,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    if (data) {
      generateQR();
    }
  }, [data]);

  return qrCodeUrl;
};

// Komponen untuk single label
const QRLabel: React.FC<QRLabelProps> = ({ medicine, qrCodeDataUrl }) => {
  const qrCode = useQRCode(medicine.id);
  const qrCodeToUse = qrCodeDataUrl || qrCode;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="qr-label">
      {/* Main Content Area */}
      <div className="qr-label-content">
        {/* Left Section - Pesticide/Agriculture Medicine Info */}
        <div className="qr-label-info">
          <div className="medicine-name">{medicine.name}</div>
          <div className="medicine-producer">{medicine.producer}</div>
          <div className="medicine-ingredient">{medicine.activeIngredient}</div>
          <div className="medicine-source">{medicine.source}</div>
        </div>

        {/* Right Section - QR Code */}
        <div className="qr-label-qr">
          {qrCodeToUse && (
            <img 
              src={qrCodeToUse} 
              alt={`QR Code for ${medicine.name}`}
              className="qr-code-image"
            />
          )}
          <div className="qr-id">{medicine.id}</div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="qr-label-footer">
        <div className="footer-divider"></div>
        <div className="footer-content">
          <div className="footer-left">
            <div className="entry-date">Masuk {formatDate(medicine.entryDate)}</div>
            <div className="expiry-date">Kadaluarsa {formatDate(medicine.expiryDate)}</div>
          </div>
          <div className="footer-right">
            <div className="location">{medicine.location}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Template keseluruhan untuk print
const QRLabelTemplate: React.FC<QRLabelTemplateProps> = ({ 
  medicines, 
  showGrid = false 
}) => {
  // Buat array dengan 12 slot (2 rows × 6 columns)
  const totalSlots = 12;
  const filledSlots = [...medicines];
  
  // Fill remaining slots with empty data if needed
  while (filledSlots.length < totalSlots) {
    filledSlots.push({
      id: '',
      name: '',
      producer: '',
      activeIngredient: '',
      source: '',
      entryDate: '',
      expiryDate: '',
      location: ''
    });
  }

  return (
    <div className={`qr-label-template ${showGrid ? 'show-grid' : ''}`}>
      <div className="label-grid">
        {filledSlots.slice(0, totalSlots).map((medicine, index) => (
          <div key={index} className="label-slot">
            {medicine.id ? (
              <QRLabel medicine={medicine} />
            ) : (
              <div className="empty-label"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRLabelTemplate;
export { QRLabel };
