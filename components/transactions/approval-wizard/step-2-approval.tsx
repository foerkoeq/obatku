"use client";

import { useState } from "react";
import { useFieldArray, Controller, UseFormReturn } from "react-hook-form";
import { Transaction } from "@/lib/types/transaction";
import { DrugInventory } from "@/lib/types/inventory";
import { mockInventoryData } from "@/lib/data/inventory-demo";
import { ApprovalWizardSchema } from "./types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Step2ApprovalProps {
  form: UseFormReturn<ApprovalWizardSchema>;
  transaction: Transaction;
}

// Mock function to get drug suggestions based on pest type
const getDrugSuggestions = (pestTypes: string[], allDrugs: DrugInventory[]): DrugInventory[] => {
    const suggestions: DrugInventory[] = [];
    // This is a very basic mock. A real implementation would have a more complex logic or API call.
    if (pestTypes.includes("Wereng Batang Coklat")) {
        suggestions.push(...allDrugs.filter(d => d.name.includes("Virtako") || d.name.includes("Lannate")));
    }
    if (pestTypes.includes("Penggerek Batang")) {
        suggestions.push(...allDrugs.filter(d => d.name.includes("Curacon") || d.name.includes("Pegasus")));
    }
    // Remove duplicates
    return [...new Map(suggestions.map(item => [item.id, item])).values()].slice(0, 3);
};


export const Step2Approval = ({ form, transaction }: Step2ApprovalProps) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "approvedDrugs",
  });

  const [availableDrugs] = useState<DrugInventory[]>(mockInventoryData.filter((d) => d.stock > 0));
  const suggestedDrugs = getDrugSuggestions(transaction.farmingDetails.pestType, availableDrugs);
  
  const handleAddSuggestedDrug = (drug: DrugInventory) => {
    const alreadyAdded = fields.some(field => field.drug.id === drug.id);
    if (!alreadyAdded) {
      append({ drug: { id: drug.id, name: drug.name, stock: drug.stock }, quantity: 1 });
    }
  }

  return (
    <ScrollArea className="h-full pr-4">
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold">Persetujuan & Alokasi Obat</h4>
                <p className="text-sm text-muted-foreground">
                    Berdasarkan OPT <strong>{transaction.farmingDetails.pestType.join(", ")}</strong> 
                    & luas lahan <strong>{transaction.farmingDetails.affectedArea} Ha</strong>, berikut adalah rekomendasi obat.
                </p>
            </div>
            
            {suggestedDrugs.length > 0 && (
                <div className="p-4 border rounded-lg bg-primary-50 dark:bg-primary-900/20">
                    <h5 className="font-semibold mb-2">Rekomendasi Obat</h5>
                    <div className="flex flex-wrap gap-2">
                        {suggestedDrugs.map(drug => (
                            <Button key={drug.id} type="button" variant="outline" size="sm" onClick={() => handleAddSuggestedDrug(drug)}>
                                <Icon icon="lucide:plus" className="w-4 h-4 mr-2" />
                                {drug.name} <Badge className="ml-2">{drug.stock} {drug.unit}</Badge>
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-2 p-3 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <FormField
                    control={form.control}
                    name={`approvedDrugs.${index}.drug`}
                    render={({ field }) => (
                        <FormItem className="flex-1">
                        <FormLabel>Pilih Obat</FormLabel>
                        <DrugCombobox
                            availableDrugs={availableDrugs}
                            value={field.value}
                            onChange={(drug) => {
                                field.onChange(drug)
                                form.trigger(`approvedDrugs.${index}.drug`);
                            }}
                        />
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    
                    <Controller
                    name={`approvedDrugs.${index}.quantity`}
                    control={form.control}
                    render={({ field: { onChange, ...restField } }) => (
                        <FormItem>
                            <FormLabel>Jumlah</FormLabel>
                            <FormControl>
                            <Input type="number" {...restField} 
                                onChange={e => {
                                    onChange(parseInt(e.target.value, 10) || 0)
                                    form.trigger(`approvedDrugs.${index}.quantity`);
                                }} 
                                className="w-28" 
                                placeholder="Qty" 
                                />
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}
                    />
                    
                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Icon icon="lucide:trash-2" className="w-4 h-4 text-red-500" />
                    </Button>
                </div>
                ))}
                <Button
                type="button"
                variant="outline"
                onClick={() => append({ drug: {id: '', name: '', stock: 0}, quantity: 1 })}
                className="w-full"
                >
                <Icon icon="lucide:plus-circle" className="w-4 h-4 mr-2" />
                Tambah Obat Lain
                </Button>
                {form.formState.errors.approvedDrugs?.root && (
                    <p className="text-sm font-medium text-destructive">{form.formState.errors.approvedDrugs.root.message}</p>
                )}
                 {form.formState.errors.approvedDrugs && !form.formState.errors.approvedDrugs.root && (
                      <p className="text-sm font-medium text-destructive">Periksa kembali data obat yang anda masukkan.</p>
                 )}
            </div>
        </div>
    </ScrollArea>
  );
};


const DrugCombobox = ({ availableDrugs, value, onChange } : { availableDrugs: DrugInventory[], value: { id: string, name: string, stock: number }, onChange: (drug: {id: string, name: string, stock: number}) => void }) => {
  const [open, setOpen] = useState(false);
  const selectedDrug = value.id ? availableDrugs.find(d => d.id === value.id) : null;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
            <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            >
            {selectedDrug
                ? `${selectedDrug.name} (Stok: ${selectedDrug.stock})`
                : "Cari dan pilih obat..."}
            <Icon icon="lucide:chevrons-up-down" className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
                 <CommandInput placeholder="Cari obat..." />
                 <CommandList>
                    <CommandEmpty>Obat tidak ditemukan.</CommandEmpty>
                    <CommandGroup>
                    {availableDrugs.map((drug) => (
                        <CommandItem
                        key={drug.id}
                        value={drug.name}
                        onSelect={() => {
                            onChange({id: drug.id, name: drug.name, stock: drug.stock})
                            setOpen(false)
                        }}
                        >
                        <Icon
                            icon="lucide:check"
                            className={cn(
                                "mr-2 h-4 w-4",
                                value.id === drug.id ? "opacity-100" : "opacity-0"
                            )}
                        />
                        {drug.name} <span className="text-xs ml-auto">{drug.stock} {drug.unit}</span>
                        </CommandItem>
                    ))}
                    </CommandGroup>
                 </CommandList>
            </Command>
      </PopoverContent>
    </Popover>
  )
} 