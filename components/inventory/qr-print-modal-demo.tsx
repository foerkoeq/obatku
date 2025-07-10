"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRPrintModal } from "@/components/inventory";
import { DrugInventory } from "@/lib/types/inventory";

// Demo data for testing
const demoInventoryData: DrugInventory[] = [
  {
    id: 'MED001',
    name: 'Roundup 486 SL',
    producer: 'Monsanto',
    content: 'Glifosat 486 g/l',
    category: { id: '1', name: 'Herbisida', description: 'Obat pembasmi gulma' },
    supplier: 'PT Agro Kimia',
    stock: 150,
    unit: 'liter',
    largePack: { quantity: 20, unit: 'jerigen', itemsPerPack: 5 },
    entryDate: new Date('2024-01-15'),
    expiryDate: new Date('2026-01-15'),
    pricePerUnit: 125000,
    targetPest: ['Gulma daun lebar', 'Gulma rumput'],
    storageLocation: 'Gudang A-1',
    notes: 'Simpan di tempat sejuk dan kering',
    barcode: 'RU486-240115-001',
    status: 'normal',
    lastUpdated: new Date('2024-01-15T10:00:00Z'),
    createdBy: 'Admin',
  },
  {
    id: 'MED002',
    name: 'Decis 25 EC',
    producer: 'Bayer',
    content: 'Deltametrin 25 g/l',
    category: { id: '2', name: 'Insektisida', description: 'Obat pembasmi serangga' },
    supplier: 'CV Tani Makmur',
    stock: 8,
    unit: 'liter',
    largePack: { quantity: 12, unit: 'dus', itemsPerPack: 1 },
    entryDate: new Date('2024-02-10'),
    expiryDate: new Date('2024-12-31'),
    pricePerUnit: 285000,
    targetPest: ['Penggerek batang', 'Ulat grayak', 'Thrips'],
    storageLocation: 'Gudang B-2',
    barcode: 'DCS25-240210-002',
    status: 'low',
    lastUpdated: new Date('2024-02-10T10:00:00Z'),
    createdBy: 'Staff Gudang',
  },
  {
    id: 'MED003',
    name: 'Score 250 EC',
    producer: 'Syngenta',
    content: 'Difenokonazol 250 g/l',
    category: { id: '3', name: 'Fungisida', description: 'Obat pembasmi jamur' },
    supplier: 'PT Pupuk Nusantara',
    stock: 5,
    unit: 'liter',
    largePack: { quantity: 10, unit: 'box', itemsPerPack: 1 },
    entryDate: new Date('2023-11-20'),
    expiryDate: new Date('2024-02-15'),
    pricePerUnit: 450000,
    targetPest: ['Blast', 'Bercak daun', 'Antraknosa'],
    storageLocation: 'Gudang C-1',
    barcode: 'SCR250-231120-003',
    status: 'expired',
    lastUpdated: new Date('2023-11-20T10:00:00Z'),
    createdBy: 'Admin',
  },
];

const QRPrintModalDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>(['MED001', 'MED002']);

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleSelectAll = () => {
    setSelectedItems(demoInventoryData.map(item => item.id));
  };

  const handleSelectNone = () => {
    setSelectedItems([]);
  };

  const handleToggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>QR Print Modal Demo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Simulasi penggunaan QR Print Modal untuk testing dan development
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selection Controls */}
          <div className="space-y-4">
            <h3 className="font-medium">Pilih Item untuk Cetak QR:</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Pilih Semua
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectNone}>
                Hapus Pilihan
              </Button>
            </div>
            
            <div className="grid gap-2">
              {demoInventoryData.map(item => (
                <label key={item.id} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleItem(item.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.producer} • {item.storageLocation} • Stock: {item.stock} {item.unit}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    item.status === 'normal' ? 'bg-green-100 text-green-800' :
                    item.status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Print Button */}
          <div className="text-center">
            <Button 
              onClick={handleOpenModal}
              disabled={selectedItems.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              🏷️ Cetak QR Code ({selectedItems.length} item)
            </Button>
            
            {selectedItems.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Pilih minimal 1 item untuk mencetak QR code
              </p>
            )}
          </div>

          {/* Selected Items Summary */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Item Terpilih:</h4>
              <div className="text-sm text-blue-700">
                {selectedItems.map(id => {
                  const item = demoInventoryData.find(item => item.id === id);
                  return item ? `${item.id} - ${item.name}` : id;
                }).join(', ')}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Print Modal */}
      <QRPrintModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedItems={selectedItems}
        inventoryData={demoInventoryData}
      />
    </div>
  );
};

export default QRPrintModalDemo;
