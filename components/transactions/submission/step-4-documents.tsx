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
import { SubmissionFormData } from "./schema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, FileText, Upload, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// File Upload Component for Documents
const DocumentUpload = ({ 
  value, 
  onChange, 
  label, 
  description,
  accept = "image/*,.pdf",
  maxSize = 10 // MB
}: {
  value?: File | null;
  onChange: (file: File | null) => void;
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number;
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    if (!isImage && !isPDF) {
      toast.error("Format file tidak didukung. Gunakan gambar (JPG, PNG) atau PDF.");
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Ukuran file terlalu besar. Maksimal ${maxSize}MB.`);
      return;
    }

    onChange(file);

    // Create preview for images
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    toast.success("File berhasil dipilih");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      
      {!value ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 transition-colors
            ${dragActive 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-primary/50"
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <div>
              <span className="text-sm font-medium text-primary">Klik untuk upload</span>
              <span className="text-sm text-muted-foreground"> atau drag & drop</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {accept.includes('pdf') ? 'Gambar (JPG, PNG) atau PDF' : 'Gambar (JPG, PNG)'} • Maks {maxSize}MB
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {preview ? (
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-16 h-16 object-cover rounded border"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{value.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="shrink-0"
            >
              <span className="sr-only">Hapus file</span>
              ×
            </Button>
          </div>
        </div>
      )}
      
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export function Step4Documents() {
  const { control, watch } = useFormContext<SubmissionFormData>();
  const letterDate = watch("letterDate");
  
  // Get today's date at midnight for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Lengkapi dokumen pengajuan. Pastikan semua dokumen sudah diunggah dan tanggal tidak mundur dari hari ini.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Letter Number */}
        <FormField
          control={control}
          name="letterNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Nomor Surat Pengajuan *
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Contoh: 400/123/414.123/2025" />
              </FormControl>
              <FormDescription>
                Nomor surat pengajuan resmi dari kelompok tani
              </FormDescription>
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
              <FormLabel className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Tanggal Surat *
              </FormLabel>
              <FormControl>
                <DatePicker 
                  value={field.value} 
                  onChange={field.onChange}
                  maxDate={new Date()} // Cannot be in the future
                />
              </FormControl>
              <FormDescription>
                Tanggal surat pengajuan (tidak boleh lebih dari hari ini)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Pickup Date */}
        <FormField
          control={control}
          name="pickupDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Rencana Pengambilan *
              </FormLabel>
              <FormControl>
                <DatePicker 
                  value={field.value} 
                  onChange={field.onChange}
                  minDate={today} // Cannot be in the past
                />
              </FormControl>
              <FormDescription>
                Tanggal rencana pengambilan obat. Tidak boleh mundur dari hari ini.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Letter File Upload */}
        <FormField
          control={control}
          name="letterFile"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DocumentUpload
                  value={field.value as File | null}
                  onChange={(file) => field.onChange(file)}
                  label="Unggah Surat Pengajuan"
                  description="Unggah scan/foto surat pengajuan resmi dalam format JPG, PNG, atau PDF (maks 10MB)"
                  accept="image/*,.pdf"
                  maxSize={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* POPT Recommendation File Upload */}
        <FormField
          control={control}
          name="poptRecommendationFile"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DocumentUpload
                  value={field.value as File | null}
                  onChange={(file) => field.onChange(file)}
                  label="Unggah Rekomendasi Petugas POPT"
                  description="Unggah dokumen rekomendasi dari petugas POPT setempat dalam format JPG, PNG, atau PDF (maks 10MB)"
                  accept="image/*,.pdf"
                  maxSize={10}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Summary Info */}
      <Alert className="bg-muted/50">
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Catatan:</strong> Pastikan semua dokumen sudah diunggah dengan jelas dan dapat dibaca. 
          Dokumen yang tidak jelas dapat menyebabkan pengajuan ditolak.
        </AlertDescription>
      </Alert>
    </div>
  );
}
