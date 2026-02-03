"use client";

import { useFormContext } from "react-hook-form";
import { useEffect } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelectWithCreate, SelectOption } from "@/components/form/multi-select-with-create";
import { useCommodities, usePestTypes } from "@/hooks/use-master-data";
import { SubmissionFormData } from "./schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Sprout, Bug } from "lucide-react";

const DEFAULT_COMMODITIES = [
  "Padi", "Jagung", "Cabai", "Bawang Merah", "Tembakau", "Kacang Tanah"
];

export function Step2FarmingDetails() {
  const { control, setValue, watch } = useFormContext<SubmissionFormData>();
  
  // Watch land area from step 1 (auto-filled from farmer group)
  const landAreaFromGroup = watch("landArea");
  const currentLandArea = watch("landArea");
  
  // Data Hooks
  const { commodities, createCommodity, loading: loadingCommodities } = useCommodities({ status: 'ACTIVE' });
  const { pestTypes, createPestType, loading: loadingPests } = usePestTypes({ status: 'ACTIVE' });

  // Auto-fill land area from farmer group data (but allow manual override)
  useEffect(() => {
    if (landAreaFromGroup && landAreaFromGroup > 0 && !currentLandArea) {
      setValue("landArea", landAreaFromGroup);
    }
  }, [landAreaFromGroup, currentLandArea, setValue]);

  // Transform options
  const commodityOptions: SelectOption[] = [
    // Add default commodities first
    ...DEFAULT_COMMODITIES.map(name => ({
      value: name,
      label: name,
      description: "Komoditas default"
    })),
    // Then add fetched commodities (avoid duplicates)
    ...commodities
      .filter(c => !DEFAULT_COMMODITIES.includes(c.name))
      .map(c => ({
        value: c.name,
        label: c.name,
        description: c.category || "Komoditas"
      }))
  ];

  const pestOptions: SelectOption[] = pestTypes.map(p => ({
    value: p.name,
    label: p.name,
    description: p.category || "OPT"
  }));

  const handleCreateCommodity = async (data: any) => {
    try {
      const newCommodity = await createCommodity({
        name: data.name || data,
        category: "Umum"
      } as any);
      
      return {
        value: newCommodity?.name || data.name || data,
        label: newCommodity?.name || data.name || data,
        description: newCommodity?.category || "Baru"
      };
    } catch (error) {
      console.error("Error creating commodity:", error);
      // Return the input as fallback
      return {
        value: data.name || data,
        label: data.name || data,
        description: "Baru"
      };
    }
  };

  const handleCreatePest = async (data: any) => {
    try {
      const newPest = await createPestType({
        name: data.name || data,
        category: "Umum"
      } as any);
      
      return {
        value: newPest?.name || data.name || data,
        label: newPest?.name || data.name || data,
        description: newPest?.category || "Baru"
      };
    } catch (error) {
      console.error("Error creating pest type:", error);
      return {
        value: data.name || data,
        label: data.name || data,
        description: "Baru"
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Isi detail pertanian termasuk luas lahan, komoditas yang ditanam, dan jenis OPT yang menyerang. 
          Luas lahan akan terisi otomatis dari data kelompok tani jika tersedia.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Land Area */}
        <FormField
          control={control}
          name="landArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-muted-foreground" />
                Luas Lahan (Ha) *
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  {...field} 
                  onChange={e => {
                    const value = e.target.valueAsNumber || 0;
                    field.onChange(value);
                  }}
                  value={field.value || ""}
                  placeholder="0.00"
                />
              </FormControl>
              <FormDescription>
                Total luas lahan yang dimiliki kelompok tani. 
                {landAreaFromGroup && landAreaFromGroup > 0 && (
                  <span className="text-primary font-medium"> Terisi otomatis dari data kelompok tani.</span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Affected Area */}
        <FormField
          control={control}
          name="affectedArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-muted-foreground" />
                Luas Lahan Terserang (Ha) *
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  {...field} 
                  onChange={e => {
                    const value = e.target.valueAsNumber || 0;
                    field.onChange(value);
                  }}
                  value={field.value || ""}
                  placeholder="0.00"
                />
              </FormControl>
              <FormDescription>
                Luas lahan yang terkena serangan OPT. Tidak boleh melebihi luas lahan total.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Commodities */}
        <div className="md:col-span-2">
          <FormField
            control={control}
            name="commodities"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-muted-foreground" />
                  Komoditas *
                </FormLabel>
                <FormControl>
                  <MultiSelectWithCreate
                    options={commodityOptions}
                    value={field.value || []}
                    onChange={field.onChange}
                    onCreate={handleCreateCommodity}
                    placeholder="Pilih atau tambah komoditas (bisa lebih dari satu)"
                    loading={loadingCommodities}
                  />
                </FormControl>
                <FormDescription>
                  Pilih satu atau lebih komoditas yang ditanam. Komoditas default: Padi, Jagung, Cabai, Bawang Merah, Tembakau, Kacang Tanah. 
                  Anda dapat menambah komoditas baru yang akan tersimpan untuk pengajuan berikutnya.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pest Types */}
        <div className="md:col-span-2">
          <FormField
            control={control}
            name="pestTypes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-muted-foreground" />
                  Jenis OPT (Organisme Pengganggu Tumbuhan) *
                </FormLabel>
                <FormControl>
                  <MultiSelectWithCreate
                    options={pestOptions}
                    value={field.value || []}
                    onChange={field.onChange}
                    onCreate={handleCreatePest}
                    placeholder="Pilih atau tambah jenis OPT (bisa lebih dari satu)"
                    loading={loadingPests}
                  />
                </FormControl>
                <FormDescription>
                  Pilih satu atau lebih jenis OPT yang menyerang tanaman. Data ini akan digunakan untuk rekomendasi obat yang sesuai.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
