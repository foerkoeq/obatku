// # START OF Category Management Form - Component for category CRUD operations
// Purpose: Provides comprehensive form for creating, editing, and managing categories
// Features: Category CRUD operations, hierarchical categories, validation
// Returns: Complete category management form interface
// Dependencies: Form components, validation, toast, inventory service

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit, Trash2, Save, X, FolderOpen } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Services
import { inventoryService } from "@/lib/services/inventory.service";

// Types
import { Category } from "@/lib/services/inventory.service";

// Validation Schema
const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi").min(2, "Nama kategori minimal 2 karakter"),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryManagementFormProps {
  onSuccess?: () => void;
}

const CategoryManagementForm: React.FC<CategoryManagementFormProps> = ({
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  // Form setup
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parentId: '',
      isActive: true,
    },
  });

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await inventoryService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Gagal memuat daftar kategori');
    }
  };

  // Handle form submission
  const onSubmit = async (data: CategoryFormData) => {
    setLoading(true);
    
    try {
      if (editingCategory) {
        // Update existing category
        await inventoryService.updateCategory(editingCategory.id, data);
        toast.success('Kategori berhasil diperbarui!', {
          description: `${data.name} telah diperbarui`,
        });
      } else {
        // Create new category
        await inventoryService.createCategory(data);
        toast.success('Kategori berhasil ditambahkan!', {
          description: `${data.name} telah ditambahkan`,
        });
      }

      // Refresh categories
      await loadCategories();
      
      // Reset form and close dialog
      form.reset();
      setEditingCategory(null);
      setIsDialogOpen(false);
      
      onSuccess?.();
      
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Gagal menyimpan kategori', {
        description: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  // Handle delete category
  const handleDelete = async (category: Category) => {
    try {
      // Check if category has children
      const hasChildren = categories.some(cat => cat.parentId === category.id);
      if (hasChildren) {
        toast.error('Tidak dapat menghapus kategori yang memiliki sub-kategori');
        return;
      }

      // Check if category is used by medicines
      const medicinesResponse = await inventoryService.getMedicines({ categoryId: category.id });
      if (medicinesResponse.data && medicinesResponse.data.length > 0) {
        toast.error('Tidak dapat menghapus kategori yang masih digunakan oleh obat');
        return;
      }

      await inventoryService.deleteCategory(category.id);
      toast.success('Kategori berhasil dihapus!', {
        description: `${category.name} telah dihapus`,
      });
      
      await loadCategories();
      onSuccess?.();
      
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Gagal menghapus kategori', {
        description: 'Terjadi kesalahan saat menghapus data. Silakan coba lagi.',
      });
    }
  };

  // Handle add new category
  const handleAddNew = () => {
    setEditingCategory(null);
    form.reset({
      name: '',
      description: '',
      parentId: '',
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  // Handle cancel
  const handleCancel = () => {
    form.reset();
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'N/A';
  };

  // Get root categories (no parent)
  const rootCategories = categories.filter(cat => !cat.parentId);
  
  // Get sub-categories
  const getSubCategories = (parentId: string) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  // Render category tree
  const renderCategoryTree = (categoryList: Category[], level: number = 0) => {
    return categoryList.map(category => {
      const subCategories = getSubCategories(category.id);
      const hasChildren = subCategories.length > 0;
      
      return (
        <div key={category.id}>
          <TableRow className={level > 0 ? 'bg-muted/30' : ''}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {level > 0 && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: level }).map((_, i) => (
                      <div key={i} className="w-2 h-px bg-border" />
                    ))}
                    <FolderOpen className="h-3 w-3 text-muted-foreground" />
                  </div>
                )}
                {category.name}
                {hasChildren && (
                  <Badge variant="secondary" className="text-xs">
                    {subCategories.length} sub
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {category.description || '-'}
            </TableCell>
            <TableCell>
              {category.parentId ? getCategoryName(category.parentId) : 'Root'}
            </TableCell>
            <TableCell>
              <Badge variant={category.isActive ? "default" : "secondary"}>
                {category.isActive ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(category)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeletingCategory(category)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus kategori "{category.name}"? 
                        Tindakan ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(category)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TableCell>
          </TableRow>
          {hasChildren && renderCategoryTree(subCategories, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Manajemen Kategori</h2>
          <p className="text-muted-foreground">
            Kelola kategori obat untuk organisasi inventory yang lebih baik
          </p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>
            Semua kategori obat yang tersedia dalam sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum ada kategori</h3>
              <p className="text-muted-foreground mb-4">
                Mulai dengan menambahkan kategori pertama untuk mengorganisir obat-obatan
              </p>
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Kategori Pertama
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Kategori Induk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderCategoryTree(rootCategories)}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Perbarui informasi kategori yang sudah ada'
                : 'Tambahkan kategori baru untuk mengorganisir obat-obatan'
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Category Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kategori *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Contoh: Herbisida, Insektisida, Fungisida" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Nama kategori yang akan digunakan untuk mengelompokkan obat
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Deskripsi singkat tentang kategori ini..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Penjelasan tambahan tentang kategori (opsional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent Category */}
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategori Induk</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori induk (opsional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tidak ada (Root Category)</SelectItem>
                          {categories
                            .filter(cat => cat.id !== editingCategory?.id) // Prevent self-reference
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Pilih kategori induk jika ini adalah sub-kategori
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status Aktif</FormLabel>
                      <FormDescription>
                        Kategori aktif dapat digunakan untuk obat-obatan
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value.toString()}>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Aktif</SelectItem>
                          <SelectItem value="false">Tidak Aktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CategoryManagementForm;
