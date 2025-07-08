'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface LogoUploaderProps {
  currentLogo?: string;
  onLogoChange: (logoUrl: string) => void;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogo,
  onLogoChange,
  maxSize = 5,
  acceptedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentLogo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Format file tidak didukung",
        description: `Silakan pilih file dengan format: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File terlalu besar",
        description: `Ukuran file maksimal ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
      onLogoChange(result);
      setIsUploading(false);
      
      toast({
        title: "Logo berhasil diupload",
        description: "Logo telah berhasil diupload dan akan ditampilkan di template.",
      });
    };

    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Gagal membaca file",
        description: "Terjadi kesalahan saat membaca file logo.",
        variant: "destructive",
      });
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreviewUrl('');
    onLogoChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Logo dihapus",
      description: "Logo telah dihapus dari template.",
    });
  };

  const handleUrlInput = (url: string) => {
    setPreviewUrl(url);
    onLogoChange(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ImageIcon className="h-5 w-5" />
          <span>Logo Instansi</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
          {previewUrl ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Logo Preview" 
                  className="max-w-32 max-h-32 object-contain border border-gray-200 rounded"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0"
                  onClick={handleRemoveLogo}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Logo akan ditampilkan di bagian kiri atas kop surat
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4 text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada logo</p>
                <p className="text-xs">Upload logo atau masukkan URL gambar</p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Methods */}
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="logo-upload">Upload File Logo</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                ref={fileInputRef}
                id="logo-upload"
                type="file"
                accept={acceptedTypes.join(',')}
                onChange={handleFileSelect}
                disabled={isUploading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              {isUploading && (
                <div className="text-sm text-muted-foreground">
                  Mengupload...
                </div>
              )}
            </div>
          </div>

          {/* URL Input */}
          <div>
            <Label htmlFor="logo-url">Atau Masukkan URL Logo</Label>
            <Input
              id="logo-url"
              type="url"
              placeholder="https://example.com/logo.png"
              value={previewUrl}
              onChange={(e) => handleUrlInput(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Info */}
        <Alert>
          <AlertDescription className="text-xs">
            <strong>Tips:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Gunakan format PNG atau SVG untuk hasil terbaik</li>
              <li>Ukuran logo akan disesuaikan otomatis (maksimal 64x64px di template)</li>
              <li>Pastikan logo memiliki background transparan untuk tampilan yang optimal</li>
              <li>Ukuran file maksimal {maxSize}MB</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};
