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
import { DatePicker } from "@/components/ui/date-picker";
import { ImageUpload } from "@/components/form/image-upload"; // Assuming this handles files too or just images
import { SubmissionFormData } from "./schema";

export function Step4Documents() {
  const { control } = useFormContext<SubmissionFormData>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Letter Number */}
        <FormField
          control={control}
          name="letterNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nomor Surat Pengajuan</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Contoh: 400/123/414.123/2025" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Letter Date */}
        <FormField
          control={control}
          name="letterDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tanggal Surat</FormLabel>
              <FormControl>
                <DatePicker 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pickup Plan */}
        <FormField
          control={control}
          name="pickupDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rencana Pengambilan</FormLabel>
              <FormControl>
                <DatePicker 
                  value={field.value} 
                  onChange={field.onChange}
                  minDate={new Date()}
                />
              </FormControl>
              <FormDescription>
                Tanggal rencana pengambilan obat. Tidak boleh tanggal lampau.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Letter File */}
        <FormField
          control={control}
          name="letterFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unggah Surat Pengajuan</FormLabel>
              <FormControl>
                <ImageUpload 
                  value={field.value ? [field.value] : []} 
                  onChange={(files) => field.onChange(files[0])}
                  maxFiles={1}
                />
              </FormControl>
              <FormDescription>
                Unggah scan/foto surat pengajuan resmi.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* POPT Recommendation File */}
        <FormField
          control={control}
          name="poptRecommendationFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unggah Rekomendasi Petugas POPT</FormLabel>
              <FormControl>
                <ImageUpload 
                  value={field.value ? [field.value] : []} 
                  onChange={(files) => field.onChange(files[0])}
                  maxFiles={1}
                />
              </FormControl>
              <FormDescription>
                Unggah dokumen rekomendasi dari petugas POPT setempat.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
