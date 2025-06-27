// # START OF Add Medicine Page - Form page for adding new drug inventory
// Purpose: Provides comprehensive form for adding new drug inventory items
// Features: Form validation, role-based access, responsive design, toast notifications
// Returns: Complete add medicine form interface
// Dependencies: Form components, validation, toast, router, types

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Save, ArrowLeft, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

// Types
import { DrugInventory, DrugCategory, Supplier, UserRole } from "@/lib/types/inventory";

// Validation Schema
const addMedicineSchema = z.object({
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
  targetPest: z.string().min(1, "Jenis OPT wajib diisi"),
  storageLocation: z.string().min(1, "Lokasi penyimpanan wajib diisi"),
  notes: z.string().optional(),
}).refine((data) => data.expiryDate > data.entryDate, {
  message: "Tanggal expired harus lebih dari tanggal masuk",
  path: ["expiryDate"],
});

type AddMedicineFormData = z.infer<typeof addMedicineSchema>;

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

const unitOptions = [
  'kg', 'gram', 'liter', 'ml', 'botol', 'kaleng', 'pak', 'sachet', 'tablet', 'kapsul'
];

const largePackUnits = [
  'dus', 'box', 'karton', 'jerigen', 'drum', 'pack', 'bundle', 'krat'
];

const AddMedicinePage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userRole] = useState<UserRole>('admin'); // In real app, get from auth context

  // Check authorization - only admin, dinas, and popt can add medicine
  useEffect(() => {
    if (userRole === 'ppl') {
      toast.error('Anda tidak memiliki akses untuk menambah obat');
      router.push('/inventory');
      return;
    }
  }, [userRole, router]);

  // Form setup
  const form = useForm<AddMedicineFormData>({
    resolver: zodResolver(addMedicineSchema),
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
      pricePerUnit: 0,
      targetPest: '',
      storageLocation: '',
      notes: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: AddMedicineFormData) => {
    setLoading(true);
    
    try {
      // Prepare data for API
      const medicineData = {
        ...data,
        targetPest: data.targetPest.split(',').map(pest => pest.trim()),
        status: 'normal' as const,
        lastUpdated: new Date(),
        createdBy: 'Current User', // In real app, get from auth context
      };

      // In real app, make API call to create medicine
      console.log('Adding medicine:', medicineData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success notification
      toast.success('Obat berhasil ditambahkan!', {
        description: `${data.name} telah disimpan ke dalam inventory`,
      });

      // Redirect to inventory page
      router.push('/inventory');
      
    } catch (error) {
      console.error('Error adding medicine:', error);
      toast.error('Gagal menambahkan obat', {
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
            Anda tidak memiliki akses untuk menambah obat. Silakan hubungi administrator.
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
          <PageTitle title="Tambah Obat Baru" className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Lengkapi semua informasi obat yang akan ditambahkan ke inventory
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
            <Plus className="h-5 w-5" />
            Informasi Obat
          </CardTitle>
          <CardDescription>
            Masukkan detail lengkap obat pertanian yang akan disimpan
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori obat" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockCategories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockSuppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Stock Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informasi Stok</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Initial Stock */}
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jumlah Stok Awal *</FormLabel>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih satuan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {unitOptions.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih satuan kemasan" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {largePackUnits.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                          <Input 
                            placeholder="Contoh: Gulma daun lebar, Gulma rumput"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Pisahkan dengan koma untuk beberapa jenis OPT
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

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none"
                >
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Obat
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

export default AddMedicinePage;

// # END OF Add Medicine Page 