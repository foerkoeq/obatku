"use client";

import { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Info,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  File,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SubmissionFormData, UploadedFile } from "./schema";

interface Step4DocumentsProps {
  formData: SubmissionFormData;
  onChange: (updates: Partial<SubmissionFormData>) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function createUploadedFile(file: File): UploadedFile {
  return {
    file,
    name: file.name,
    size: file.size,
    type: file.type,
    preview: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined,
  };
}

export function Step4Documents({ formData, onChange }: Step4DocumentsProps) {
  return (
    <div className="space-y-5">
      {/* Info */}
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <AlertDescription className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
          Unggah dokumen pendukung. Surat Pengajuan dari BPP wajib diunggah
          dalam format PDF.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {/* 1. Surat Pengajuan BPP (Required, PDF only) */}
        <SingleFileUpload
          label="Surat Pengajuan / Rekomendasi BPP"
          description="Surat rekomendasi dari Balai Penyuluhan Pertanian (BPP)"
          required
          nomorSurat={formData.nomorSuratPengajuanBPP}
          onNomorSuratChange={(value) =>
            onChange({ nomorSuratPengajuanBPP: value })
          }
          accept=".pdf"
          acceptLabel="PDF"
          icon={<FileText className="w-5 h-5" />}
          file={formData.suratPengajuanBPP}
          onFileChange={(file) => onChange({ suratPengajuanBPP: file })}
        />

        {/* 2. Rekomendasi POPT (Optional, PDF only) */}
        <SingleFileUpload
          label="Rekomendasi POPT"
          description="Surat rekomendasi dari Pengamat Organisme Pengganggu Tumbuhan"
          nomorSurat={formData.nomorSuratRekomendasiPOPT}
          onNomorSuratChange={(value) =>
            onChange({ nomorSuratRekomendasiPOPT: value })
          }
          accept=".pdf"
          acceptLabel="PDF"
          icon={<FileText className="w-5 h-5" />}
          file={formData.rekomendasiPOPT}
          onFileChange={(file) => onChange({ rekomendasiPOPT: file })}
        />

        <Separator />

        {/* 3. Dokumen Lainnya (Optional, multiple, images & docs) */}
        <MultiFileUpload
          label="Dokumen Pendukung Lainnya"
          description="Foto lapangan, foto serangan, atau dokumen pendukung lainnya"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          acceptLabel="PDF, JPG, PNG, DOC"
          files={formData.dokumenLainnya}
          onFilesChange={(files) => onChange({ dokumenLainnya: files })}
        />
      </div>
    </div>
  );
}

// =============================================
// Sub-component: Single File Upload
// =============================================

function SingleFileUpload({
  label,
  description,
  required = false,
  nomorSurat,
  onNomorSuratChange,
  accept,
  acceptLabel,
  icon,
  file,
  onFileChange,
}: {
  label: string;
  description: string;
  required?: boolean;
  nomorSurat: string;
  onNomorSuratChange: (value: string) => void;
  accept: string;
  acceptLabel: string;
  icon: React.ReactNode;
  file: UploadedFile | null;
  onFileChange: (file: UploadedFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFile = useCallback(
    (f: File) => {
      setError("");
      // Validate type
      const exts = accept.split(",").map((e) => e.trim().toLowerCase());
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!exts.includes(ext)) {
        setError(`Format tidak valid. Gunakan: ${acceptLabel}`);
        return;
      }
      // Validate size
      if (f.size > MAX_FILE_SIZE) {
        setError("Ukuran file maksimal 10 MB");
        return;
      }
      onFileChange(createUploadedFile(f));
    },
    [accept, acceptLabel, onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <Card className="border overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold">{label}</Label>
              {required && (
                <Badge
                  color="destructive"
                  className="text-[9px] px-1.5 py-0"
                >
                  Wajib
                </Badge>
              )}
              {!required && (
                <Badge
                  color="secondary"
                  className="text-[9px] px-1.5 py-0"
                >
                  Opsional
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Upload area or file preview */}
        <div className="space-y-1.5">
          <Label className="text-xs sm:text-sm font-medium">
            No. Surat {required && <span className="text-destructive">*</span>}
          </Label>
          <Input
            value={nomorSurat}
            onChange={(event) => onNomorSuratChange(event.target.value)}
            placeholder={
              required
                ? "Contoh: 521/BPP-JN/III/2026"
                : "Opsional, isi jika tersedia"
            }
            className="h-9"
          />
        </div>

        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
              dragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <Upload
              className={cn(
                "w-8 h-8 mx-auto mb-2 transition-colors",
                dragOver ? "text-primary" : "text-muted-foreground/40"
              )}
            />
            <p className="text-sm font-medium text-muted-foreground">
              Klik atau seret file ke sini
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {acceptLabel} • Maks. 10 MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFile(e.target.files[0]);
                  e.target.value = "";
                }
              }}
              className="hidden"
            />
          </div>
        ) : (
          <FilePreview
            file={file}
            onRemove={() => {
              if (file.preview) URL.revokeObjectURL(file.preview);
              onFileChange(null);
            }}
          />
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-1.5 text-destructive">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// Sub-component: Multi File Upload
// =============================================

function MultiFileUpload({
  label,
  description,
  accept,
  acceptLabel,
  files,
  onFilesChange,
}: {
  label: string;
  description: string;
  accept: string;
  acceptLabel: string;
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const handleFiles = useCallback(
    (newFiles: FileList) => {
      setError("");
      const exts = accept.split(",").map((e) => e.trim().toLowerCase());
      const added: UploadedFile[] = [];

      for (let i = 0; i < newFiles.length; i++) {
        const f = newFiles[i];
        const ext = "." + f.name.split(".").pop()?.toLowerCase();
        if (!exts.includes(ext)) {
          setError(`"${f.name}" format tidak valid. Gunakan: ${acceptLabel}`);
          continue;
        }
        if (f.size > MAX_FILE_SIZE) {
          setError(`"${f.name}" melebihi batas 10 MB`);
          continue;
        }
        added.push(createUploadedFile(f));
      }

      if (added.length > 0) {
        onFilesChange([...files, ...added]);
      }
    },
    [accept, acceptLabel, files, onFilesChange]
  );

  const removeFile = (index: number) => {
    const updated = [...files];
    const removed = updated.splice(index, 1)[0];
    if (removed.preview) URL.revokeObjectURL(removed.preview);
    onFilesChange(updated);
  };

  return (
    <Card className="border overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold">{label}</Label>
              <Badge color="secondary" className="text-[9px] px-1.5 py-0">
                Opsional
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Existing files */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((f, i) => (
              <FilePreview key={i} file={f} onRemove={() => removeFile(i)} />
            ))}
          </div>
        )}

        {/* Add more button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          className="w-full border-dashed text-xs h-9"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Tambah Dokumen
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files);
              e.target.value = "";
            }
          }}
          className="hidden"
        />

        {/* Info */}
        <p className="text-[10px] text-muted-foreground text-center">
          {acceptLabel} • Maks. 10 MB per file
        </p>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-1.5 text-destructive">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-xs">{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// Sub-component: File Preview
// =============================================

function FilePreview({
  file,
  onRemove,
}: {
  file: UploadedFile;
  onRemove: () => void;
}) {
  const isPdf = file.type === "application/pdf";
  const isImage = file.type.startsWith("image/");

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-3 py-2.5">
      {/* Icon or preview */}
      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center bg-muted">
        {isImage && file.preview ? (
          <img
            src={file.preview}
            alt={file.name}
            className="w-full h-full object-cover"
          />
        ) : isPdf ? (
          <FileText className="w-5 h-5 text-red-500" />
        ) : (
          <File className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {formatFileSize(file.size)}
          </span>
          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
          <span className="text-[10px] text-green-600">Siap diunggah</span>
        </div>
      </div>

      {/* Remove */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
