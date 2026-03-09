// # START OF Step Photo - Camera documentation for handover
// Purpose: Take photos for serah-terima documentation
// Features: Camera capture, photo preview gallery, delete photos

"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OutgoingWizardState } from "@/lib/types/outgoing";

interface StepPhotoProps {
  wizardState: OutgoingWizardState;
  onUpdateState: (updates: Partial<OutgoingWizardState>) => void;
}

const StepPhoto: React.FC<StepPhotoProps> = ({ wizardState, onUpdateState }) => {
  const { photos } = wizardState;
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ─── Camera Controls ───
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      toast.error('Tidak dapat mengakses kamera', {
        description: 'Pastikan izin kamera diaktifkan di pengaturan browser.',
      });
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    onUpdateState({
      photos: [...photos, dataUrl],
    });

    toast.success(`Foto ${photos.length + 1} berhasil diambil`);
  }, [photos, onUpdateState]);

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onUpdateState({ photos: updated });
    if (previewIndex === index) setPreviewIndex(null);
    toast.info('Foto dihapus');
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Info */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <div className="flex items-start gap-3">
            <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Dokumentasi Penyerahan
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Ambil foto sebagai bukti serah terima obat. Foto ini akan dilampirkan pada berita acara.
                Pastikan foto menampilkan obat yang diserahkan dan pihak penerima.
              </div>
            </div>
          </div>
        </div>

        {/* Camera View */}
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isCameraActive ? (
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full aspect-[4/3] object-cover bg-black"
                playsInline
                muted
              />
              {/* Camera controls */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-4 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <Button
                  onClick={stopCamera}
                  variant="ghost"
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  <Icon icon="heroicons:x-mark" className="w-5 h-5" />
                </Button>
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full border-4 border-white bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-all active:scale-90"
                >
                  <div className="w-12 h-12 rounded-full bg-white" />
                </button>
                <div className="w-10" /> {/* spacer */}
              </div>
              {/* Photo count badge */}
              {photos.length > 0 && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                  {photos.length} foto
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={startCamera}
              className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-3 bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Icon icon="heroicons:camera" className="w-8 h-8 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Buka Kamera
                </div>
                <div className="text-xs text-gray-500">
                  Tap untuk mulai mengambil foto
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                <Icon icon="heroicons:photo" className="w-5 h-5 text-purple-500" />
                Foto Diambil ({photos.length})
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative group rounded-lg overflow-hidden aspect-square border border-gray-200 dark:border-gray-700"
                >
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setPreviewIndex(previewIndex === index ? null : index)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon icon="heroicons:x-mark-mini" className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white bg-black/50 px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}

              {/* Add more button */}
              {!isCameraActive && (
                <button
                  onClick={startCamera}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                >
                  <Icon icon="heroicons:plus" className="w-6 h-6 text-gray-400" />
                  <span className="text-[10px] text-gray-400">Tambah</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        {previewIndex !== null && photos[previewIndex] && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Preview Foto {previewIndex + 1}
              </span>
              <button
                onClick={() => setPreviewIndex(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon icon="heroicons:x-mark-mini" className="w-4 h-4" />
              </button>
            </div>
            <img
              src={photos[previewIndex]}
              alt={`Preview ${previewIndex + 1}`}
              className="w-full"
            />
          </div>
        )}

        {/* Guide */}
        {photos.length === 0 && !isCameraActive && (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/30 p-4 space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Tips dokumentasi yang baik:
            </div>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-start gap-1.5">
                <Icon icon="heroicons:check-mini" className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                Foto obat yang akan diserahkan secara jelas
              </li>
              <li className="flex items-start gap-1.5">
                <Icon icon="heroicons:check-mini" className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                Foto proses serah terima dengan pihak penerima
              </li>
              <li className="flex items-start gap-1.5">
                <Icon icon="heroicons:check-mini" className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                Pastikan pencahayaan cukup dan foto tidak blur
              </li>
              <li className="flex items-start gap-1.5">
                <Icon icon="heroicons:check-mini" className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                Minimal 1 foto, disarankan 2-3 foto dari sudut berbeda
              </li>
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default StepPhoto;
// # END OF Step Photo
