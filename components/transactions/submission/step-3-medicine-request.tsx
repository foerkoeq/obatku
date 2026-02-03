"use client";

import { useState, useEffect, useMemo } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Search, AlertCircle, Info, Sparkles } from "lucide-react";
import { MedicineCard } from "./medicine-card";
import { SubmissionFormData } from "./schema";
import { inventoryService } from "@/lib/services/inventory.service";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface MedicineWithStock {
  id: string;
  name: string;
  category: string;
  activeIngredient?: string;
  unit: string;
  stock: number;
  pestTypes?: string[];
  dosagePerHa?: number; // Dosis per hektar dalam satuan kecil (kg, liter, botol, sachet, dll)
  image?: string;
  pricePerUnit?: number;
}

export function Step3MedicineRequest() {
  const { control, watch } = useFormContext<SubmissionFormData>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "drugItems",
  });

  const [medicines, setMedicines] = useState<MedicineWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Watch form values for recommendations
  const pestTypes = watch("pestTypes") || [];
  const affectedArea = watch("affectedArea") || 0;
  const commodities = watch("commodities") || [];

  // Fetch medicines with stock data
  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch medicines from API
        const response = await inventoryService.getMedicines(
          { page: 1, limit: 100 },
          { isActive: true }
        );

        if (response.success && response.data) {
          // Transform API response to our format
          const medicinesData: MedicineWithStock[] = (Array.isArray(response.data) ? response.data : response.data.items || []).map((med: any) => {
            // Calculate total stock from stocks array
            const totalStock = med.stocks?.reduce((sum: number, stock: any) => {
              return sum + (Number(stock.currentStock) || 0);
            }, 0) || 0;

            // Parse pest types (can be JSON string or array)
            let pestTypesArray: string[] = [];
            if (med.pestTypes) {
              if (typeof med.pestTypes === 'string') {
                try {
                  pestTypesArray = JSON.parse(med.pestTypes);
                } catch {
                  pestTypesArray = [med.pestTypes];
                }
              } else if (Array.isArray(med.pestTypes)) {
                pestTypesArray = med.pestTypes;
              }
            }

            // Extract dosage info (if available in description or separate field)
            // Default dosage: assume 1-2 units per hectare for most medicines
            const dosagePerHa = med.dosagePerHa || med.dosage?.amount || 1.5;

            return {
              id: med.id,
              name: med.name,
              category: med.category || "Umum",
              activeIngredient: med.activeIngredient || med.genericName || "",
              unit: med.unit || "pcs",
              stock: totalStock,
              pestTypes: pestTypesArray,
              dosagePerHa: dosagePerHa,
              image: med.image,
              pricePerUnit: med.pricePerUnit ? Number(med.pricePerUnit) : undefined,
            };
          });

          setMedicines(medicinesData);
        } else {
          throw new Error("Failed to fetch medicines");
        }
      } catch (err) {
        console.error("Failed to fetch medicines", err);
        const errorMessage = err instanceof Error ? err.message : "Gagal memuat data obat";
        setError(errorMessage);
        
        // Show toast only once
        if (!error) {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []); // Only fetch once on mount

  // Calculate recommended quantity based on affected area and dosage
  const calculateRecommendedQuantity = (medicine: MedicineWithStock): number => {
    if (!affectedArea || affectedArea <= 0) return 1;
    if (!medicine.dosagePerHa) return Math.ceil(affectedArea); // Default: 1 unit per ha
    
    // Calculate: affectedArea (ha) * dosagePerHa (units/ha) = total units needed
    const calculated = affectedArea * medicine.dosagePerHa;
    return Math.ceil(calculated); // Round up
  };

  const handleSelectMedicine = (medicine: MedicineWithStock) => {
    // Check if already selected
    const index = fields.findIndex(f => f.medicineId === medicine.id);
    if (index !== -1) {
      // Already selected, just show info
      toast.info("Obat ini sudah dipilih. Gunakan input jumlah untuk mengubah kuantitas.");
      return;
    }

    // Calculate recommended quantity
    const recommendedQty = calculateRecommendedQuantity(medicine);
    const finalQty = Math.min(recommendedQty, medicine.stock); // Don't exceed stock
    
    // Add to form
    append({
      medicineId: medicine.id,
      name: medicine.name,
      quantity: finalQty,
      unit: medicine.unit,
      maxStock: medicine.stock
    });

    // Show info toast
    if (affectedArea > 0) {
      toast.success(
        `Obat "${medicine.name}" ditambahkan`,
        {
          description: `Jumlah otomatis: ${finalQty} ${medicine.unit} (berdasarkan luas terserang ${affectedArea} Ha dan dosis ${medicine.dosagePerHa || 1.5} ${medicine.unit}/Ha)`
        }
      );
    } else {
      toast.success(`Obat "${medicine.name}" ditambahkan`);
    }
  };

  const handleQuantityChange = (medicineId: string, qty: number) => {
    const index = fields.findIndex(f => f.medicineId === medicineId);
    if (index !== -1) {
      if (qty <= 0) {
        remove(index);
        toast.info("Obat dihapus dari daftar");
      } else {
        const medicine = medicines.find(m => m.id === medicineId);
        const maxStock = medicine?.stock || 0;
        
        if (qty > maxStock) {
          toast.warning(
            `Jumlah melebihi stok tersedia (${maxStock} ${medicine?.unit || 'unit'})`,
            { duration: 3000 }
          );
        }
        
        update(index, { 
          ...fields[index], 
          quantity: qty,
          maxStock: maxStock
        });
      }
    }
  };

  // Filter and sort medicines
  const filteredMedicines = useMemo(() => {
    let filtered = medicines;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchLower) ||
        m.category.toLowerCase().includes(searchLower) ||
        m.activeIngredient?.toLowerCase().includes(searchLower)
      );
    }

    // Sort: Recommended first (based on pest types match), then by name
    return [...filtered].sort((a, b) => {
      const aRecommended = a.pestTypes?.some(p => pestTypes.includes(p)) || false;
      const bRecommended = b.pestTypes?.some(p => pestTypes.includes(p)) || false;
      
      if (aRecommended && !bRecommended) return -1;
      if (!aRecommended && bRecommended) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [medicines, searchTerm, pestTypes]);

  // Group medicines: Recommended vs Others
  const recommendedMedicines = useMemo(() => {
    return filteredMedicines.filter(m => 
      m.pestTypes?.some(p => pestTypes.includes(p))
    );
  }, [filteredMedicines, pestTypes]);

  const otherMedicines = useMemo(() => {
    return filteredMedicines.filter(m => 
      !m.pestTypes?.some(p => pestTypes.includes(p))
    );
  }, [filteredMedicines, pestTypes]);

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Pilih obat yang dibutuhkan. Sistem akan memberikan rekomendasi berdasarkan jenis OPT yang dipilih. 
          Jumlah akan dihitung otomatis berdasarkan luas lahan terserang dan dosis, namun tetap bisa diubah manual.
        </AlertDescription>
      </Alert>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari obat berdasarkan nama, kategori, atau bahan aktif..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm text-muted-foreground">Memuat data obat...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Silakan refresh halaman atau coba lagi nanti.
          </AlertDescription>
        </Alert>
      )}

      {/* Recommended Medicines Section */}
      {!loading && !error && recommendedMedicines.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Rekomendasi Obat</h3>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Cocok dengan OPT yang dipilih
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendedMedicines.map((medicine, index) => {
              const field = fields.find(f => f.medicineId === medicine.id);
              const isSelected = !!field;
              const quantity = field?.quantity || 0;
              const recommendedQty = calculateRecommendedQuantity(medicine);

              return (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  isSelected={isSelected}
                  quantity={quantity}
                  recommendedQuantity={recommendedQty}
                  onSelect={() => handleSelectMedicine(medicine)}
                  onQuantityChange={(qty) => handleQuantityChange(medicine.id, qty)}
                  recommended={true}
                  affectedArea={affectedArea}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Other Medicines Section */}
      {!loading && !error && otherMedicines.length > 0 && (
        <div className="space-y-4">
          {recommendedMedicines.length > 0 && (
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Obat Lainnya</h3>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {otherMedicines.map((medicine) => {
              const field = fields.find(f => f.medicineId === medicine.id);
              const isSelected = !!field;
              const quantity = field?.quantity || 0;
              const recommendedQty = calculateRecommendedQuantity(medicine);

              return (
                <MedicineCard
                  key={medicine.id}
                  medicine={medicine}
                  isSelected={isSelected}
                  quantity={quantity}
                  recommendedQuantity={recommendedQty}
                  onSelect={() => handleSelectMedicine(medicine)}
                  onQuantityChange={(qty) => handleQuantityChange(medicine.id, qty)}
                  recommended={false}
                  affectedArea={affectedArea}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredMedicines.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium mb-2">Tidak ada obat yang ditemukan</p>
          <p className="text-sm">
            {searchTerm 
              ? "Coba gunakan kata kunci lain untuk mencari obat"
              : "Belum ada data obat dalam sistem"}
          </p>
        </div>
      )}

      {/* Selected Items Summary */}
      {fields.length > 0 && (
        <Alert className="bg-success/5 border-success/20">
          <Info className="h-4 w-4 text-success" />
          <AlertDescription className="text-sm">
            <strong>{fields.length} obat</strong> telah dipilih. Lanjutkan ke langkah berikutnya untuk melengkapi dokumen.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
