'use client';

import React, { useState } from 'react';
import { 
  QRLabelForm, 
  QRLabelPreview, 
  MedicineData 
} from '@/components/print';

const QRLabelPage: React.FC = () => {
  const [medicines, setMedicines] = useState<MedicineData[]>([]);

  const handleMedicinesChange = (newMedicines: MedicineData[]) => {
    setMedicines(newMedicines);
  };

  const handlePrint = () => {
    console.log('Printing labels for:', medicines);
  };

  return (
    <div className="qr-label-page" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{ color: '#333', marginBottom: '0.5rem' }}>
            Generator Label QR Code Pestisida/Obat Pertanian
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            Template siap cetak untuk stiker label no 121 (17.58cm × 22.27cm)
          </p>
        </header>

        {/* Form Input */}
        <section style={{ marginBottom: '2rem' }}>
          <QRLabelForm 
            onMedicinesChange={handleMedicinesChange}
            initialMedicines={medicines}
          />
        </section>

        {/* Preview dan Print */}
        {medicines.length > 0 && (
          <section>
            <h2 style={{ marginBottom: '1rem', color: '#333' }}>
              Preview Label ({medicines.length} pestisida)
            </h2>
            <QRLabelPreview 
              medicines={medicines}
              onPrint={handlePrint}
            />
          </section>
        )}

        {/* Instructions */}
        <section style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#333', marginBottom: '1rem' }}>
            Petunjuk Penggunaan:
          </h3>
          <ol style={{ color: '#666', lineHeight: '1.6' }}>
            <li>            Isi data pestisida menggunakan form di atas</li>
            <li>Gunakan tombol "Load Test Data" untuk contoh data</li>
            <li>Preview label akan muncul setelah data diisi</li>
            <li>Gunakan "Show Grid" untuk melihat panduan grid layout</li>
            <li>Gunakan "Debug Mode" untuk melihat border area</li>
            <li>Klik "Print Labels" untuk mencetak ke printer</li>
            <li>Pastikan printer setting ke ukuran kertas A4 atau custom 17.58cm × 22.27cm</li>
            <li>Set margin printer ke minimum atau gunakan setting custom</li>
          </ol>

          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '4px' 
          }}>
            <strong style={{ color: '#1976d2' }}>Tips:</strong>
            <ul style={{ marginTop: '0.5rem', color: '#1565c0' }}>
              <li>Satu halaman dapat memuat maksimal 12 label (2 kolom × 6 baris)</li>
              <li>Jika lebih dari 12 pestisida, akan otomatis ke halaman berikutnya</li>
              <li>QR Code berisi ID pestisida yang dapat di-scan untuk tracking</li>
              <li>Font dan ukuran sudah dioptimalkan untuk keterbacaan</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};

export default QRLabelPage;
