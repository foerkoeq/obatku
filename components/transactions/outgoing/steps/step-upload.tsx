// # START OF Step Upload - Upload signed berita acara
// Purpose: Upload photo/scan of signed berita acara document
// Features: Drag & drop, camera capture, file preview

"use client";

import React, { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { OutgoingWizardState } from "@/lib/types/outgoing";

interface StepUploadProps {
  wizardState: OutgoingWizardState;
  onUpdateState: (updates: Partial<OutgoingWizardState>) => void;
}

const StepUpload: React.FC<StepUploadProps> = ({ wizardState, onUpdateState }) => {
  const { signedDocumentUrl, signedDocumentFile } = wizardState;
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const hasFile = !!signedDocumentUrl;

  // ─── File handling ───
  const processFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format file tidak didukung', {
        description: 'Gunakan format JPG, PNG, WebP, atau PDF.',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar', {
        description: 'Maksimal 10MB.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onUpdateState({
        signedDocumentUrl: e.target?.result as string,
        signedDocumentFile: file,
      });
      toast.success('File berhasil diunggah');
    };
    reader.readAsDataURL(file);
  };

  // ─── Drag & Drop ───
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Camera capture ───
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      toast.error('Tidak dapat mengakses kamera');
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const captureDocument = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    onUpdateState({
      signedDocumentUrl: dataUrl,
      signedDocumentFile: null, // captured from camera
    });

    stopCamera();
    toast.success('Foto dokumen berhasil diambil');
  }, [onUpdateState, stopCamera]);

  const removeFile = () => {
    onUpdateState({
      signedDocumentUrl: undefined,
      signedDocumentFile: null,
    });
    toast.info('File dihapus');
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pb-4">
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Info */}
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
          <div className="flex items-start gap-3">
            <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Upload Berita Acara Bertanda Tangan
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Unggah foto atau scan Berita Acara yang telah ditandatangani oleh kedua belah pihak.
                Format yang didukung: JPG, PNG, WebP, atau PDF (maks. 10MB).
              </div>
            </div>
          </div>
        </div>

        {/* Upload Zone / Preview */}
        {hasFile ? (
          <div className="space-y-3">
            {/* Preview */}
            <div className="rounded-xl border-2 border-green-300 dark:border-green-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons:check-circle" className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Dokumen Terunggah
                  </span>
                </div>
                <button
                  onClick={removeFile}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Icon icon="heroicons:trash-mini" className="w-4 h-4" />
                </button>
              </div>
              {signedDocumentUrl && !signedDocumentUrl.startsWith('data:application/pdf') ? (
                <img
                  src={signedDocumentUrl}
                  alt="Berita Acara Bertanda Tangan"
                  className="w-full max-h-96 object-contain bg-gray-50 dark:bg-gray-800"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800">
                  <div className="text-center">
                    <Icon icon="heroicons:document-text" className="w-12 h-12 text-gray-400 mx-auto" />
                    <div className="text-sm text-gray-500 mt-2">
                      {signedDocumentFile?.name ?? 'Dokumen PDF'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Replace button */}
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-1.5" />
                Ganti File
              </Button>
              <Button
                onClick={startCamera}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Icon icon="heroicons:camera" className="w-4 h-4 mr-1.5" />
                Foto Ulang
              </Button>
            </div>
          </div>
        ) : isCameraActive ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full aspect-[4/3] object-cover bg-black"
                playsInline
                muted
              />
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
                  onClick={captureDocument}
                  className="w-16 h-16 rounded-full border-4 border-white bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/50 transition-all active:scale-90"
                >
                  <div className="w-12 h-12 rounded-full bg-white" />
                </button>
                <div className="w-10" />
              </div>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "rounded-xl border-2 border-dashed p-8 text-center transition-all",
              isDragging
                ? "border-purple-400 dark:border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                : "border-gray-300 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700"
            )}
          >
            <Icon
              icon="heroicons:cloud-arrow-up"
              className={cn(
                "w-12 h-12 mx-auto mb-3",
                isDragging ? "text-purple-500" : "text-gray-400"
              )}
            />
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isDragging ? 'Lepas file di sini' : 'Seret file ke sini'}
            </div>
            <div className="text-xs text-gray-500 mb-4">
              atau
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
              >
                <Icon icon="heroicons:folder-open" className="w-4 h-4 mr-1.5" />
                Pilih File
              </Button>
              <Button
                onClick={startCamera}
                variant="outline"
                size="sm"
              >
                <Icon icon="heroicons:camera" className="w-4 h-4 mr-1.5" />
                Foto Dokumen
              </Button>
            </div>
          </div>
        )}

        {/* Tips */}
        {!hasFile && !isCameraActive && (
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/30 p-4 space-y-2">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400">Tips:</div>
            <ul className="text-xs text-gray-500 space-y-1">
              <li className="flex items-start gap-1.5">
                <Icon icon="heroicons:check-mini" className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                Pastikan tanda tangan terlihat jelas
              </li>
              <li className="flex items-start gap-1.5">
                <Icon icon="heroicons:check-mini" className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                Foto seluruh halaman berita acara
              </li>
              <li className="flex items-start gap-1.5">
                <Icon icon="heroicons:check-mini" className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                Hindari bayangan atau cahaya pantul pada dokumen
              </li>
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default StepUpload;
// # END OF Step Upload
