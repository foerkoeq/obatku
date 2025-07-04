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
import { Icon } from "@iconify/react";
import { HydrationSafe } from "@/components/ui/hydration-safe";
import { toast } from "sonner";

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

import {
  mockTransactionData,
  getTransactionsByRole,
  getTransactionsByStatus,
  getPendingApprovals,
  getPendingDistributions,
  getTransactionStats
} from "@/lib/data/transaction-demo";

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let transactionData: Transaction[];
      
      // Filter data based on user role
      if (permissions.viewScope === 'own') {
        transactionData = getTransactionsByRole(user.role, user.id);
      } else {
        transactionData = mockTransactionData;
      }
      
      setData(transactionData);
    } catch (error) {
      toast.error("Gagal memuat data transaksi");
    } finally {
      setLoading(false);
    }
  }, [user.role, user.id, permissions.viewScope]);

  // Filter data based on search and filters
  const applyFilters = useCallback(() => {
    let filtered = [...data];

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
  }, [data, filters]);

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
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-default-900">Daftar Transaksi</h1>
          <p className="text-default-600 mt-1">
            Kelola transaksi permintaan obat pertanian
          </p>
        </div>

        {permissions.canEdit && (
          <Button onClick={() => router.push('/transactions/submission')}>
            <HydrationSafe fallback={<div className="h-4 w-4 mr-2 bg-current opacity-50 rounded-sm" />}>
              <Icon icon="heroicons:plus" className="h-4 w-4 mr-2 flex-shrink-0" />
            </HydrationSafe>
            Buat Pengajuan
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-default-600">
              Total Transaksi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-default-900">
              {stats.total}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-default-600">
              Menunggu Persetujuan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats.pendingApprovals}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-default-600">
              Siap Distribusi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.pendingDistributions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-default-600">
              Selesai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completed}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <TransactionSearch
            value={filters.search}
            onChange={handleSearchChange}
            showAdvanced={true}
            onAdvancedSearch={(advancedFilters) => {
              // Handle advanced search filters - simple string search, not array filters
              setFilters(prev => ({
                ...prev,
                search: prev.search // Keep existing search
                // Advanced filters are handled within the search component for filtering
              }));
            }}
          />
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="shrink-0"
            >
              <HydrationSafe fallback={<div className="h-4 w-4 mr-2 bg-current opacity-50 rounded-sm" />}>
                <Icon icon="heroicons:x-mark" className="h-4 w-4 mr-2 flex-shrink-0" />
              </HydrationSafe>
              Reset Filter
            </Button>
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-default-700 mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-1">
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
              <label className="text-sm font-medium text-default-700 mb-2 block">
                Prioritas
              </label>
              <div className="flex flex-wrap gap-1">
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kabupaten" />
                </SelectTrigger>
                <SelectContent>
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih komoditas" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCommodities.map((commodity) => (
                    <SelectItem key={commodity} value={commodity}>
                      {commodity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-default-600">
          Menampilkan {paginatedData.length} dari {filteredData.length} transaksi
        </p>
        
        {permissions.canExport && (
          <Button variant="outline" size="sm">
            <HydrationSafe fallback={<div className="h-4 w-4 mr-2 bg-current opacity-50 rounded-sm" />}>
              <Icon icon="heroicons:arrow-down-tray" className="h-4 w-4 mr-2 flex-shrink-0" />
            </HydrationSafe>
            Export
          </Button>
        )}
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Transaksi</CardTitle>
          <CardDescription>
            Kelola dan monitor semua transaksi permintaan obat pertanian
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
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