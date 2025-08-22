// # START OF Stock Management Form - Component for stock adjustment and management
// Purpose: Provides comprehensive form for stock adjustment, low stock alerts, and stock management
// Features: Stock adjustment, low stock alerts, batch tracking, expiry management
// Returns: Complete stock management form interface
// Dependencies: Form components, validation, toast, inventory service

"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Minus, AlertTriangle, Save, RotateCcw } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

// Services
import { inventoryService } from "@/lib/services/inventory.service";

// Types
import { Stock, Medicine, StockAdjustment } from "@/lib/services/inventory.service";

// Validation Schema
const stockAdjustmentSchema = z.object({
  medicineId: z.string().min(1, "Obat wajib dipilih"),
  adjustmentType: z.enum(["add", "subtract", "set"]),
  quantity: z.number().min(0.0001, "Jumlah wajib diisi dan minimal 0.0001"),
  reason: z.string().min(1, "Alasan penyesuaian wajib diisi"),
  batchNumber: z.string().optional(),
  expiryDate: z.date().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

interface StockManagementFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialStock?: Stock;
}

const StockManagementForm: React.FC<StockManagementFormProps> = ({
  onSuccess,
  onCancel,
  initialStock,
}) => {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [currentStock, setCurrentStock] = useState<Stock | null>(initialStock || null);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);

  // Form setup
  const form = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      medicineId: initialStock?.medicineId || '',
      adjustmentType: 'add',
      quantity: 0,
      reason: '',
      batchNumber: '',
      expiryDate: new Date(),
      location: '',
      notes: '',
    },
  });

  // Load medicines
  useEffect(() => {
    const loadMedicines = async () => {
      try {
        const response = await inventoryService.getMedicines();
        setMedicines(response.data || []);
      } catch (error) {
        console.error('Error loading medicines:', error);
        toast.error('Gagal memuat daftar obat');
      }
    };

    loadMedicines();
  }, []);

  // Load stock when medicine changes
  useEffect(() => {
    const medicineId = form.watch('medicineId');
    if (medicineId) {
      const medicine = medicines.find(m => m.id === medicineId);
      setSelectedMedicine(medicine || null);
      
      if (medicine) {
        loadStockData(medicineId);
      }
    }
  }, [form.watch('medicineId'), medicines]);

  const loadStockData = async (medicineId: string) => {
    try {
      const response = await inventoryService.getStock({ medicineId });
      const stock = response.data?.[0];
      setCurrentStock(stock || null);
      
      if (stock) {
        form.setValue('location', stock.location || '');
        form.setValue('expiryDate', new Date(stock.expiryDate));
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
    }
  };

  // Handle form submission
  const onSubmit = async (data: StockAdjustmentFormData) => {
    setLoading(true);
    
    try {
      let newQuantity = data.quantity;
      
      // Calculate new quantity based on adjustment type
      if (currentStock) {
        switch (data.adjustmentType) {
          case 'add':
            newQuantity = currentStock.quantity + data.quantity;
            break;
          case 'subtract':
            newQuantity = currentStock.quantity - data.quantity;
            if (newQuantity < 0) {
              toast.error('Stok tidak mencukupi untuk pengurangan ini');
              return;
            }
            break;
          case 'set':
            newQuantity = data.quantity;
            break;
        }
      }

      // Create stock adjustment record
      await inventoryService.createStockAdjustment({
        stockId: currentStock?.id || '',
        adjustmentType: data.adjustmentType,
        quantity: data.quantity,
        newQuantity,
        reason: data.reason,
        notes: data.notes,
      });

      // Update stock
      if (currentStock) {
        await inventoryService.updateStock(currentStock.id, {
          quantity: newQuantity,
          location: data.location,
          expiryDate: data.expiryDate?.toISOString(),
        });
      }

      // Check for low stock alert
      if (newQuantity <= lowStockThreshold) {
        toast.warning('⚠️ Stok rendah!', {
          description: `${selectedMedicine?.name} memiliki stok ${newQuantity} ${selectedMedicine?.unit}`,
        });
      }

      toast.success('Penyesuaian stok berhasil!', {
        description: `Stok ${selectedMedicine?.name} telah diperbarui`,
      });

      // Refresh stock data
      if (data.medicineId) {
        await loadStockData(data.medicineId);
      }

      // Reset form
      form.reset({
        medicineId: data.medicineId,
        adjustmentType: 'add',
        quantity: 0,
        reason: '',
        batchNumber: '',
        expiryDate: new Date(),
        location: data.location,
        notes: '',
      });

      onSuccess?.();
      
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Gagal melakukan penyesuaian stok', {
        description: 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const isLowStock = currentStock && currentStock.quantity <= lowStockThreshold;
  const isExpiringSoon = currentStock && currentStock.expiryDate && 
    new Date(currentStock.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-6">
      {/* Stock Information Card */}
      {currentStock && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informasi Stok Saat Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Stok Tersedia</p>
                <p className="text-2xl font-bold">{currentStock.quantity}</p>
                <p className="text-sm text-muted-foreground">{selectedMedicine?.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Harga Beli</p>
                <p className="text-lg font-semibold">
                  Rp {currentStock.unitPrice?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Harga Jual</p>
                <p className="text-lg font-semibold">
                  Rp {currentStock.sellingPrice?.toLocaleString() || '0'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Batch</p>
                <p className="text-lg font-semibold">{currentStock.batchNumber}</p>
              </div>
            </div>
            
            {/* Alerts */}
            <div className="mt-4 space-y-2">
              {isLowStock && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Stok rendah! Saat ini tersisa {currentStock.quantity} {selectedMedicine?.unit}
                  </AlertDescription>
                </Alert>
              )}
              
              {isExpiringSoon && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Stok akan expired pada {format(new Date(currentStock.expiryDate), 'dd/MM/yyyy')}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Adjustment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Penyesuaian Stok</CardTitle>
          <CardDescription>
            Lakukan penyesuaian stok untuk obat yang dipilih
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Medicine Selection */}
              <FormField
                control={form.control}
                name="medicineId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Obat *</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih obat untuk penyesuaian stok" />
                        </SelectTrigger>
                        <SelectContent>
                          {medicines.map((medicine) => (
                            <SelectItem key={medicine.id} value={medicine.id}>
                              <div className="flex items-center gap-2">
                                <span>{medicine.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {medicine.category}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Adjustment Type and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="adjustmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis Penyesuaian *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add">
                              <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4 text-green-600" />
                                Tambah Stok
                              </div>
                            </SelectItem>
                            <SelectItem value="subtract">
                              <div className="flex items-center gap-2">
                                <Minus className="h-4 w-4 text-red-600" />
                                Kurangi Stok
                              </div>
                            </SelectItem>
                            <SelectItem value="set">
                              <div className="flex items-center gap-2">
                                <RotateCcw className="h-4 w-4 text-blue-600" />
                                Set Stok
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Pilih jenis penyesuaian yang akan dilakukan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0.0001"
                          step="0.0001"
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Jumlah stok yang akan ditambahkan/dikurangi/diset
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reason and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alasan Penyesuaian *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih alasan penyesuaian" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="purchase">Pembelian Baru</SelectItem>
                            <SelectItem value="sale">Penjualan</SelectItem>
                            <SelectItem value="return">Retur</SelectItem>
                            <SelectItem value="damage">Kerusakan</SelectItem>
                            <SelectItem value="expiry">Kedaluwarsa</SelectItem>
                            <SelectItem value="adjustment">Penyesuaian Fisik</SelectItem>
                            <SelectItem value="transfer">Transfer Antar Gudang</SelectItem>
                            <SelectItem value="other">Lainnya</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="batchNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Batch</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: BATCH-2024-001" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Nomor batch untuk tracking (opsional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Date and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tanggal Expired</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Tanggal kedaluwarsa stok (opsional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokasi Penyimpanan</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Contoh: Gudang A, Rak 1" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Lokasi penyimpanan stok (opsional)
                      </FormDescription>
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
                    <FormLabel>Catatan Tambahan</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tambahkan catatan atau detail tambahan..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Catatan tambahan untuk dokumentasi
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
                  onClick={handleCancel}
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
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Penyesuaian
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

export default StockManagementForm;
