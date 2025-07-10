// # START OF Edit Medicine Page - Form page for editing drug inventory
// Purpose: Provides comprehensive form for editing existing drug inventory items
// Features: Form validation, role-based access, responsive design, toast notifications, prefilled data
// Returns: Complete edit medicine form interface
// Dependencies: Form components, validation, toast, router, types

"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
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

// Custom Components
import PageTitle from "@/components/page-title";
import { SelectWithOther } from "@/components/form/select-with-other";
import { TagInput } from "@/components/form/tag-input";
import { ImageUpload } from "@/components/form/image-upload";

// Types
import { DrugInventory, DrugCategory, Supplier, UserRole } from "@/lib/types/inventory";

// Validation Schema - same as add form
const editMedicineSchema = z.object({
  name: z.string().min(1, "Nama obat wajib diisi").min(3, "Nama obat minimal 3 karakter"),
  producer: z.string().min(1, "Produsen wajib diisi"),
  content: z.string().min(1, "Kandungan wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  supplier: z.string().min(1, "Supplier wajib diisi"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  unit: z.string().min(1, "Satuan wajib diisi"),
  largePack: z.object({
    quantity: z.number().min(0, "Jumlah kemasan tidak boleh negatif"),
    unit: z.string().min(1, "Satuan kemasan wajib diisi"),
    itemsPerPack: z.number().min(1, "Jumlah per kemasan minimal 1"),
  }),
  entryDate: z.date({
    required_error: "Tanggal masuk wajib diisi",
  }),
  expiryDate: z.date({
    required_error: "Tanggal expired wajib diisi",
  }),
  pricePerUnit: z.number().min(0, "Harga tidak boleh negatif").optional(),
  targetPest: z.array(z.string()).min(1, "Minimal satu jenis OPT wajib diisi"),
  storageLocation: z.string().min(1, "Lokasi penyimpanan wajib diisi"),
  notes: z.string().optional(),
  images: z.array(z.any()).optional(),
}).refine((data) => data.expiryDate > data.entryDate, {
  message: "Tanggal expired harus lebih dari tanggal masuk",
  path: ["expiryDate"],
});

type EditMedicineFormData = z.infer<typeof editMedicineSchema>;

// Mock data - in real app, fetch from API
const mockCategories: DrugCategory[] = [
  { id: '1', name: 'Herbisida', description: 'Obat pembasmi gulma' },
  { id: '2', name: 'Insektisida', description: 'Obat pembasmi serangga' },
  { id: '3', name: 'Fungisida', description: 'Obat pembasmi jamur' },
  { id: '4', name: 'Bakterisida', description: 'Obat pembasmi bakteri' },
  { id: '5', name: 'Nematisida', description: 'Obat pembasmi nematoda' },
];

const mockSuppliers: Supplier[] = [
  { id: '1', name: 'PT Agro Kimia', contact: '021-xxx-xxxx' },
  { id: '2', name: 'CV Tani Makmur', contact: '021-yyy-yyyy' },
  { id: '3', name: 'PT Pupuk Nusantara', contact: '021-zzz-zzzz' },
  { id: '4', name: 'UD Maju Jaya', contact: '021-aaa-aaaa' },
];

// Mock data for testing - in real app, this would come from API
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

const unitOptions = [
  'kg', 'gram', 'liter', 'ml', 'botol', 'kaleng', 'pak', 'sachet', 'tablet', 'kapsul'
];

const largePackUnits = [
  'dus', 'box', 'karton', 'jerigen', 'drum', 'pack', 'bundle', 'krat'
];

const EditMedicinePage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const medicineId = params.id as string;
  
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [userRole] = useState<UserRole>('admin'); // In real app, get from auth context
  const [medicineData, setMedicineData] = useState<DrugInventory | null>(null);

  // State for dynamic options
  const [categories, setCategories] = useState(mockCategories);
  const [suppliers, setSuppliers] = useState(mockSuppliers);
  const [units, setUnits] = useState(unitOptions);
  const [largePackUnitsList, setLargePackUnitsList] = useState(largePackUnits);

  // Check authorization - only admin, dinas, and popt can edit medicine
  useEffect(() => {
    if (userRole === 'ppl') {
      toast.error('Anda tidak memiliki akses untuk mengedit obat');
      router.push('/inventory');
      return;
    }
  }, [userRole, router]);

  // Form setup
  const form = useForm<EditMedicineFormData>({
    resolver: zodResolver(editMedicineSchema),
    defaultValues: {
      name: '',
      producer: '',
      content: '',
      categoryId: '',
      supplier: '',
      stock: 0,
      unit: '',
      largePack: {
        quantity: 0,
        unit: '',
        itemsPerPack: 1,
      },
      entryDate: new Date(),
      expiryDate: new Date(),
      pricePerUnit: 0,
      targetPest: [],
      storageLocation: '',
      notes: '',
      images: [],
    },
  });

  // Load medicine data
  useEffect(() => {
    const loadMedicineData = async () => {
      try {
        setDataLoading(true);
        
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
        
        // Populate form with existing data
        form.reset({
          name: data.name,
          producer: data.producer,
          content: data.content,
          categoryId: data.category.id,
          supplier: data.supplier,
          stock: data.stock,
          unit: data.unit,
          largePack: {
            quantity: data.largePack.quantity,
            unit: data.largePack.unit,
            itemsPerPack: data.largePack.itemsPerPack,
          },
          entryDate: data.entryDate,
          expiryDate: data.expiryDate,
          pricePerUnit: data.pricePerUnit || 0,
          targetPest: data.targetPest,
          storageLocation: data.storageLocation,
          notes: data.notes || '',
          images: [], // In real app, load existing images
        });
        
      } catch (error) {
        console.error('Error loading medicine data:', error);
        toast.error('Gagal memuat data obat');
        router.push('/inventory');
      } finally {
        setDataLoading(false);
      }
    };

    if (medicineId) {
      loadMedicineData();
    }
  }, [medicineId, form, router]);

  // Handlers for adding new options
  const handleAddCategory = (newCategory: string) => {
    const newCategoryObj = {
      id: Date.now().toString(),
      name: newCategory,
      description: `Kategori ${newCategory}`,
    };
    setCategories(prev => [...prev, newCategoryObj]);
    // In real app, save to backend
  };

  const handleAddSupplier = (newSupplier: string) => {
    const newSupplierObj = {
      id: Date.now().toString(),
      name: newSupplier,
      contact: '-',
    };
    setSuppliers(prev => [...prev, newSupplierObj]);
    // In real app, save to backend
  };

  const handleAddUnit = (newUnit: string) => {
    setUnits(prev => [...prev, newUnit]);
    // In real app, save to backend
  };

  const handleAddLargePackUnit = (newUnit: string) => {
    setLargePackUnitsList(prev => [...prev, newUnit]);
    // In real app, save to backend
  };

  // Form submission handler
  const onSubmit = async (data: EditMedicineFormData) => {
    setLoading(true);
    
    try {
      // Prepare data for API
      const updatedMedicineData = {
        ...medicineData,
        ...data,
        lastUpdated: new Date(),
        updatedBy: 'Current User', // In real app, get from auth context
      };

      // In real app, make API call to update medicine
      console.log('Updating medicine:', updatedMedicineData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success notification
      toast.success('Data obat berhasil diperbarui!', {
        description: `${data.name} telah diperbarui`,
      });

      // Redirect to inventory page
      router.push('/inventory');
      
    } catch (error) {
      console.error('Error updating medicine:', error);
      toast.error('Gagal memperbarui data obat', {
        description: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  // Render unauthorized message for PPL users
  if (userRole === 'ppl') {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Anda tidak memiliki akses untuk mengedit obat. Silakan hubungi administrator.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state while fetching data
  if (dataLoading) {
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
          <PageTitle title="Edit Obat" className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Perbarui informasi obat: <span className="font-medium">{medicineData.name}</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleBack}
          className="w-fit"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Informasi Obat
          </CardTitle>
          <CardDescription>
            Perbarui detail obat pertanian yang sudah tersimpan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Medicine Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Obat *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Roundup 486 SL" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Producer */}
                <FormField
                  control={form.control}
                  name="producer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produsen *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Monsanto" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Kandungan *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Glifosat 486 g/l" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Sebutkan bahan aktif dan konsentrasinya
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category */}
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kategori Obat *</FormLabel>
                      <FormControl>
                        <SelectWithOther
                          options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                          value={field.value}
                          onChange={field.onChange}
                          onAddNew={handleAddCategory}
                          placeholder="Pilih kategori obat"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Supplier */}
                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <FormControl>
                        <SelectWithOther
                          options={suppliers.map(supplier => ({ value: supplier.name, label: supplier.name }))}
                          value={field.value}
                          onChange={field.onChange}
                          onAddNew={handleAddSupplier}
                          placeholder="Pilih supplier"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Stock Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Stok</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Current Stock */}
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Stok Saat Ini *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Unit */}
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Satuan *</FormLabel>
                        <FormControl>
                          <SelectWithOther
                            options={units.map(unit => ({ value: unit, label: unit }))}
                            value={field.value}
                            onChange={field.onChange}
                            onAddNew={handleAddUnit}
                            placeholder="Pilih satuan"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Price per Unit */}
                  <FormField
                    control={form.control}
                    name="pricePerUnit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Harga per Unit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Opsional</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Large Pack Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Kemasan Besar</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Large Pack Quantity */}
                  <FormField
                    control={form.control}
                    name="largePack.quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Kemasan Besar</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Large Pack Unit */}
                  <FormField
                    control={form.control}
                    name="largePack.unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Satuan Kemasan Besar</FormLabel>
                        <FormControl>
                          <SelectWithOther
                            options={largePackUnitsList.map(unit => ({ value: unit, label: unit }))}
                            value={field.value}
                            onChange={field.onChange}
                            onAddNew={handleAddLargePackUnit}
                            placeholder="Pilih satuan kemasan"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Items per Pack */}
                  <FormField
                    control={form.control}
                    name="largePack.itemsPerPack"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah per Kemasan</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            placeholder="1"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Berapa unit dalam 1 kemasan besar
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Date Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Tanggal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Entry Date */}
                  <FormField
                    control={form.control}
                    name="entryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Masuk *</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Pilih tanggal masuk"
                            allowClear
                            displayFormat="dd/MM/yyyy"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Expiry Date */}
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Expired *</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Pilih tanggal expired"
                            allowClear
                            displayFormat="dd/MM/yyyy"
                            minDate={form.getValues('entryDate')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Tambahan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Target Pest */}
                  <FormField
                    control={form.control}
                    name="targetPest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis OPT *</FormLabel>
                        <FormControl>
                          <TagInput
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Ketik jenis OPT dan tekan Enter atau koma..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Storage Location */}
                  <FormField
                    control={form.control}
                    name="storageLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lokasi Penyimpanan *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Contoh: Gudang A-1" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan/Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Masukkan catatan tambahan tentang obat ini..."
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Opsional - Informasi tambahan tentang penyimpanan, penggunaan, atau catatan khusus
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Upload Images Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Unggah Foto/Dokumen</h3>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foto Obat, Label, atau Dokumen Pendukung</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || []}
                          onChange={field.onChange}
                          maxFiles={3}
                          maxSize={5}
                        />
                      </FormControl>
                      <FormDescription>
                        Opsional - Unggah foto obat, label kemasan, atau dokumen pendukung lainnya
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  Batal
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMedicinePage;

// # END OF Edit Medicine Page
