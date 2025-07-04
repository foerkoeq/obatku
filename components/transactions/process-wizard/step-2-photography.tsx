// # START OF Step 2 Photography Component - Mobile camera integration for documentation
// Purpose: Handle photo documentation of bukti serah terima with mobile-optimized camera
// Features: Front/back camera switch, photo preview, retake functionality, multiple photos
// Props: transaction, wizardState, onNext, onPrev, onUpdateState
// Dependencies: Camera API, file handling utilities, image compression

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { Transaction } from "@/lib/types/transaction";
import { WizardState } from "@/app/(dashboard)/transactions/outgoing/process/[id]/page";
import { cn } from "@/lib/utils";

interface Step2PhotographyProps {
  transaction: Transaction;
  wizardState: WizardState;
  onNext: () => void;
  onPrev: () => void;
  onUpdateState: (updates: Partial<WizardState>) => void;
}

interface PhotoCapture {
  id: string;
  file: File;
  dataUrl: string;
  timestamp: Date;
  metadata?: {
    facing: 'user' | 'environment';
    resolution: string;
  };
}

export const Step2Photography: React.FC<Step2PhotographyProps> = ({
  transaction,
  wizardState,
  onNext,
  onPrev,
  onUpdateState,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [capturedPhotos, setCapturedPhotos] = useState<PhotoCapture[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const minPhotosRequired = 2; // Minimum photos for documentation
  const maxPhotosAllowed = 5; // Maximum photos allowed
  const isComplete = capturedPhotos.length >= minPhotosRequired;

  // Start camera with specified facing mode
  const startCamera = useCallback(async (facing: 'user' | 'environment' = facingMode) => {
    try {
      setError(null);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          aspectRatio: { ideal: 16/9 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setFacingMode(facing);
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan dan tidak sedang digunakan aplikasi lain.');
      setIsCameraActive(false);
    }
  }, [facingMode]);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Switch camera facing mode
  const switchCamera = useCallback(() => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    if (isCameraActive) {
      startCamera(newFacing);
    }
  }, [facingMode, isCameraActive, startCamera]);

  // Capture photo
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas context not available');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.8);
      });

      // Create file from blob
      const timestamp = new Date();
      const fileName = `bukti-serah-terima-${transaction.id}-${timestamp.getTime()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Create data URL for preview
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      // Create photo capture object
      const photoCapture: PhotoCapture = {
        id: `photo-${timestamp.getTime()}`,
        file,
        dataUrl,
        timestamp,
        metadata: {
          facing: facingMode,
          resolution: `${canvas.width}x${canvas.height}`
        }
      };

      setCapturedPhotos(prev => [...prev, photoCapture]);
      toast.success('Foto berhasil diambil');

      // Add capture sound effect (optional)
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }

    } catch (err) {
      console.error('Failed to capture photo:', err);
      toast.error('Gagal mengambil foto. Silakan coba lagi.');
    } finally {
      setIsCapturing(false);
    }
  }, [facingMode, transaction.id, isCapturing]);

  // Delete photo
  const deletePhoto = (photoId: string) => {
    setCapturedPhotos(prev => prev.filter(photo => photo.id !== photoId));
    toast.success('Foto dihapus');
  };

  // Handle next step
  const handleNext = () => {
    if (!isComplete) {
      toast.error(`Minimal ${minPhotosRequired} foto bukti serah terima diperlukan`);
      return;
    }

    // Update wizard state with photos
    onUpdateState({
      photoDocumentation: {
        photos: capturedPhotos.map(photo => photo.file),
        timestamp: new Date()
      }
    });

    onNext();
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon icon="lucide:camera" className="w-5 h-5" />
            <span>Dokumentasi Serah Terima</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p className="text-gray-700 dark:text-gray-300">
              Ambil foto bukti serah terima obat kepada PPL. Pastikan foto jelas dan menunjukkan:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
              <li>Wajah penerima (PPL) dan petugas gudang</li>
              <li>Kemasan obat yang diserahkan</li>
              <li>Dokumen serah terima (jika ada)</li>
              <li>Area pengambilan obat</li>
            </ul>
            <div className="flex items-center space-x-4 pt-2">
              <Badge color="info">
                {capturedPhotos.length} / {minPhotosRequired} foto (min)
              </Badge>
              <Badge color="warning">
                Maks {maxPhotosAllowed} foto
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Kamera</span>
            {isCameraActive && (
              <div className="flex items-center space-x-2">
                <Badge color="secondary" className="text-xs">
                  {facingMode === 'environment' ? 'Belakang' : 'Depan'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchCamera}
                  className="text-xs px-2 py-1"
                >
                  <Icon icon="lucide:rotate-ccw" className="w-3 h-3" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert>
              <Icon icon="lucide:alert-circle" className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Camera View */}
          {isCameraActive ? (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 sm:h-80 object-cover"
              />
              
              {/* Camera Controls Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopCamera}
                    className="bg-black/50 text-white border-white/50"
                  >
                    <Icon icon="lucide:x" className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    onClick={capturePhoto}
                    disabled={isCapturing || capturedPhotos.length >= maxPhotosAllowed}
                    size="lg"
                    className={cn(
                      "bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16 p-0",
                      isCapturing && "animate-pulse"
                    )}
                  >
                    {isCapturing ? (
                      <Icon icon="lucide:loader-2" className="w-8 h-8 animate-spin" />
                    ) : (
                      <Icon icon="lucide:camera" className="w-8 h-8" />
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={switchCamera}
                    className="bg-black/50 text-white border-white/50"
                  >
                    <Icon icon="lucide:rotate-ccw" className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Capture guidelines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-white/30 rounded-lg w-64 h-48 flex items-center justify-center">
                  <span className="text-white/70 text-sm">Fokus area foto</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Icon icon="lucide:camera" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Mulai kamera untuk mengambil foto bukti serah terima
              </p>
              <Button onClick={() => startCamera()} className="w-full sm:w-auto">
                <Icon icon="lucide:video" className="w-4 h-4 mr-2" />
                Aktifkan Kamera
              </Button>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      {capturedPhotos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Foto Tersimpan</span>
              <Badge color="default">
                {capturedPhotos.length} foto
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {capturedPhotos.map((photo, index) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.dataUrl}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      variant="outline"
                      color="destructive"
                      size="sm"
                      onClick={() => deletePhoto(photo.id)}
                      className="text-xs"
                    >
                      <Icon icon="lucide:trash-2" className="w-3 h-3 mr-1" />
                      Hapus
                    </Button>
                  </div>
                  <Badge 
                    color="secondary" 
                    className="absolute top-2 left-2 text-xs"
                  >
                    {index + 1}
                  </Badge>
                </div>
              ))}
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
          Kembali ke Validasi
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={!isComplete}
          size="lg"
          className="w-full sm:w-auto order-1 sm:order-2"
        >
          Lanjut ke Berita Acara
          <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// # END OF Step 2 Photography Component 