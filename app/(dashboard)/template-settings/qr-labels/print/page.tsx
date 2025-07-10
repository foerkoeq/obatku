'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QRLabelTemplate, { MedicineData } from '@/components/print/qr-label-template';
import { Printer, ArrowLeft, Settings } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Mock function to get medicine data by IDs
const getMedicinesByIds = async (ids: string[]): Promise<MedicineData[]> => {
  // In real app, this would be an API call
  const allMedicines: MedicineData[] = [
    {
      id: 'MED-2025-001',
      name: 'Buprofezin 25% EC',
      producer: 'PT. Agro Kimia Indonesia',
      activeIngredient: 'Buprofezin 250 g/L',
      source: 'APBN-2025',
      entryDate: '2025-01-15',
      expiryDate: '2026-01-15',
      location: 'Gudang A-1',
    },
    {
      id: 'MED-2025-002',
      name: 'Chlorpyrifos 20% EC',
      producer: 'PT. Pestisida Nusantara',
      activeIngredient: 'Chlorpyrifos 200 g/L',
      source: 'APBD-2025',
      entryDate: '2025-01-20',
      expiryDate: '2026-01-20',
      location: 'Gudang B-2',
    },
    {
      id: 'MED-2025-003',
      name: 'Imidacloprid 17.8% SL',
      producer: 'PT. Kimia Farma Agro',
      activeIngredient: 'Imidacloprid 178 g/L',
      source: 'CSR PT. A-2025',
      entryDate: '2025-02-01',
      expiryDate: '2026-02-01',
      location: 'Gudang C-3',
    },
    {
      id: 'MED-2025-004',
      name: 'Glyphosate 486 g/L SL',
      producer: 'PT. Herbisida Mandiri',
      activeIngredient: 'Glyphosate 486 g/L',
      source: 'APBN-2025',
      entryDate: '2025-02-10',
      expiryDate: '2026-02-10',
      location: 'Gudang A-2',
    },
    {
      id: 'MED-2025-005',
      name: 'Mancozeb 80% WP',
      producer: 'PT. Fungisida Tani',
      activeIngredient: 'Mancozeb 800 g/kg',
      source: 'APBD-2025',
      entryDate: '2025-02-15',
      expiryDate: '2026-02-15',
      location: 'Gudang B-1',
    },
  ];

  return allMedicines.filter(medicine => ids.includes(medicine.id));
};

export default function QRLabelsPrintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [medicines, setMedicines] = useState<MedicineData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const itemsParam = searchParams.get('items');
    if (itemsParam) {
      const itemIds = itemsParam.split(',');
      getMedicinesByIds(itemIds).then(data => {
        setMedicines(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (medicines.length === 0) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Tidak ada data</h2>
            <p className="text-muted-foreground mb-4">
              Tidak ada obat yang dipilih untuk dicetak.
            </p>
            <Button onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Hidden when printing */}
      <div className="no-print container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Cetak Label QR Code</h1>
            <p className="text-muted-foreground">
              {medicines.length} label siap untuk dicetak
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Button>
            <Link href="/template-settings/qr-labels">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Pengaturan Template
              </Button>
            </Link>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Cetak
            </Button>
          </div>
        </div>

        {/* Medicine List - Hidden when printing */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Daftar Obat yang akan dicetak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {medicines.map((medicine) => (
                <div key={medicine.id} className="p-3 border rounded-lg">
                  <div className="font-medium text-sm">{medicine.name}</div>
                  <div className="text-xs text-muted-foreground">{medicine.producer}</div>
                  <div className="flex justify-between items-center mt-2">
                    <Badge color="secondary" className="text-xs">
                      {medicine.id}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {medicine.location}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Template */}
      <div className="print-only">
        <QRLabelTemplate medicines={medicines} showGrid={false} />
      </div>

      {/* Preview - Hidden when printing */}
      <div className="no-print container mx-auto pb-6">
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50 overflow-auto">
              <div style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}>
                <QRLabelTemplate medicines={medicines} showGrid={false} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            margin: 0;
            padding: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        @media screen {
          .print-only {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
