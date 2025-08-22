// # START OF Stock Management Page - Page for stock adjustment and management
// Purpose: Provides comprehensive interface for stock management operations
// Features: Stock adjustment, low stock alerts, batch tracking, expiry management
// Returns: Complete stock management page interface
// Dependencies: StockManagementForm component, layout, auth

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, TrendingUp, AlertTriangle, Package } from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Custom Components
import PageTitle from "@/components/page-title";
import StockManagementForm from "@/components/inventory/stock-management-form";

// Services
import { inventoryService } from "@/lib/services/inventory.service";

const StockManagementPage: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStock: 0,
    lowStockCount: 0,
    expiringCount: 0,
    totalValue: 0,
  });

  // Load stats on component mount
  useState(() => {
    const loadStats = async () => {
      try {
        const response = await inventoryService.getInventoryStats();
        if (response.data) {
          setStats({
            totalStock: response.data.totalStock || 0,
            lowStockCount: response.data.lowStockCount || 0,
            expiringCount: response.data.expiringCount || 0,
            totalValue: response.data.totalValue || 0,
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  });

  const handleBack = () => {
    router.back();
  };

  const handleSuccess = () => {
    // Refresh stats after successful operation
    const loadStats = async () => {
      try {
        const response = await inventoryService.getInventoryStats();
        if (response.data) {
          setStats({
            totalStock: response.data.totalStock || 0,
            lowStockCount: response.data.lowStockCount || 0,
            expiringCount: response.data.expiringCount || 0,
            totalValue: response.data.totalValue || 0,
          });
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Button>
        
        <PageTitle 
          title="Manajemen Stok" 
          description="Kelola stok obat, lakukan penyesuaian, dan pantau alert stok rendah"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stok</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Item tersedia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Rendah</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Perlu restock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Akan Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiringCount}</div>
            <p className="text-xs text-muted-foreground">
              Dalam 30 hari
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Rp {stats.totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Nilai inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Management Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Penyesuaian Stok
          </CardTitle>
          <CardDescription>
            Lakukan penyesuaian stok, pantau stok rendah, dan kelola batch obat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StockManagementForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/inventory')}
          >
            <Package className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Lihat Inventory</div>
              <div className="text-sm text-muted-foreground">
                Lihat semua obat dan stok
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/inventory/add')}
          >
            <Package className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Tambah Obat</div>
              <div className="text-sm text-muted-foreground">
                Tambah obat baru ke inventory
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/inventory/categories')}
          >
            <Package className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Kelola Kategori</div>
              <div className="text-sm text-muted-foreground">
                Atur kategori obat
              </div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StockManagementPage;
