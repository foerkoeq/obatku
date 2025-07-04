// # START OF Step 4 File Upload Component - Upload signed Berita Acara with mobile-friendly interface
// Purpose: Handle file upload of signed Berita Acara with preview and validation
// Features: Drag & drop, mobile camera integration, file preview, upload progress, validation
// Props: transaction, wizardState, onNext, onPrev, onUpdateState
// Dependencies: File upload utilities, image compression, file validation

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { Transaction } from "@/lib/types/transaction";
import { WizardState } from "@/app/(dashboard)/transactions/outgoing/process/[id]/page";
import { cn } from "@/lib/utils";

interface Step4FileUploadProps {
  transaction: Transaction;
  wizardState: WizardState;
  onNext: () => void;
  onPrev: () => void;
  onUpdateState: (updates: Partial<WizardState>) => void;
}

interface UploadedFile {
  file: File;
  preview: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

const ACCEPTED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const Step4FileUpload: React.FC<Step4FileUploadProps> = ({
  transaction,
  wizardState,
  onNext,
  onPrev,
  onUpdateState,
}) => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const isComplete = uploadedFile?.uploadStatus === 'completed';

  // Validate file
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ACCEPTED_FORMATS.includes(file.type)) {
      return {
        valid: false,
        error: 'Format file tidak didukung. Gunakan JPG, PNG, atau PDF.'
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'Ukuran file terlalu besar. Maksimal 10MB.'
      };
    }

    return { valid: true };
  };

  // Create file preview
  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        // For PDF, use a placeholder image or PDF icon
        resolve('/images/pdf-placeholder.png'); // Add a PDF placeholder image
      } else {
        reject(new Error('Unsupported file type for preview'));
      }
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    try {
      const preview = await createFilePreview(file);
      
      const uploadedFileData: UploadedFile = {
        file,
        preview,
        uploadProgress: 0,
        uploadStatus: 'pending'
      };

      setUploadedFile(uploadedFileData);
      toast.success('File berhasil dipilih');
    } catch (error) {
      toast.error('Gagal memproses file');
    }
  }, []);

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Start camera for document capture
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraMode(true);
      }
    } catch (error) {
      toast.error('Tidak dapat mengakses kamera');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraMode(false);
  };

  // Capture document photo
  const captureDocument = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create blob'));
      }, 'image/jpeg', 0.9);
    });

    // Create file from blob
    const timestamp = new Date().getTime();
    const file = new File([blob], `BA-signed-${transaction.id}-${timestamp}.jpg`, {
      type: 'image/jpeg'
    });

    stopCamera();
    handleFileSelect(file);
  };

  // Simulate file upload
  const uploadFile = async () => {
    if (!uploadedFile || uploadedFile.uploadStatus === 'completed') return;

    setIsUploading(true);
    
    try {
      // Update status to uploading
      setUploadedFile(prev => prev ? {
        ...prev,
        uploadStatus: 'uploading',
        uploadProgress: 0
      } : null);

      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadedFile(prev => prev ? {
          ...prev,
          uploadProgress: progress
        } : null);
      }

      // Mark as completed
      setUploadedFile(prev => prev ? {
        ...prev,
        uploadStatus: 'completed',
        uploadProgress: 100
      } : null);

      // Update wizard state
      onUpdateState({
        fileUpload: {
          signedDocument: uploadedFile.file,
          uploaded: true,
          timestamp: new Date()
        }
      });

      toast.success('File berhasil diupload');
    } catch (error) {
      setUploadedFile(prev => prev ? {
        ...prev,
        uploadStatus: 'error',
        errorMessage: 'Upload gagal. Silakan coba lagi.'
      } : null);
      toast.error('Upload gagal');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle next step
  const handleNext = () => {
    if (!isComplete) {
      toast.error('File harus diupload terlebih dahulu');
      return;
    }

    onNext();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon icon="lucide:upload" className="w-5 h-5" />
            <span>Upload Berita Acara</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              Upload foto atau scan Berita Acara yang telah ditandatangani oleh kedua belah pihak.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">JPG, PNG, PDF</Badge>
              <Badge variant="outline">Maks 10MB</Badge>
              <Badge variant="outline">Foto harus jelas</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      {!uploadedFile && (
        <Card>
          <CardContent className="pt-6">
            {/* Camera Mode */}
            {isCameraMode ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white/50 rounded-lg w-80 h-56">
                      <div className="w-full h-full border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                        <span className="text-white/70 text-sm">Posisikan dokumen di sini</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                  >
                    <Icon icon="lucide:x" className="w-4 h-4 mr-2" />
                    Batal
                  </Button>
                  <Button onClick={captureDocument}>
                    <Icon icon="lucide:camera" className="w-4 h-4 mr-2" />
                    Ambil Foto
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragOver
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                >
                  <Icon icon="lucide:upload-cloud" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Upload Berita Acara
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag & drop file atau klik tombol untuk memilih file
                  </p>
                  
                  <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon icon="lucide:folder-open" className="w-4 h-4 mr-2" />
                      Pilih File
                    </Button>
                    <Button
                      variant="outline"
                      onClick={startCamera}
                    >
                      <Icon icon="lucide:camera" className="w-4 h-4 mr-2" />
                      Foto Langsung
                    </Button>
                  </div>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FORMATS.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            )}

            {/* Hidden canvas for camera capture */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>
      )}

      {/* File Preview & Upload */}
      {uploadedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>File Terpilih</span>
              <Badge 
                variant={uploadedFile.uploadStatus === 'completed' ? 'default' : 'outline'}
              >
                {uploadedFile.uploadStatus === 'pending' && 'Siap Upload'}
                {uploadedFile.uploadStatus === 'uploading' && 'Mengupload...'}
                {uploadedFile.uploadStatus === 'completed' && 'Upload Selesai'}
                {uploadedFile.uploadStatus === 'error' && 'Upload Gagal'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Info */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {uploadedFile.file.type.startsWith('image/') ? (
                  <img
                    src={uploadedFile.preview}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg border flex items-center justify-center">
                    <Icon icon="lucide:file-text" className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(uploadedFile.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {uploadedFile.file.type}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={removeFile}
                disabled={uploadedFile.uploadStatus === 'uploading'}
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </Button>
            </div>

            {/* Upload Progress */}
            {uploadedFile.uploadStatus === 'uploading' && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload Progress</span>
                  <span>{uploadedFile.uploadProgress}%</span>
                </div>
                <Progress value={uploadedFile.uploadProgress} />
              </div>
            )}

            {/* Error Message */}
            {uploadedFile.uploadStatus === 'error' && uploadedFile.errorMessage && (
              <Alert>
                <Icon icon="lucide:alert-circle" className="h-4 w-4" />
                <AlertDescription>{uploadedFile.errorMessage}</AlertDescription>
              </Alert>
            )}

            {/* Upload Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {uploadedFile.uploadStatus === 'pending' && (
                <Button
                  onClick={uploadFile}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  <Icon icon="lucide:upload" className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              )}
              
              {uploadedFile.uploadStatus === 'error' && (
                <Button
                  onClick={uploadFile}
                  disabled={isUploading}
                  className="w-full sm:w-auto"
                >
                  <Icon icon="lucide:refresh-ccw" className="w-4 h-4 mr-2" />
                  Coba Lagi
                </Button>
              )}

              {uploadedFile.uploadStatus === 'completed' && (
                <Alert>
                  <Icon icon="lucide:check-circle" className="h-4 w-4" />
                  <AlertDescription>
                    File berhasil diupload dan siap untuk proses selanjutnya.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <Button
          variant="outline"
          onClick={onPrev}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          <Icon icon="lucide:arrow-left" className="w-4 h-4 mr-2" />
          Kembali ke Berita Acara
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isComplete}
          size="lg"
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          Lanjut ke Konfirmasi
          <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// # END OF Step 4 File Upload Component 