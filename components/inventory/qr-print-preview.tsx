"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { DrugInventory } from "@/lib/types/inventory";
import { QRPrintOptions } from "./qr-print-settings";
import { convertDrugToMedicine } from "@/lib/utils/qr-conversion";
import QRLabelTemplate from "@/components/print/qr-label-template";
import { MedicineData } from "@/components/print/qr-label-template";
import "@/components/print/qr-label.css";

interface QRPrintPreviewProps {
  medicines: DrugInventory[];
  options: QRPrintOptions;
  onBack: () => void;
  onPrint: () => void;
}

const QRPrintPreview: React.FC<QRPrintPreviewProps> = ({
  medicines,
  options,
  onBack,
  onPrint,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [previewScale, setPreviewScale] = useState(0.7);

  // Filter medicines based on range settings
  const filteredMedicines = useMemo(() => {
    let filtered = [...medicines];

    switch (options.rangeType) {
      case "date":
        if (options.rangeSettings.dateFrom && options.rangeSettings.dateTo) {
          filtered = filtered.filter(med => {
            const entryDate = new Date(med.entryDate);
            return entryDate >= options.rangeSettings.dateFrom! && 
                   entryDate <= options.rangeSettings.dateTo!;
          });
        }
        break;
      
      case "id":
        if (options.rangeSettings.idFrom && options.rangeSettings.idTo) {
          filtered = filtered.filter(med => {
            return med.id >= options.rangeSettings.idFrom! && 
                   med.id <= options.rangeSettings.idTo!;
          });
        }
        break;
      
      case "custom":
        if (options.rangeSettings.customIds) {
          filtered = filtered.filter(med => 
            options.rangeSettings.customIds!.includes(med.id)
          );
        }
        break;
      
      default: // "all"
        break;
    }

    return filtered;
  }, [medicines, options.rangeType, options.rangeSettings]);

  // Generate medicines with repetition based on labelsPerItem
  const medicinesForPrint = useMemo(() => {
    const result: MedicineData[] = [];
    
    filteredMedicines.forEach(drug => {
      const medicine = convertDrugToMedicine(drug, options.printSettings);
      
      // Add multiple copies based on labelsPerItem setting
      for (let i = 0; i < options.printSettings.labelsPerItem; i++) {
        result.push({
          ...medicine,
          id: `${medicine.id}-${i + 1}`, // Unique ID for each copy
        });
      }
    });
    
    return result;
  }, [filteredMedicines, options.printSettings]);

  // Split medicines into pages (12 per page)
  const medicinePages = useMemo(() => {
    const pages: MedicineData[][] = [];
    const itemsPerPage = 12;

    for (let i = 0; i < medicinesForPrint.length; i += itemsPerPage) {
      pages.push(medicinesForPrint.slice(i, i + itemsPerPage));
    }

    return pages;
  }, [medicinesForPrint]);

  useEffect(() => {
    // Simulate loading time for preview generation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [medicinesForPrint]);

  const handleZoomIn = () => {
    setPreviewScale(prev => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setPreviewScale(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleResetZoom = () => {
    setPreviewScale(0.7);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Icon icon="heroicons:arrow-path" className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Memuat preview QR code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon icon="heroicons:eye" className="w-5 h-5" />
              Preview QR Code Labels
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={previewScale <= 0.3}
              >
                <Icon icon="heroicons:minus" className="w-4 h-4" />
              </Button>
              <Badge color="secondary" className="min-w-[60px]">
                {Math.round(previewScale * 100)}%
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={previewScale >= 1.5}
              >
                <Icon icon="heroicons:plus" className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary">{filteredMedicines.length}</div>
              <div className="text-sm text-muted-foreground">Item Obat</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{medicinesForPrint.length}</div>
              <div className="text-sm text-muted-foreground">Total Label</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{medicinePages.length}</div>
              <div className="text-sm text-muted-foreground">Halaman</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">
                {options.printSettings.paperSize}
              </div>
              <div className="text-sm text-muted-foreground">Format Kertas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Print Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pengaturan Cetak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Rentang:</strong>{" "}
              {options.rangeType === "all" && "Semua item"}
              {options.rangeType === "date" && `Tanggal ${options.rangeSettings.dateFrom?.toLocaleDateString()} - ${options.rangeSettings.dateTo?.toLocaleDateString()}`}
              {options.rangeType === "id" && `ID ${options.rangeSettings.idFrom} - ${options.rangeSettings.idTo}`}
              {options.rangeType === "custom" && `${options.rangeSettings.customIds?.length} ID kustom`}
            </div>
            <div>
              <strong>Label per item:</strong> {options.printSettings.labelsPerItem}
            </div>
            <div>
              <strong>Informasi:</strong>{" "}
              {[
                options.printSettings.includeItemInfo && "Info obat",
                options.printSettings.includeDates && "Tanggal",
                options.printSettings.includeLocation && "Lokasi"
              ].filter(Boolean).join(", ")}
            </div>
            <div>
              <strong>Orientasi:</strong> {options.printSettings.orientation === "portrait" ? "Portrait" : "Landscape"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Pages */}
      <div className="space-y-8">
        {medicinePages.map((pageMedicines, pageIndex) => (
          <Card key={pageIndex} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Halaman {pageIndex + 1}</span>
                <Badge color="default">
                  {pageMedicines.length} / 12 label
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div 
                className="transform-gpu transition-transform duration-200 origin-top-left print-page"
                style={{ transform: `scale(${previewScale})` }}
              >
                <QRLabelTemplate
                  medicines={pageMedicines}
                  showGrid={false}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {medicinePages.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Icon icon="heroicons:document-text" className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Tidak Ada Data untuk Dicetak</h3>
            <p className="text-muted-foreground mb-4">
              Tidak ada item yang sesuai dengan pengaturan rentang yang dipilih.
            </p>
            <Button variant="outline" onClick={onBack}>
              <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
              Kembali ke Pengaturan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Print Action */}
      {medicinePages.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Siap mencetak {medicinesForPrint.length} label QR code dalam {medicinePages.length} halaman
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onBack}>
              <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
              Ubah Pengaturan
            </Button>
            
            <Button onClick={onPrint} className="bg-green-600 hover:bg-green-700">
              <Icon icon="heroicons:printer" className="w-4 h-4 mr-2" />
              Cetak Sekarang
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRPrintPreview;
