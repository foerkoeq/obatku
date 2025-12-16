"use client";

import { useState, useEffect } from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { MedicineCard } from "./medicine-card";
import { SubmissionFormData } from "./schema";
import { inventoryService } from "@/lib/services/inventory.service";
import { toast } from "sonner";

export function Step3MedicineRequest() {
  const { control, watch } = useFormContext<SubmissionFormData>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "drugItems",
  });

  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const pestTypes = watch("pestTypes") || [];
  const landArea = watch("landArea") || 0;

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setLoading(true);
        // Fetch medicines from API
        // In a real scenario: const res = await inventoryService.getMedicines({ limit: 100 });
        // For now, we mock some data to ensure UI works as requested
        const mockMedicines = [
          { id: "1", name: "Insektisida A", category: "Insektisida", stock: 50, unit: "btl", activeIngredient: "Abamectin", pestTypes: ["Wereng", "Ulat"], dosagePerHa: 2 },
          { id: "2", name: "Fungisida B", category: "Fungisida", stock: 20, unit: "bks", activeIngredient: "Mankozeb", pestTypes: ["Jamur"], dosagePerHa: 1 },
          { id: "3", name: "Herbisida C", category: "Herbisida", stock: 100, unit: "btl", activeIngredient: "Glifosat", pestTypes: ["Gulma"], dosagePerHa: 3 },
          { id: "4", name: "Insektisida D", category: "Insektisida", stock: 5, unit: "btl", activeIngredient: "Sipermetrin", pestTypes: ["Ulat"], dosagePerHa: 1.5 },
          { id: "5", name: "Pestisida Nabati E", category: "Pestisida Nabati", stock: 30, unit: "l", activeIngredient: "Ekstrak Nimba", pestTypes: ["Wereng"], dosagePerHa: 5 },
        ];
        setMedicines(mockMedicines);
      } catch (error) {
        console.error("Failed to fetch medicines", error);
        toast.error("Gagal memuat data obat");
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const handleSelectMedicine = (medicine: any) => {
    // Check if already selected
    const index = fields.findIndex(f => f.medicineId === medicine.id);
    if (index === -1) {
      // Calculate default quantity based on land area and dosage
      const defaultQty = medicine.dosagePerHa ? Math.ceil(medicine.dosagePerHa * landArea) : 1;
      
      // Add
      append({
        medicineId: medicine.id,
        name: medicine.name,
        quantity: defaultQty > 0 ? defaultQty : 1, 
        unit: medicine.unit,
        maxStock: medicine.stock
      });
      
      if (defaultQty > 0) {
        toast.info(`Jumlah otomatis diisi: ${defaultQty} ${medicine.unit} (Berdasarkan luas lahan ${landArea} Ha)`);
      }
    }
  };

  const handleQuantityChange = (medicineId: string, qty: number) => {
    const index = fields.findIndex(f => f.medicineId === medicineId);
    if (index !== -1) {
      if (qty <= 0) {
        remove(index);
      } else {
        update(index, { ...fields[index], quantity: qty });
      }
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort: Recommended first
  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    const aRec = a.pestTypes?.some((p: string) => pestTypes.includes(p));
    const bRec = b.pestTypes?.some((p: string) => pestTypes.includes(p));
    if (aRec && !bRec) return -1;
    if (!aRec && bRec) return 1;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Cari obat..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-10">Memuat data obat...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedMedicines.map((medicine) => {
            const field = fields.find(f => f.medicineId === medicine.id);
            const isSelected = !!field;
            const quantity = field?.quantity || 0;
            const isRecommended = medicine.pestTypes?.some((p: string) => pestTypes.includes(p));

            return (
              <MedicineCard
                key={medicine.id}
                medicine={medicine}
                isSelected={isSelected}
                quantity={quantity}
                onSelect={() => handleSelectMedicine(medicine)}
                onQuantityChange={(qty) => handleQuantityChange(medicine.id, qty)}
                recommended={isRecommended}
              />
            );
          })}
        </div>
      )}
      
      {sortedMedicines.length === 0 && !loading && (
        <div className="text-center py-10 text-muted-foreground">
          Tidak ada obat yang ditemukan.
        </div>
      )}
    </div>
  );
}
