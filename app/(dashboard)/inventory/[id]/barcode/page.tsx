// # START OF Barcode View Page - View and print barcode for medicine
// Purpose: Display barcode for a specific medicine with print functionality
// Features: QR code display, barcode info, print options
// Returns: Barcode view interface
// Dependencies: QR code generator, print utilities

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Download, Printer, Share2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Custom Components
import PageTitle from "@/components/page-title";

// Types
import { DrugInventory, DrugCategory } from "@/lib/types/inventory";

// Mock data for testing - in real app, this would come from API
const mockCategories: DrugCategory[] = [
  { id: '1', name: 'Herbisida', description: 'Obat pembasmi gulma' },
  { id: '2', name: 'Insektisida', description: 'Obat pembasmi serangga' },
  { id: '3', name: 'Fungisida', description: 'Obat pembasmi jamur' },
  { id: '4', name: 'Bakterisida', description: 'Obat pembasmi bakteri' },
];

const mockInventoryData: DrugInventory[] = [
  {
    id: '1',
    name: 'Roundup 486 SL',
    producer: 'Monsanto',
    content: 'Glifosat 486 g/l',
    category: mockCategories[0],
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
    id: '2',
    name: 'Decis 25 EC',
    producer: 'Bayer',
    content: 'Deltametrin 25 g/l',
    category: mockCategories[1],
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
];

const BarcodeViewPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const medicineId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [medicineData, setMedicineData] = useState<DrugInventory | null>(null);

  // Load medicine data
  useEffect(() => {
    const loadMedicineData = async () => {
      try {
        setLoading(true);
        
        // In real app, fetch from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        const data = mockInventoryData.find(item => item.id === medicineId);
        
        if (!data) {
          toast.error('Data obat tidak ditemukan');
          router.push('/inventory');
          return;
        }

        setMedicineData(data);
        
      } catch (error) {
        console.error('Error loading medicine data:', error);
        toast.error('Gagal memuat data obat');
        router.push('/inventory');
      } finally {
        setLoading(false);
      }
    };

    if (medicineId) {
      loadMedicineData();
    }
  }, [medicineId, router]);

  // Event handlers
  const handleBack = () => {
    router.back();
  };

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Reload to restore event handlers
    }
  };

  const handleDownload = () => {
    // In real app, generate and download barcode image
    toast.info('Fitur download barcode akan segera tersedia');
  };

  const handleShare = async () => {
    if (navigator.share && medicineData) {
      try {
        await navigator.share({
          title: `Barcode - ${medicineData.name}`,
          text: `Barcode untuk ${medicineData.name}: ${medicineData.barcode}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link berhasil disalin ke clipboard');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link berhasil disalin ke clipboard');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat data barcode...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error if medicine not found
  if (!medicineData) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Data obat tidak ditemukan. Silakan kembali ke halaman inventory.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <PageTitle title="Barcode Obat" className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Barcode untuk: <span className="font-medium">{medicineData.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Bagikan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>

      {/* Barcode Display */}
      <div className="flex justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8">
            <div ref={printRef} className="text-center space-y-6">
              {/* QR Code Placeholder */}
              <div className="flex justify-center">
                <div className="w-64 h-64 bg-white border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg">
                  <div className="text-center space-y-2">
                    <div className="text-4xl">📱</div>
                    <p className="text-sm text-muted-foreground">
                      QR Code akan ditampilkan di sini
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {medicineData.barcode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medicine Information */}
              <div className="space-y-4">
                <Separator />
                
                <div className="text-left space-y-3">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{medicineData.name}</h3>
                    <p className="text-sm text-muted-foreground">{medicineData.producer}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Kode Barcode:</span>
                      <br />
                      <span className="font-mono text-lg">{medicineData.barcode}</span>
                    </div>
                    <div>
                      <span className="font-medium">Kategori:</span>
                      <br />
                      {medicineData.category.name}
                    </div>
                    <div>
                      <span className="font-medium">Stok:</span>
                      <br />
                      {medicineData.stock} {medicineData.unit}
                    </div>
                    <div>
                      <span className="font-medium">Lokasi:</span>
                      <br />
                      {medicineData.storageLocation}
                    </div>
                    <div>
                      <span className="font-medium">Expired:</span>
                      <br />
                      {format(medicineData.expiryDate, 'dd/MM/yyyy', { locale: id })}
                    </div>
                    <div>
                      <span className="font-medium">Dicetak:</span>
                      <br />
                      {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: id })}
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-xs text-muted-foreground text-center">
                  <p>Sistem Inventory Obat Pertanian</p>
                  <p>Scan QR code untuk informasi detail</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Petunjuk Penggunaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Cara menggunakan barcode:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Scan QR code menggunakan aplikasi scanner atau kamera smartphone</li>
              <li>QR code berisi informasi lengkap tentang obat ini</li>
              <li>Gunakan tombol Print untuk mencetak label barcode</li>
              <li>Tempelkan label pada kemasan obat untuk identifikasi mudah</li>
            </ul>
          </div>
          
          <Separator />
          
          <div className="text-sm space-y-2">
            <p><strong>Informasi barcode:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Kode: {medicineData.barcode}</li>
              <li>Format: QR Code 2D</li>
              <li>Data: JSON dengan informasi lengkap obat</li>
              <li>Kompatibel dengan scanner barcode standar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BarcodeViewPage;

// # END OF Barcode View Page
