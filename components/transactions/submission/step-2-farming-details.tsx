"use client";

import { useFormContext } from "react-hook-form";
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
import { useEffect, useMemo } from "react";

const DEFAULT_COMMODITIES = [
  "Padi", "Jagung", "Cabai", "Bawang Merah", "Tembakau", "Kacang Tanah"
];

export function Step2FarmingDetails() {
  const { control, setValue, watch } = useFormContext<SubmissionFormData>();
  
  // Data Hooks
  const { commodities, createCommodity, loading: loadingCommodities } = useCommodities({ status: 'ACTIVE' });
  const { pestTypes, createPestType, loading: loadingPests } = usePestTypes({ status: 'ACTIVE' });

  // Transform options
  const commodityOptions: SelectOption[] = useMemo(() => {
    // Merge defaults with fetched
    const all = [...commodities];
    // Ensure defaults exist if not in fetched (mock logic)
    DEFAULT_COMMODITIES.forEach(def => {
      if (!all.find(c => c.name === def)) {
        all.push({ id: def.toLowerCase(), name: def, category: "Umum" } as any);
      }
    });
    
    return all.map(c => ({
      value: c.name, // Use name as value for simplicity as per requirement
      label: c.name,
      description: c.category
    }));
  }, [commodities]);

  const pestOptions: SelectOption[] = pestTypes.map(p => ({
    value: p.name,
    label: p.name,
    description: p.category
  }));

  const handleCreateCommodity = async (data: any) => {
    // Call API
    const newCommodity = await createCommodity(data) as any;
    // Return as SelectOption
    return {
      value: newCommodity?.name || data.name,
      label: newCommodity?.name || data.name,
      description: newCommodity?.category || "Baru"
    };
  };

  const handleCreatePest = async (data: any) => {
    const newPest = await createPestType(data) as any;
    return {
      value: newPest?.name || data.name,
      label: newPest?.name || data.name,
      description: newPest?.category || "Baru"
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Land Area */}
        <FormField
          control={control}
          name="landArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Luas Lahan (Ha)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>
                Total luas lahan yang dimiliki kelompok tani.
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
              <FormLabel>Luas Lahan Terserang (Ha)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  {...field} 
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>
                Luas lahan yang terkena serangan OPT.
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
                <FormLabel>Komoditas</FormLabel>
                <FormControl>
                  <MultiSelectWithCreate
                    options={commodityOptions}
                    value={field.value || []}
                    onChange={field.onChange}
                    onCreate={handleCreateCommodity}
                    placeholder="Pilih Komoditas"
                    loading={loadingCommodities}
                  />
                </FormControl>
                <FormDescription>
                  Pilih satu atau lebih komoditas yang ditanam.
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
                <FormLabel>Jenis OPT (Organisme Pengganggu Tumbuhan)</FormLabel>
                <FormControl>
                  <MultiSelectWithCreate
                    options={pestOptions}
                    value={field.value || []}
                    onChange={field.onChange}
                    onCreate={handleCreatePest}
                    placeholder="Pilih Jenis OPT"
                    loading={loadingPests}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
