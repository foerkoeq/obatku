'use client';

import React, { useState } from 'react';
import QRLabelTemplate, { MedicineData } from './qr-label-template';
import './qr-label.css';

// Sample data untuk testing
const sampleMedicines: MedicineData[] = [
  {
    id: 'MED001',
    name: 'Paracetamol 500mg',
    producer: 'PT. Kimia Farma',
    activeIngredient: 'Paracetamol',
    source: 'APBN-2024',
    entryDate: '2024-01-15',
    expiryDate: '2025-01-15',
    location: 'Rak A-1'
  },
  {
    id: 'MED002',
    name: 'Amoxicillin 250mg Kapsul',
    producer: 'PT. Indofarma',
    activeIngredient: 'Amoxicillin',
    source: 'APBD-2024',
    entryDate: '2024-02-10',
    expiryDate: '2025-02-10',
    location: 'Rak B-2'
  },
  {
    id: 'MED003',
    name: 'Vitamin C 1000mg',
    producer: 'PT. Kalbe Farma',
    activeIngredient: 'Ascorbic Acid',
    source: 'CSR PT. A-2024',
    entryDate: '2024-03-05',
    expiryDate: '2026-03-05',
    location: 'Rak C-1'
  }
];

interface QRLabelPreviewProps {
  medicines?: MedicineData[];
  onPrint?: () => void;
}

const QRLabelPreview: React.FC<QRLabelPreviewProps> = ({ 
  medicines = sampleMedicines,
  onPrint 
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  const handlePrint = () => {
    window.print();
    onPrint?.();
  };

  const handleExportPDF = () => {
    // Implementasi export ke PDF bisa menggunakan library seperti jsPDF
    // atau browser's built-in print to PDF
    window.print();
  };

  return (
    <div className="qr-label-preview">
      {/* Control Panel - Hidden saat print */}
      <div className="control-panel no-print" style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>QR Label Template Control</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={showGrid} 
              onChange={(e) => setShowGrid(e.target.checked)}
            />
            Show Grid (Debug)
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input 
              type="checkbox" 
              checked={debugMode} 
              onChange={(e) => setDebugMode(e.target.checked)}
            />
            Debug Mode
          </label>
          
          <button 
            onClick={handlePrint}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Print Labels
          </button>
          
          <button 
            onClick={handleExportPDF}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Export PDF
          </button>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h4>Spesifikasi Label:</h4>
          <ul style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>
            <li>Ukuran Kertas: 17.58cm × 22.27cm</li>
            <li>Ukuran Label: 7.44cm × 3.36cm</li>
            <li>Layout: 2 kolom × 6 baris = 12 label per halaman</li>
            <li>Jarak antar label: 0.42cm</li>
            <li>Margin: Top 0.7cm, Right 0.51cm, Bottom 1.27cm, Left 0.77cm</li>
          </ul>
        </div>
      </div>

      {/* Template */}
      <div className={debugMode ? 'debug' : ''}>
        <QRLabelTemplate 
          medicines={medicines} 
          showGrid={showGrid}
        />
      </div>

      {/* Print-only styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .qr-label-preview {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default QRLabelPreview;
