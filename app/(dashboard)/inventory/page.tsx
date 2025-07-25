// # START OF Inventory Page - Main inventory management page
// Purpose: Main page for drug inventory management with full functionality
// Features: Search, filter, table, pagination, modals, role-based access
// Returns: Complete inventory management interface
// Dependencies: All inventory components, pagination, toast

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

// Import inventory components
import InventoryTable from "@/components/inventory/inventory-table";
import MedicineDetailModal from "@/components/inventory/medicine-detail-modal";
import InventorySearch from "@/components/inventory/inventory-search";
import ExportModal from "@/components/inventory/export-modal";
import QRPrintModal from "@/components/inventory/qr-print-modal";

// Import types
import {
  DrugInventory,
  InventoryFilters,
  PaginationConfig,
  ExportOptions,
  UserRole,
  DrugCategory,
  Supplier,
  SortConfig
} from "@/lib/types/inventory";

// Mock data - in real app, this would come from API
const mockCategories: DrugCategory[] = [
  { id: '1', name: 'Herbisida', description: 'Obat pembasmi gulma' },
  { id: '2', name: 'Insektisida', description: 'Obat pembasmi serangga' },
  { id: '3', name: 'Fungisida', description: 'Obat pembasmi jamur' },
  { id: '4', name: 'Bakterisida', description: 'Obat pembasmi bakteri' },
];

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'PT Agro Kimia', contact: '021-xxx-xxxx' },
  { id: '2', name: 'CV Tani Makmur', contact: '021-yyy-yyyy' },
  { id: '3', name: 'PT Pupuk Nusantara', contact: '021-zzz-zzzz' },
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
  {
    id: '3',
    name: 'Score 250 EC',
    producer: 'Syngenta',
    content: 'Difenokonazol 250 g/l',
    category: mockCategories[2],
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

const InventoryPage: React.FC = () => {
  // State management
  const [data, setData] = useState<DrugInventory[]>(mockInventoryData);
  const [filteredData, setFilteredData] = useState<DrugInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRole] = useState<UserRole>('admin'); // In real app, get from auth context

  // Filters and search
  const [filters, setFilters] = useState<InventoryFilters>({
    search: '',
    category: [],
    supplier: [],
    status: [],
    expiryRange: {},
    stockRange: {},
  });

  // Pagination
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Sorting
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc',
  });

  // Modals state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSelectedExportModal, setShowSelectedExportModal] = useState(false);
  const [showQRPrintModal, setShowQRPrintModal] = useState(false);

  // Selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const router = useRouter();

  // Filter and search logic
  const applyFilters = useCallback(() => {
    let filtered = [...data];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchLower) ||
        item.producer.toLowerCase().includes(searchLower) ||
        item.category.name.toLowerCase().includes(searchLower) ||
        item.supplier.toLowerCase().includes(searchLower) ||
        item.targetPest.some(pest => pest.toLowerCase().includes(searchLower))
      );
    }

    // Apply category filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(item =>
        filters.category.includes(item.category.id)
      );
    }

    // Apply supplier filter
    if (filters.supplier.length > 0) {
      filtered = filtered.filter(item =>
        filters.supplier.includes(item.supplier)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(item =>
        filters.status.includes(item.status)
      );
    }

    // Apply stock range filter
    if (filters.stockRange.min !== undefined) {
      filtered = filtered.filter(item => item.stock >= filters.stockRange.min!);
    }
    if (filters.stockRange.max !== undefined) {
      filtered = filtered.filter(item => item.stock <= filters.stockRange.max!);
    }

    // Apply expiry date range filter
    if (filters.expiryRange.start) {
      filtered = filtered.filter(item =>
        new Date(item.expiryDate) >= filters.expiryRange.start!
      );
    }
    if (filters.expiryRange.end) {
      filtered = filtered.filter(item =>
        new Date(item.expiryDate) <= filters.expiryRange.end!
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.field] as any;
      const bValue = b[sortConfig.field] as any;
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 1, // Reset to first page when filters change
    }));
  }, [data, filters.search, filters.category, filters.supplier, filters.status, filters.stockRange, filters.expiryRange, sortConfig]);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
    // Reset selection when filters change
    setSelectedItems([]);
  }, [applyFilters]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination.page, pagination.limit]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Event handlers
  const handleSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  const handleFiltersChange = useCallback((newFilters: InventoryFilters) => {
    setFilters(newFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: [],
      supplier: [],
      status: [],
      expiryRange: {},
      stockRange: {},
    });
  }, []);

  // State for detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<DrugInventory | null>(null);

  const handleRowClick = (item: DrugInventory) => {
    setSelectedMedicine(item);
    setDetailModalOpen(true);
  };

  // Modal action handlers
  const [deleting, setDeleting] = useState(false);
  const handleModalEdit = () => {
    if (selectedMedicine) {
      router.push(`/inventory/${selectedMedicine.id}/edit`);
      setDetailModalOpen(false);
    }
  };
  const handleModalDelete = async () => {
    if (!selectedMedicine) return;
    if (confirm(`Apakah Anda yakin ingin menghapus ${selectedMedicine.name}?`)) {
      setDeleting(true);
      // In real app, make API call to delete
      setData(prev => prev.filter(d => d.id !== selectedMedicine.id));
      toast.success('Data obat berhasil dihapus');
      setDetailModalOpen(false);
      setDeleting(false);
    }
  };
  const handleModalBack = () => setDetailModalOpen(false);
  const handleModalViewBarcode = () => {
    if (selectedMedicine) router.push(`/inventory/${selectedMedicine.id}/barcode`);
  };

  const handleEdit = (item: DrugInventory) => {
    router.push(`/inventory/${item.id}/edit`);
  };

  const handleDelete = async (item: DrugInventory) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${item.name}?`)) {
      try {
        // In real app, make API call to delete
        setData(prev => prev.filter(d => d.id !== item.id));
        toast.success('Data obat berhasil dihapus');
      } catch (error) {
        toast.error('Gagal menghapus data obat');
      }
    }
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      setLoading(true);
      // In real app, make API call to export data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success(`Data berhasil diexport dalam format ${options.format.toUpperCase()}`);
    } catch (error) {
      toast.error('Gagal mengexport data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBarcode = (item: DrugInventory) => {
    // Navigate to barcode page
    router.push(`/inventory/${item.id}/barcode`);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedItems(selectedIds);
  };

  const handlePrintQRCodes = () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih item terlebih dahulu');
      return;
    }
    
    // Open QR Print Modal instead of navigating to a page
    setShowQRPrintModal(true);
  };

  const handleExportSelected = async (options: ExportOptions) => {
    try {
      setLoading(true);
      const selectedData = data.filter(item => selectedItems.includes(item.id));
      // In real app, make API call to export selected data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock delay
      toast.success(`${selectedData.length} data terpilih berhasil diexport dalam format ${options.format.toUpperCase()}`);
      setShowSelectedExportModal(false);
    } catch (error) {
      toast.error('Gagal mengexport data terpilih');
    } finally {
      setLoading(false);
    }
  };

  const canAddNew = userRole !== 'ppl';

  return (
    <div className="flex h-screen bg-background" suppressHydrationWarning>
      {/* Filter Sidebar */}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4 lg:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-default-900">Data Stok Obat</h1>
              <p className="text-default-600 mt-1">
                Kelola dan pantau stok obat pertanian
                {selectedItems.length > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    • {selectedItems.length} item dipilih
                  </span>
                )}
              </p>
            </div>
            
            {canAddNew && (
              <Button onClick={() => router.push('/inventory/add')}>
                <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
                Tambah Obat
              </Button>
            )}
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
            <div className="flex-1">
              <InventorySearch
                value={filters.search}
                onChange={handleSearch}
              />
            </div>
            
            <div className="flex items-center gap-3">
              {/* Selected items actions */}
              {selectedItems.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePrintQRCodes}
                    size="sm"
                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <Icon icon="heroicons:qr-code" className="w-4 h-4 mr-2" />
                    Cetak QR ({selectedItems.length})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowSelectedExportModal(true)}
                    size="sm"
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Icon icon="heroicons:arrow-down-tray" className="w-4 h-4 mr-2" />
                    Export Terpilih ({selectedItems.length})
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedItems([])}
                    size="sm"
                    className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  >
                    <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-2" />
                    Batal Pilih
                  </Button>
                </>
              )}
              
              {/* Export all button */}
              <Button
                variant="outline"
                onClick={() => setShowExportModal(true)}
                size="sm"
              >
                <Icon icon="heroicons:arrow-down-tray" className="w-4 h-4 mr-2" />
                Export Semua
              </Button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-default-900">{data.length}</div>
                <div className="text-sm text-default-600">Total Obat</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-warning">{data.filter(d => d.status === 'low').length}</div>
                <div className="text-sm text-default-600">Stok Menipis</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-destructive">{data.filter(d => d.status === 'expired').length}</div>
                <div className="text-sm text-default-600">Kadaluarsa</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{filteredData.length}</div>
                <div className="text-sm text-default-600">Hasil Filter</div>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card>
            <CardContent className="p-0">
              <InventoryTable
                data={paginatedData}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onViewBarcode={handleViewBarcode}
                userRole={userRole}
                loading={loading}
                selectedItems={selectedItems}
                onSelectionChange={handleSelectionChange}
              />
            </CardContent>
          </Card>
          {/* Modal Detail Obat */}
          <MedicineDetailModal
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            medicine={selectedMedicine}
            loading={false}
            deleting={deleting}
            canEdit={userRole !== 'ppl'}
            canDelete={userRole === 'admin' || userRole === 'dinas'}
            onEdit={handleModalEdit}
            onDelete={handleModalDelete}
            onBack={handleModalBack}
            onViewBarcode={handleModalViewBarcode}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                      className={pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={pagination.page === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, pagination.page + 1))}
                      className={pagination.page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        totalRecords={data.length}
        filteredRecords={filteredData.length}
        currentPageRecords={paginatedData.length}
      />

      <ExportModal
        isOpen={showSelectedExportModal}
        onClose={() => setShowSelectedExportModal(false)}
        onExport={handleExportSelected}
        totalRecords={selectedItems.length}
        filteredRecords={selectedItems.length}
        currentPageRecords={selectedItems.length}
        title="Export Data Terpilih"
        description={`Export ${selectedItems.length} item yang dipilih`}
      />

      <QRPrintModal
        isOpen={showQRPrintModal}
        onClose={() => setShowQRPrintModal(false)}
        selectedItems={selectedItems}
        inventoryData={data}
      />
    </div>
  );
};

export default InventoryPage;

// # END OF Inventory Page 