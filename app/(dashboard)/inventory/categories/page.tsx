// # START OF Category Management Page - Page for category CRUD operations
// Purpose: Provides comprehensive interface for category management
// Features: Category CRUD operations, hierarchical categories, validation
// Returns: Complete category management page interface
// Dependencies: CategoryManagementForm component, layout, auth

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FolderOpen, Plus, Settings } from "lucide-react";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Custom Components
import PageTitle from "@/components/page-title";
import CategoryManagementForm from "@/components/inventory/category-management-form";

// Services
import { inventoryService } from "@/lib/services/inventory.service";

const CategoryManagementPage: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCategories: 0,
    activeCategories: 0,
    rootCategories: 0,
    subCategories: 0,
  });

  // Load stats on component mount
  useState(() => {
    const loadStats = async () => {
      try {
        const response = await inventoryService.getCategories();
        if (response.data) {
          const categories = response.data;
          const rootCategories = categories.filter(cat => !cat.parentId);
          const subCategories = categories.filter(cat => cat.parentId);
          const activeCategories = categories.filter(cat => cat.isActive);

          setStats({
            totalCategories: categories.length,
            activeCategories: activeCategories.length,
            rootCategories: rootCategories.length,
            subCategories: subCategories.length,
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
        const response = await inventoryService.getCategories();
        if (response.data) {
          const categories = response.data;
          const rootCategories = categories.filter(cat => !cat.parentId);
          const subCategories = categories.filter(cat => cat.parentId);
          const activeCategories = categories.filter(cat => cat.isActive);

          setStats({
            totalCategories: categories.length,
            activeCategories: activeCategories.length,
            rootCategories: rootCategories.length,
            subCategories: subCategories.length,
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
          title="Manajemen Kategori" 
          description="Kelola kategori obat untuk organisasi inventory yang lebih baik"
        />
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kategori</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Kategori tersedia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori Aktif</CardTitle>
            <Badge variant="default" className="h-4 w-4 bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeCategories}</div>
            <p className="text-xs text-muted-foreground">
              Dapat digunakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kategori Induk</CardTitle>
            <FolderOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.rootCategories}</div>
            <p className="text-xs text-muted-foreground">
              Kategori utama
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub Kategori</CardTitle>
            <FolderOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.subCategories}</div>
            <p className="text-xs text-muted-foreground">
              Kategori turunan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Management Form */}
      <CategoryManagementForm onSuccess={handleSuccess} />

      {/* Quick Actions */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/inventory')}
          >
            <FolderOpen className="h-6 w-6" />
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
            <Plus className="h-6 w-6" />
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
            onClick={() => router.push('/inventory/stock-management')}
          >
            <Settings className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Kelola Stok</div>
              <div className="text-sm text-muted-foreground">
                Atur stok dan lakukan penyesuaian
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Information Card */}
      <Card className="mt-8 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-500" />
            Tips Penggunaan Kategori
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Struktur Hierarkis</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Buat kategori induk untuk kelompok utama</li>
                <li>• Gunakan sub-kategori untuk detail spesifik</li>
                <li>• Contoh: Pestisida → Insektisida → Kontak</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Nama Kategori</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gunakan nama yang jelas dan konsisten</li>
                <li>• Hindari nama yang terlalu panjang</li>
                <li>• Gunakan bahasa yang mudah dipahami</li>
              </ul>
            </div>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Catatan:</strong> Kategori yang sudah digunakan oleh obat tidak dapat dihapus. 
              Pastikan untuk merencanakan struktur kategori dengan baik sebelum implementasi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManagementPage;
