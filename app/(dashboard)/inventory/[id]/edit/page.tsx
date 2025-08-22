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

// Services
import { inventoryService } from "@/lib/services/inventory.service";

// Types
import { DrugInventory, DrugCategory, Supplier, UserRole } from "@/lib/types/inventory";

// Validation Schema - same as add form
const editMedicineSchema = z.object({
  name: z.string().min(1, "Nama obat wajib diisi").min(3, "Nama obat minimal 3 karakter"),
  producer: z.string().min(1, "Produsen wajib diisi"),
  content: z.string().min(1, "Kandungan wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  supplierId: z.string().min(1, "Supplier wajib dipilih"),
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

// Default options
const unitOptions = [
  'kg', 'liter', 'botol', 'sachet', 'tablet', 'kapsul', 'ampul', 'vial', 'tube', 'cream', 'salep'
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
  const [categories, setCategories] = useState<DrugCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
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
      supplierId: '',
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

  // Load medicine data and options
  useEffect(() => {
    const loadData = async () => {
      if (medicineId) {
        try {
          setDataLoading(true);
          
          // Load medicine data
          const medicineResponse = await inventoryService.getMedicineById(medicineId);
          const medicine = medicineResponse.data;
          setMedicineData(medicine);
          
          // Load categories
          const categoriesResponse = await inventoryService.getCategories();
          setCategories(categoriesResponse.data || []);
          
          // Load suppliers
          const suppliersResponse = await inventoryService.getSuppliers();
          setSuppliers(suppliersResponse.data || []);
          
          // Load stock data
          const stockResponse = await inventoryService.getStock({ medicineId });
          const stock = stockResponse.data?.[0];
          
          // Pre-populate form
          form.reset({
            name: medicine.name,
            producer: medicine.genericName || '',
            content: medicine.activeIngredient,
            categoryId: medicine.categoryId,
            supplierId: medicine.supplierId,
            stock: stock?.quantity || 0,
            unit: medicine.unit,
            largePack: {
              quantity: 0, // This would need to be fetched from a separate table
              unit: '',
              itemsPerPack: 1,
            },
            entryDate: stock ? new Date(stock.manufacturingDate) : new Date(),
            expiryDate: stock ? new Date(stock.expiryDate) : new Date(),
            pricePerUnit: stock?.unitPrice || 0,
            targetPest: [], // This would need to be fetched from a separate table
            storageLocation: stock?.location || '',
            notes: medicine.description || '',
            images: medicine.image ? [medicine.image] : [],
          });
          
        } catch (error) {
          console.error('Error loading medicine data:', error);
          toast.error('Gagal memuat data obat');
          router.push('/inventory');
        } finally {
          setDataLoading(false);
        }
      }
    };

    loadData();
  }, [medicineId, form, router]);

  // Handlers for adding new options
  const handleAddCategory = async (newCategory: string) => {
    try {
      const response = await inventoryService.createCategory({
        name: newCategory,
        description: `Kategori ${newCategory}`,
      });
      
      const newCategoryObj = response.data;
      setCategories(prev => [...prev, newCategoryObj]);
      
      // Set the new category as selected
      form.setValue('categoryId', newCategoryObj.id);
      
      toast.success('Kategori berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Gagal menambahkan kategori');
    }
  };

  const handleAddSupplier = async (newSupplier: string) => {
    try {
      const response = await inventoryService.createSupplier({
        name: newSupplier,
        contact: '-',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: 'Indonesia',
        postalCode: '',
      });
      
      const newSupplierObj = response.data;
      setSuppliers(prev => [...prev, newSupplierObj]);
      
      // Set the new supplier as selected
      form.setValue('supplierId', newSupplierObj.id);
      
      toast.success('Supplier berhasil ditambahkan');
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast.error('Gagal menambahkan supplier');
    }
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
        name: data.name,
        genericName: data.producer,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        description: data.notes,
        activeIngredient: data.content,
        dosageForm: data.unit,
        strength: data.content,
        unit: data.unit,
        requiresPrescription: false,
      };

      // Update medicine
      await inventoryService.updateMedicine(medicineId, updatedMedicineData);
      
      // If images are uploaded, upload them
      if (data.images && data.images.length > 0) {
        for (const image of data.images) {
          if (image instanceof File) {
            await inventoryService.uploadMedicineImage(medicineId, image);
          }
        }
      }

      // Update stock if changed
      if (medicineData) {
        const stockResponse = await inventoryService.getStock({ medicineId });
        const existingStock = stockResponse.data?.[0];
        
        if (existingStock) {
          await inventoryService.updateStock(existingStock.id, {
            quantity: data.stock,
            unitPrice: data.pricePerUnit || 0,
            sellingPrice: data.pricePerUnit || 0,
            expiryDate: data.expiryDate.toISOString(),
            location: data.storageLocation,
          });
        }
      }

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

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (!medicineData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Data obat tidak ditemukan. Silakan kembali ke halaman inventory.
          </AlertDescription>
        </Alert>
        <Button onClick={handleBack} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

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
          title="Edit Obat" 
          description={`Edit data obat: ${medicineData.name}`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Form Edit Obat
          </CardTitle>
          <CardDescription>
            Edit informasi obat yang sudah ada. Field dengan tanda * wajib diisi.
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
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <FormControl>
                        <SelectWithOther
                          options={suppliers.map(sup => ({ value: sup.id, label: sup.name }))}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Stok *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Large Pack Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          placeholder="Pilih satuan"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="entryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Masuk *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Expired *</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Target Pest Section */}
              <FormField
                control={form.control}
                name="targetPest"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis OPT yang Dikendalikan *</FormLabel>
                    <FormControl>
                      <TagInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Ketik jenis OPT dan tekan Enter"
                        maxTags={10}
                      />
                    </FormControl>
                    <FormDescription>
                      Masukkan jenis Organisme Pengganggu Tumbuhan yang dapat dikendalikan oleh obat ini
                    </FormDescription>
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
                        placeholder="Contoh: Gudang A, Rak 1, Level 2" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Tentukan lokasi penyimpanan yang spesifik untuk memudahkan pencarian
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tambahkan catatan khusus atau instruksi penyimpanan..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foto Obat</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value}
                        onChange={field.onChange}
                        maxFiles={5}
                        maxSize={5 * 1024 * 1024} // 5MB
                        accept="image/*"
                        placeholder="Upload foto obat (maksimal 5 file, 5MB per file)"
                      />
                    </FormControl>
                    <FormDescription>
                      Upload foto obat untuk dokumentasi. Format: JPG, PNG, GIF. Maksimal 5 file.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
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
