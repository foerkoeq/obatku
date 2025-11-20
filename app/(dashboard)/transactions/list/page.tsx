// # START OF Transaction List Page - Main transaction management page
// Purpose: Display transaction list with search, filter, and role-based functionality
// Features: Search, filter, table, pagination, modals, role-based access
// Returns: Complete transaction list interface
// Dependencies: Transaction components, pagination, toast

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Icon } from "@iconify/react";
import { HydrationSafe } from "@/components/ui/hydration-safe";
import { toast } from "sonner";
import SiteBreadcrumb from "@/components/site-breadcrumb";
import { colorBank, ColorBankKey } from "@/components/ui/color-bank";
import { cn } from "@/lib/utils";

// Import transaction components
import {
  TransactionTable,
  TransactionStatusIndicator,
  TransactionDetailModal,
  TransactionSearch
} from "@/components/transactions";

// Import types and data
import {
  Transaction,
  TransactionStatus,
  TransactionFilters,
  TransactionPaginationConfig,
  UserRole,
  Priority,
  getRolePermissions
} from "@/lib/types/transaction";

import { mockTransactionData, getTransactionStats } from "@/lib/data/transaction-demo";
import { transactionService } from '@/lib/services/transaction.service';

// Mock user data - in real app, get from auth context
const MOCK_USER = {
  id: 'PPL-001',
  role: 'admin' as UserRole,
  name: 'Admin User',
  district: 'Sragen'
};

const TransactionListPage: React.FC = () => {
  const [user] = useState(MOCK_USER);
  const [data, setData] = useState<Transaction[]>([]);
  const [filteredData, setFilteredData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const router = useRouter();

  // Filters and search
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    status: [],
    priority: [],
    district: [],
    commodity: [],
    pestType: [],
    dateRange: {},
    bppOfficer: [],
    approvedBy: [],
  });

  // Pagination
  const [pagination, setPagination] = useState<TransactionPaginationConfig>({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Get permissions for current user
  const permissions = getRolePermissions(user.role);
  const stats = getTransactionStats();

  // Load data based on user role
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Call backend list endpoint - here we keep simple querystring for pagination
      const resp = await transactionService.list(`?page=${pagination.page}&limit=${pagination.limit}`);
      if (resp && resp.success) {
        // resp.data expected to be PaginationResponse<Transaction>
        const payload: any = resp.data;
        setData(payload.data || []);
        setPagination(prev => ({ ...prev, total: payload.pagination?.total || (payload.data||[]).length }));
      } else {
        // Fallback to mock data if API unavailable
        setData(mockTransactionData);
      }
    } catch (error) {
      toast.error("Gagal memuat data transaksi");
    } finally {
      setLoading(false);
    }
  }, [user.role, user.id, permissions.viewScope]);

  // Filter data based on search and filters
  const applyFilters = useCallback(() => {
    let filtered = [...data];

    // Role-based filtering
    if (user.role === 'ppl') {
      // PPL: hanya data yang mereka usulkan
      filtered = filtered.filter(item => item.createdBy === user.id || item.bppOfficer.id === user.id);
    } else if (user.role === 'popt') {
      // POPT: hanya data di kecamatan mereka
      filtered = filtered.filter(item => 
        item.farmerGroup.subDistrict.toLowerCase() === user.district?.toLowerCase() ||
        item.farmerGroup.district.toLowerCase() === user.district?.toLowerCase()
      );
    }
    // Admin dan Dinas: semua data (tidak perlu filter)

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.letterNumber.toLowerCase().includes(searchLower) ||
        item.bppOfficer.name.toLowerCase().includes(searchLower) ||
        item.farmerGroup.name.toLowerCase().includes(searchLower) ||
        item.farmerGroup.leader.toLowerCase().includes(searchLower) ||
        item.farmingDetails.commodity.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(item => filters.status.includes(item.status));
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(item => filters.priority.includes(item.priority));
    }

    // District filter
    if (filters.district.length > 0) {
      filtered = filtered.filter(item => 
        filters.district.some(district => 
          item.farmerGroup.district.toLowerCase().includes(district.toLowerCase())
        )
      );
    }

    // Commodity filter
    if (filters.commodity.length > 0) {
      filtered = filtered.filter(item =>
        filters.commodity.some(commodity =>
          item.farmingDetails.commodity.toLowerCase().includes(commodity.toLowerCase())
        )
      );
    }

    setFilteredData(filtered);
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 1 // Reset to first page when filtering
    }));
  }, [data, filters, user.role, user.id, user.district]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, pagination.page, pagination.limit]);

  // Calculate total pages
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  // Event handlers
  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: TransactionStatus) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const handlePriorityFilter = (priority: Priority) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const handleRowClick = (transaction: Transaction) => {
    // Fetch fresh detail from API
    (async () => {
      try {
        setLoading(true);
        const resp = await transactionService.get(transaction.id);
        if (resp && resp.success) {
          setSelectedTransaction(resp.data as Transaction);
        } else {
          setSelectedTransaction(transaction);
        }
        setShowDetailModal(true);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat detail transaksi');
        setSelectedTransaction(transaction);
        setShowDetailModal(true);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleApprove = (transaction: Transaction) => {
    router.push(`/transactions/${transaction.id}/approval`);
  };

  const handleDistribute = (transaction: Transaction) => {
    router.push(`/transactions/${transaction.id}/distribution`);
  };

  const handleEdit = (transaction: Transaction) => {
    router.push(`/transactions/${transaction.id}/edit`);
  };

  const handleDelete = (transaction: Transaction) => {
    // TODO: Implement delete functionality
    toast.success(`Transaction ${transaction.letterNumber} deleted`);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      district: [],
      commodity: [],
      pestType: [],
      dateRange: {},
      bppOfficer: [],
      approvedBy: [],
    });
  };

  // Effects
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Get unique values for filters
  const uniqueDistricts = useMemo(() => 
    [...new Set(data.map(t => t.farmerGroup.district))].sort()
  , [data]);

  const uniqueCommodities = useMemo(() => 
    [...new Set(data.map(t => t.farmingDetails.commodity))].sort()
  , [data]);

  // Stats cards configuration with inventory style
  const statsCards = [
    {
      id: 'total',
      label: 'Total Transaksi',
      value: stats.total,
      icon: 'heroicons:document-text',
      colorKey: 'blue' as ColorBankKey,
    },
    {
      id: 'pending',
      label: 'Menunggu Persetujuan',
      value: stats.pendingApprovals,
      icon: 'heroicons:clock',
      colorKey: 'amber' as ColorBankKey,
    },
    {
      id: 'ready',
      label: 'Siap Distribusi',
      value: stats.pendingDistributions,
      icon: 'heroicons:truck',
      colorKey: 'emerald' as ColorBankKey,
    },
    {
      id: 'completed',
      label: 'Selesai',
      value: stats.completed,
      icon: 'heroicons:check-circle',
      colorKey: 'rose' as ColorBankKey,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <SiteBreadcrumb>
        {permissions.canEdit && (
          <Button onClick={() => router.push('/transactions/submission')}>
            <HydrationSafe fallback={<div className="h-4 w-4 mr-2 bg-current opacity-50 rounded-sm" />}>
              <Icon icon="heroicons:plus" className="h-4 w-4 mr-2 flex-shrink-0" />
            </HydrationSafe>
            Buat Pengajuan
          </Button>
        )}
      </SiteBreadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-default-900">Daftar Transaksi</h1>
        <p className="text-default-600 mt-1">
          Kelola transaksi permintaan obat pertanian
        </p>
      </div>

      {/* Stats Cards with Inventory Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const colors = colorBank[stat.colorKey];
          
          return (
            <Card
              key={stat.id}
              className={cn(
                "transition-all duration-200 hover:shadow-lg border-2",
                `${colors.bgLight} ${colors.border} hover:shadow-md`
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-2">
                    <div className={cn(
                      "text-2xl font-bold mb-1",
                      colors.text
                    )}>
                      {stat.value}
                    </div>
                    <div className={cn(
                      "text-sm",
                      colors.text
                    )}>{stat.label}</div>
                  </div>
                  <div className={cn(
                    "p-2 rounded-lg transition-colors flex-shrink-0",
                    `${colors.bg} text-white opacity-80`
                  )}>
                    <Icon icon={stat.icon} className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transaction Table with Combined Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
              <CardDescription>
                Kelola dan monitor semua transaksi permintaan obat pertanian
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="w-64">
                <TransactionSearch
                  value={filters.search}
                  onChange={handleSearchChange}
                  showAdvanced={false}
                />
              </div>
              
              {/* Filter Side Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Icon icon="heroicons:funnel" className="w-4 h-4" />
                    Filter
                    {(filters.status.length > 0 || filters.priority.length > 0 || filters.district.length > 0 || filters.commodity.length > 0) && (
                      <Badge className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                        {filters.status.length + filters.priority.length + filters.district.length + filters.commodity.length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filter Transaksi</SheetTitle>
                  </SheetHeader>
                  
                  <div className="space-y-6 mt-6">
                    {/* Status Filter */}
                    <div>
                      <label className="text-sm font-medium text-default-700 mb-3 block">
                        Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['submitted', 'under_review', 'approved', 'completed', 'rejected'] as TransactionStatus[]).map((status) => (
                          <div
                            key={status}
                            className="cursor-pointer"
                            onClick={() => handleStatusFilter(status)}
                          >
                            <TransactionStatusIndicator 
                              status={status} 
                              showText={true}
                              className={filters.status.includes(status) ? "opacity-100" : "opacity-50"}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Priority Filter */}
                    <div>
                      <label className="text-sm font-medium text-default-700 mb-3 block">
                        Prioritas
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((priority) => (
                          <Badge
                            key={priority}
                            className={`cursor-pointer text-xs ${filters.priority.includes(priority) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                            onClick={() => handlePriorityFilter(priority)}
                          >
                            {priority}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* District Filter */}
                    <div>
                      <label className="text-sm font-medium text-default-700 mb-2 block">
                        Kabupaten
                      </label>
                      <Select
                        value={filters.district[0] || ""}
                        onValueChange={(value) => {
                          setFilters(prev => ({
                            ...prev,
                            district: value ? [value] : []
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kabupaten" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Semua Kabupaten</SelectItem>
                          {uniqueDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Commodity Filter */}
                    <div>
                      <label className="text-sm font-medium text-default-700 mb-2 block">
                        Komoditas
                      </label>
                      <Select
                        value={filters.commodity[0] || ""}
                        onValueChange={(value) => {
                          setFilters(prev => ({
                            ...prev,
                            commodity: value ? [value] : []
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih komoditas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Semua Komoditas</SelectItem>
                          {uniqueCommodities.map((commodity) => (
                            <SelectItem key={commodity} value={commodity}>
                              {commodity}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={resetFilters}
                        className="w-full"
                      >
                        <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2" />
                        Reset Filter
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {permissions.canExport && (
                <Button variant="outline" size="sm">
                  <HydrationSafe fallback={<div className="h-4 w-4 mr-2 bg-current opacity-50 rounded-sm" />}>
                    <Icon icon="heroicons:arrow-down-tray" className="h-4 w-4 mr-2 flex-shrink-0" />
                  </HydrationSafe>
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Results Count */}
          <div className="px-6 py-3 border-b flex justify-between items-center">
            <p className="text-sm text-default-600">
              Menampilkan {paginatedData.length} dari {filteredData.length} transaksi
            </p>
          </div>
          
          <TransactionTable
            data={paginatedData}
            loading={loading}
            userRole={user.role}
            onRowClick={handleRowClick}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onDistribute={handleDistribute}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPagination(prev => ({ 
                    ...prev, 
                    page: Math.max(1, prev.page - 1) 
                  }))}
                  className={pagination.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    isActive={pagination.page === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPagination(prev => ({ 
                    ...prev, 
                    page: Math.min(totalPages, prev.page + 1) 
                  }))}
                  className={pagination.page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Transaction Detail Modal */}
      <TransactionDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onApprove={handleApprove}
        onDistribute={handleDistribute}
        onEdit={handleEdit}
        userRole={user.role}
      />
    </div>
  );
};

export default TransactionListPage;

// # END OF Transaction List Page 