// # START OF Step 1 Validation Component - QR scanning and system validation for distribution process
// Purpose: Handle QR code scanning and validate system requirements before proceeding
// Features: Mobile-optimized QR scanner, item validation, progress tracking, error handling
// Props: transaction, wizardState, onNext, onUpdateState
// Dependencies: QR scanner library, validation utilities, progress components

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";
import { Transaction, ApprovedDrug } from "@/lib/types/transaction";
import { WizardState } from "@/app/(dashboard)/transactions/outgoing/process/[id]/page";
import { cn } from "@/lib/utils";

interface Step1ValidationProps {
  transaction: Transaction;
  wizardState: WizardState;
  onNext: () => void;
  onUpdateState: (updates: Partial<WizardState>) => void;
}

interface ScanResult {
  drugId: string;
  scannedAt: Date;
  quantity: number;
}

export const Step1Validation: React.FC<Step1ValidationProps> = ({
  transaction,
  wizardState,
  onNext,
  onUpdateState,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'validating' | 'completed' | 'error'>('pending');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const approvedDrugs = transaction.approval?.approvedDrugs ?? [];
  const scannedItems = wizardState.scanResults.scannedItems;
  
  // Calculate progress
  const totalRequiredCount = approvedDrugs.reduce((sum, drug) => sum + drug.approvedQuantity, 0);
  const totalScannedCount = Object.values(scannedItems).reduce((sum, count) => sum + count, 0);
  const scanProgress = totalRequiredCount > 0 ? (totalScannedCount / totalRequiredCount) * 100 : 0;
  const isComplete = totalScannedCount >= totalRequiredCount && totalRequiredCount > 0;

  // System validation checks
  const validationChecks = [
    {
      id: 'transaction_status',
      label: 'Status Transaksi',
      check: () => ['approved', 'ready_distribution'].includes(transaction.status),
      message: 'Transaksi harus sudah disetujui'
    },
    {
      id: 'approved_drugs',
      label: 'Daftar Obat Disetujui',
      check: () => approvedDrugs.length > 0,
      message: 'Tidak ada obat yang disetujui untuk didistribusi'
    },
    {
      id: 'stock_availability',
      label: 'Ketersediaan Stok',
      check: () => {
        // In real app, check actual stock vs approved quantities
        return approvedDrugs.every(drug => drug.approvedQuantity > 0);
      },
      message: 'Stok tidak mencukupi untuk beberapa item'
    },
    {
      id: 'pickup_schedule',
      label: 'Jadwal Pengambilan',
      check: () => {
        // Check if today is within pickup schedule
        const today = new Date();
        const scheduleDate = transaction.approval?.pickupSchedule ? new Date(transaction.approval.pickupSchedule) : null;
        return scheduleDate ? today >= scheduleDate : true;
      },
      message: 'Belum memasuki jadwal pengambilan yang ditentukan'
    }
  ];

  const passedChecks = validationChecks.filter(check => check.check());
  const failedChecks = validationChecks.filter(check => !check.check());

  // Start camera for QR scanning
  const startCamera = async () => {
    try {
      setIsScanning(true);
      setScanError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Camera access failed:', error);
      setScanError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
      setIsScanning(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Simulate QR scan result (replace with actual QR scanner library)
  const handleManualScan = (drugId: string) => {
    const drug = approvedDrugs.find(d => d.drugId === drugId);
    if (!drug) {
      toast.error('Obat tidak ditemukan dalam daftar persetujuan');
      return;
    }

    const currentCount = scannedItems[drugId] || 0;
    if (currentCount >= drug.approvedQuantity) {
      toast.error(`Semua ${drug.drugName} sudah dipindai`);
      return;
    }

    const newScannedItems = {
      ...scannedItems,
      [drugId]: currentCount + 1
    };

    onUpdateState({
      scanResults: {
        scannedItems: newScannedItems,
        isComplete: Object.values(newScannedItems).reduce((sum, count) => sum + count, 0) >= totalRequiredCount,
        timestamp: new Date()
      }
    });

    toast.success(`${drug.drugName} berhasil dipindai (+1)`);
  };

  // Run system validation
  const runValidation = async () => {
    setValidationStatus('validating');
    
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (failedChecks.length > 0) {
      setValidationStatus('error');
      toast.error('Validasi sistem gagal. Periksa persyaratan yang belum terpenuhi.');
    } else {
      setValidationStatus('completed');
      toast.success('Validasi sistem berhasil. Siap untuk proses scanning.');
    }
  };

  // Handle next step
  const handleNext = () => {
    if (!isComplete) {
      toast.error('Semua item harus dipindai terlebih dahulu');
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
      {/* System Validation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Icon 
              icon={validationStatus === 'completed' ? "lucide:check-circle" : "lucide:shield-check"} 
              className={cn(
                "w-5 h-5",
                validationStatus === 'completed' && "text-green-500",
                validationStatus === 'error' && "text-red-500"
              )} 
            />
            <span>Validasi Sistem</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationChecks.map((check) => (
            <div key={check.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <p className="text-sm font-medium">{check.label}</p>
                {!check.check() && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{check.message}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                {check.check() ? (
                  <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-500" />
                ) : (
                  <Icon icon="lucide:x-circle" className="w-5 h-5 text-red-500" />
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-4">
            <Button
              onClick={runValidation}
              disabled={validationStatus === 'validating' || validationStatus === 'completed'}
              className="w-full sm:w-auto"
            >
              {validationStatus === 'validating' && (
                <Icon icon="lucide:loader-2" className="w-4 h-4 mr-2 animate-spin" />
              )}
              {validationStatus === 'pending' && 'Jalankan Validasi'}
              {validationStatus === 'validating' && 'Memvalidasi...'}
              {validationStatus === 'completed' && 'Validasi Selesai'}
              {validationStatus === 'error' && 'Validasi Ulang'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Card */}
      {validationStatus === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon icon="lucide:scan-line" className="w-5 h-5" />
                <span>Scan Item Obat</span>
              </div>
              <Badge color="info">
                {totalScannedCount} / {totalRequiredCount}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress Scanning</span>
                <span className="text-sm text-gray-500">{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>

            {/* Camera View */}
            {isScanning && (
              <div className="relative rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50"></div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopCamera}
                  className="absolute top-4 right-4 bg-black/50 text-white border-white/50"
                >
                  <Icon icon="lucide:x" className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Scanner Controls */}
            {!isScanning && (
              <div className="text-center py-8">
                <Icon icon="lucide:scan-qr" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Scan QR code pada setiap kemasan obat yang akan dikeluarkan
                </p>
                <Button onClick={startCamera} className="w-full sm:w-auto">
                  <Icon icon="lucide:camera" className="w-4 h-4 mr-2" />
                  Mulai Scan QR Code
                </Button>
              </div>
            )}

            {scanError && (
              <Alert>
                <Icon icon="lucide:alert-circle" className="h-4 w-4" />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}

            {/* Manual Scan Buttons (for demo) */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-3">Demo: Simulasi scan manual</p>
              <div className="grid grid-cols-1 gap-2">
                {approvedDrugs.map((drug) => {
                  const scannedCount = scannedItems[drug.drugId] || 0;
                  const isCompleted = scannedCount >= drug.approvedQuantity;

                  return (
                    <div key={drug.drugId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{drug.drugName}</p>
                        <p className="text-xs text-gray-500">
                          {scannedCount} / {drug.approvedQuantity} {drug.unit}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => handleManualScan(drug.drugId)}
                        disabled={isCompleted}
                      >
                        <Icon 
                          icon={isCompleted ? "lucide:check" : "lucide:scan-line"} 
                          className="w-4 h-4 mr-1" 
                        />
                        {isCompleted ? "Selesai" : "Scan"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Step Button */}
      {validationStatus === 'completed' && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleNext}
            disabled={!isComplete}
            size="lg"
            className="w-full sm:w-auto"
          >
            Lanjut ke Dokumentasi
            <Icon icon="lucide:arrow-right" className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
};

// # END OF Step 1 Validation Component 