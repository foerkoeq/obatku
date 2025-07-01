import React, { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Camera, Image, Upload, X, Eye } from "lucide-react";

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

interface ImageUploadProps {
  value?: ImageFile[];
  onChange: (files: ImageFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 5, // 5MB default
  acceptedTypes = ["image/jpeg", "image/png", "image/jpg"],
  disabled = false,
  className = "",
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const createImageFile = (file: File): ImageFile => ({
    file,
    preview: URL.createObjectURL(file),
    id: Math.random().toString(36).substr(2, 9),
  });

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Tipe file tidak didukung. Hanya ${acceptedTypes.join(", ")} yang diperbolehkan.`;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `Ukuran file terlalu besar. Maksimal ${maxSize}MB.`;
    }
    
    return null;
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: ImageFile[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else if (value.length + validFiles.length < maxFiles) {
        validFiles.push(createImageFile(file));
      } else {
        errors.push(`Maksimal ${maxFiles} file yang diperbolehkan.`);
      }
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      onChange([...value, ...validFiles]);
    }

    // Reset input
    event.target.value = "";
    setIsDialogOpen(false);
  };

  const handleFromGallery = () => {
    fileInputRef.current?.click();
  };

  const handleFromCamera = () => {
    cameraInputRef.current?.click();
  };

  const removeFile = (id: string) => {
    const fileToRemove = value.find(f => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onChange(value.filter(f => f.id !== id));
  };

  const openPreview = (preview: string) => {
    setPreviewImage(preview);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  // Cleanup URLs when component unmounts
  React.useEffect(() => {
    return () => {
      value.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Button */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled || value.length >= maxFiles}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            Unggah Foto/Dokumen
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pilih Sumber Foto</DialogTitle>
            <DialogDescription>
              Pilih dari mana Anda ingin mengambil foto atau dokumen
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant="outline"
              onClick={handleFromCamera}
              className="h-20 flex-col"
            >
              <Camera className="h-6 w-6 mb-2" />
              Kamera
            </Button>
            <Button
              variant="outline"
              onClick={handleFromGallery}
              className="h-20 flex-col"
            >
              <Image className="h-6 w-6 mb-2" />
              Galeri
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        multiple
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* File previews */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              File Terunggah ({value.length}/{maxFiles})
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((imageFile) => (
              <Card key={imageFile.id} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={imageFile.preview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openPreview(imageFile.preview)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => removeFile(imageFile.id)}
                        className="border-red-200 hover:bg-red-50 text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* File info */}
                  <div className="mt-2">
                    <p className="text-xs truncate text-muted-foreground">
                      {imageFile.file.name}
                    </p>
                    <Badge className="text-xs bg-secondary text-secondary-foreground">
                      {(imageFile.file.size / 1024 / 1024).toFixed(1)}MB
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={closePreview}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Preview Gambar</DialogTitle>
            </DialogHeader>
            <div className="relative">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 border-red-200 hover:bg-red-50 text-red-600"
                onClick={closePreview}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Upload info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Maksimal {maxFiles} file</p>
        <p>• Ukuran maksimal {maxSize}MB per file</p>
        <p>• Format yang didukung: {acceptedTypes.map(type => type.split('/')[1]).join(', ')}</p>
      </div>
    </div>
  );
}; 