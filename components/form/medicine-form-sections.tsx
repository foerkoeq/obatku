// # START OF MedicineFormSections - Modular form sections for add medicine form
// Purpose: Provides reusable form sections for medicine form to improve maintainability
// Props: form, categories, suppliers, loading states
// Returns: Form section components for different parts of medicine form
// Dependencies: Form components, select options, validation

"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";

// UI Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Types
import { DrugCategory, Supplier } from "@/lib/types/inventory";
import { AddMedicineFormData } from "@/hooks/use-add-medicine-form";

// Constants
const unitOptions = [
  'kg', 'gram', 'liter', 'ml', 'botol', 'kaleng', 'pak', 'sachet', 'tablet', 'kapsul'
];

const largePackUnits = [
  'dus', 'box', 'karton', 'jerigen', 'drum', 'pack', 'bundle', 'krat'
];

interface FormSectionProps {
  form: UseFormReturn<AddMedicineFormData>;
  categories?: DrugCategory[];
  suppliers?: Supplier[];
}

// Basic Information Section Component
export const BasicInformationSection: React.FC<FormSectionProps> = ({ 
  form, 
  categories = [], 
  suppliers = [] 
}) => {
  return (
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
                {categories.map((category) => (
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
                {suppliers.map((supplier) => (
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
  );
};

// Stock Information Section Component
export const StockInformationSection: React.FC<FormSectionProps> = ({ form }) => {
  return (
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
  );
};

// Large Pack Information Section Component
export const LargePackInformationSection: React.FC<FormSectionProps> = ({ form }) => {
  return (
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
  );
};

// Date Information Section Component
export const DateInformationSection: React.FC<FormSectionProps> = ({ form }) => {
  return (
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
  );
};

// Additional Information Section Component
export const AdditionalInformationSection: React.FC<FormSectionProps> = ({ form }) => {
  return (
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
  );
};

// # END OF MedicineFormSections 