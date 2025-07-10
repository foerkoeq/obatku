// # START OF Medicine Detail Page - Detailed view of a single medicine item
// Purpose: Display comprehensive information about a specific medicine
// Features: Full medicine details, edit button, delete button, barcode view
// Returns: Complete medicine detail interface
// Dependencies: UI components, router, types

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Trash2, QrCode, Package, Calendar, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Custom Components
import PageTitle from "@/components/page-title";
import StatusIndicator from "@/components/inventory/status-indicator";

// Types
import { DrugInventory, UserRole, DrugCategory } from "@/lib/types/inventory";

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

const MedicineDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const medicineId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [userRole] = useState<UserRole>('admin'); // In real app, get from auth context
  const [medicineData, setMedicineData] = useState<DrugInventory | null>(null);

  // Check permissions
  const canEdit = userRole !== 'ppl';
  const canDelete = userRole === 'admin' || userRole === 'dinas';

  // Load medicine data
  useEffect(() => {
    const loadMedicineData = async () => {
      try {
        setLoading(true);
        
        // In real app, fetch from API
        // const response = await fetch(`/api/inventory/${medicineId}`);
        // const data = await response.json();
        
        // Mock data loading
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

  const handleEdit = () => {
    if (medicineData) {
      router.push(`/inventory/${medicineData.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!medicineData) return;

    const confirmed = confirm(`Apakah Anda yakin ingin menghapus ${medicineData.name}?`);
    if (!confirmed) return;

    try {
      setDeleting(true);
      
      // In real app, make API call to delete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Data obat berhasil dihapus');
      router.push('/inventory');
      
    } catch (error) {
      console.error('Error deleting medicine:', error);
      toast.error('Gagal menghapus data obat');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewBarcode = () => {
    // In real app, open barcode modal or navigate to barcode page
    toast.info('Fitur lihat barcode akan segera tersedia');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Memuat data obat...</span>
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
          <PageTitle title="Detail Obat" className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Informasi lengkap tentang: <span className="font-medium">{medicineData.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
            className="w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </div>
      </div>

      {/* Status and Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <StatusIndicator status={medicineData.status} />
              <div>
                <h3 className="text-lg font-semibold">{medicineData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Barcode: {medicineData.barcode}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewBarcode}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Barcode
              </Button>
              
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-destructive hover:text-destructive"
                >
                  {deleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {deleting ? 'Menghapus...' : 'Hapus'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nama Obat</label>
              <p className="text-sm">{medicineData.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Produsen</label>
              <p className="text-sm">{medicineData.producer}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kandungan</label>
              <p className="text-sm">{medicineData.content}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kategori</label>
              <p className="text-sm">{medicineData.category.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Supplier</label>
              <p className="text-sm">{medicineData.supplier}</p>
            </div>
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informasi Stok
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stok Saat Ini</label>
              <p className="text-lg font-semibold">{medicineData.stock} {medicineData.unit}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Kemasan Besar</label>
              <p className="text-sm">
                {medicineData.largePack.quantity} {medicineData.largePack.unit} 
                ({medicineData.largePack.itemsPerPack} {medicineData.unit}/kemasan)
              </p>
            </div>
            
            {medicineData.pricePerUnit && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Harga per Unit</label>
                <p className="text-sm">{formatCurrency(medicineData.pricePerUnit)}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Lokasi Penyimpanan</label>
              <p className="text-sm flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {medicineData.storageLocation}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Date Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Informasi Tanggal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tanggal Masuk</label>
              <p className="text-sm">
                {format(medicineData.entryDate, 'dd MMMM yyyy', { locale: id })}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tanggal Expired</label>
              <p className="text-sm">
                {format(medicineData.expiryDate, 'dd MMMM yyyy', { locale: id })}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Terakhir Diperbarui</label>
              <p className="text-sm">
                {format(medicineData.lastUpdated, 'dd MMMM yyyy HH:mm', { locale: id })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Tambahan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Jenis OPT</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {medicineData.targetPest.map((pest, index) => (
                  <Badge key={index} className="text-xs bg-secondary text-secondary-foreground">
                    {pest}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Dibuat oleh</label>
              <p className="text-sm">{medicineData.createdBy}</p>
            </div>
            
            {medicineData.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Catatan</label>
                <p className="text-sm bg-muted p-3 rounded-md">
                  {medicineData.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicineDetailPage;

// # END OF Medicine Detail Page
