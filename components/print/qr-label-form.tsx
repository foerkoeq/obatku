'use client';

import React, { useState, useEffect } from 'react';
import { MedicineData } from './qr-label-template';
import { 
  validateMedicineData, 
  formatSource, 
  generateTestMedicines 
} from './qr-label-utils';

interface QRLabelFormProps {
  onMedicinesChange: (medicines: MedicineData[]) => void;
  initialMedicines?: MedicineData[];
}

const QRLabelForm: React.FC<QRLabelFormProps> = ({ 
  onMedicinesChange, 
  initialMedicines = [] 
}) => {
  const [medicines, setMedicines] = useState<MedicineData[]>(initialMedicines);
  const [currentMedicine, setCurrentMedicine] = useState<MedicineData>({
    id: '',
    name: '',
    producer: '',
    activeIngredient: '',
    source: '',
    entryDate: '',
    expiryDate: '',
    location: ''
  });
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    onMedicinesChange(medicines);
  }, [medicines, onMedicinesChange]);

  const handleInputChange = (field: keyof MedicineData, value: string) => {
    setCurrentMedicine(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSourceTypeChange = (type: 'APBN' | 'APBD' | 'CSR', year: string, company?: string) => {
    const source = formatSource(type, parseInt(year), company);
    handleInputChange('source', source);
  };

  const handleAddMedicine = () => {
    const validation = validateMedicineData(currentMedicine);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    if (editingIndex >= 0) {
      // Update existing medicine
      const updated = [...medicines];
      updated[editingIndex] = currentMedicine;
      setMedicines(updated);
      setEditingIndex(-1);
    } else {
      // Add new medicine
      setMedicines(prev => [...prev, currentMedicine]);
    }

    // Reset form
    setCurrentMedicine({
      id: '',
      name: '',
      producer: '',
      activeIngredient: '',
      source: '',
      entryDate: '',
      expiryDate: '',
      location: ''
    });
    setErrors([]);
  };

  const handleEditMedicine = (index: number) => {
    setCurrentMedicine(medicines[index]);
    setEditingIndex(index);
    setErrors([]);
  };

  const handleDeleteMedicine = (index: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleCancelEdit = () => {
    setCurrentMedicine({
      id: '',
      name: '',
      producer: '',
      activeIngredient: '',
      source: '',
      entryDate: '',
      expiryDate: '',
      location: ''
    });
    setEditingIndex(-1);
    setErrors([]);
  };

  const handleLoadTestData = () => {
    const testMedicines = generateTestMedicines(6);
    setMedicines(testMedicines);
  };

  const handleClearAll = () => {
    setMedicines([]);
    handleCancelEdit();
  };

  return (
    <div className="qr-label-form" style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
      <h3>Input Data Pestisida/Obat Pertanian untuk Label QR</h3>
      
      {/* Form Input */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            ID Pestisida:
          </label>
          <input
            type="text"
            value={currentMedicine.id}
            onChange={(e) => handleInputChange('id', e.target.value)}
            placeholder="PEST001"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Nama Produk:
          </label>
          <input
            type="text"
            value={currentMedicine.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Herbisida Roundup 200ml"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Nama Produsen:
          </label>
          <input
            type="text"
            value={currentMedicine.producer}
            onChange={(e) => handleInputChange('producer', e.target.value)}
            placeholder="PT. Syngenta Indonesia"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Kandungan Aktif:
          </label>
          <input
            type="text"
            value={currentMedicine.activeIngredient}
            onChange={(e) => handleInputChange('activeIngredient', e.target.value)}
            placeholder="Glifosat"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Sumber/Supplier:
          </label>
          <input
            type="text"
            value={currentMedicine.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            placeholder="APBN-2024"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Tanggal Masuk:
          </label>
          <input
            type="date"
            value={currentMedicine.entryDate}
            onChange={(e) => handleInputChange('entryDate', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Tanggal Kadaluarsa:
          </label>
          <input
            type="date"
            value={currentMedicine.expiryDate}
            onChange={(e) => handleInputChange('expiryDate', e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Lokasi:
          </label>
          <input
            type="text"
            value={currentMedicine.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="Rak A-1"
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div style={{ marginBottom: '1rem', padding: '0.5rem', background: '#ffebee', border: '1px solid #f44336', borderRadius: '4px' }}>
          <strong>Error:</strong>
          <ul style={{ margin: '0.5rem 0 0 1rem' }}>
            {errors.map((error, index) => (
              <li key={index} style={{ color: '#d32f2f' }}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleAddMedicine}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: editingIndex >= 0 ? '#ff9800' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {editingIndex >= 0 ? 'Update Pestisida' : 'Tambah Pestisida'}
        </button>

        {editingIndex >= 0 && (
          <button
            onClick={handleCancelEdit}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Batal
          </button>
        )}

        <button
          onClick={handleLoadTestData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Load Test Data
        </button>

        <button
          onClick={handleClearAll}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Clear All
        </button>
      </div>

      {/* Medicine List */}
      {medicines.length > 0 && (
        <div>
          <h4>Daftar Pestisida ({medicines.length} item):</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                <tr>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Nama</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Produsen</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'left' }}>Lokasi</th>
                  <th style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((medicine, index) => (
                  <tr key={index} style={{ backgroundColor: editingIndex === index ? '#fff3e0' : 'white' }}>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{medicine.id}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{medicine.name}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{medicine.producer}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd' }}>{medicine.location}</td>
                    <td style={{ padding: '0.5rem', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEditMedicine(index)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#ff9800',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '0.25rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMedicine(index)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRLabelForm;
