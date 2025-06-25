// # START OF Barcode Modal Component - Barcode display and print modal for inventory
// Purpose: Display and print barcode for drug inventory items
// Props: isOpen, onClose, item, type (pack/item)
// Returns: Modal with barcode display and print options
// Dependencies: Dialog, Button, QR Code generation

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { DrugInventory, BarcodeOptions } from "@/lib/types/inventory";
import { cn } from "@/lib/utils";

interface BarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DrugInventory | null;
  onPrint: (options: BarcodeOptions) => void;
}

const BarcodeModal: React.FC<BarcodeModalProps> = ({
  isOpen,
  onClose,
  item,
  onPrint,
}) => {
  const [barcodeType, setBarcodeType] = useState<BarcodeOptions['type']>('item');

  if (!item) return null;

  const handlePrint = () => {
    onPrint({
      type: barcodeType,
      scope: 'selected'
    });
  };

  // Generate barcode data based on type
  const getBarcodeData = () => {
    const baseData = {
      id: item.id,
      name: item.name,
      producer: item.producer,
      batch: item.barcode || item.id,
    };

    if (barcodeType === 'pack') {
      return {
        ...baseData,
        type: 'PACK',
        quantity: item.largePack.quantity,
        unit: item.largePack.unit,
        itemsPerPack: item.largePack.itemsPerPack,
      };
    } else {
      return {
        ...baseData,
        type: 'ITEM',
        unit: item.unit,
      };
    }
  };

  const barcodeData = getBarcodeData();

  // Mock barcode display (in real implementation, use actual barcode library)
  const BarcodeDisplay = ({ data, type }: { data: any; type: 'pack' | 'item' }) => (
    <div className="bg-white border-2 border-dashed border-default-300 rounded-lg p-6 text-center">
      <div className="space-y-4">
        {/* Mock Barcode Visual */}
        <div className="mx-auto w-48 h-24 bg-gradient-to-r from-black to-black bg-repeat-x flex items-center justify-center">
          <div className="text-white text-xs font-mono">
            |||||| |||| || ||||| |||| |||
          </div>
        </div>
        
        {/* Barcode Text */}
        <div className="text-sm font-mono">
          {data.batch}
        </div>
        
        {/* Product Info */}
        <div className="space-y-1 text-xs">
          <div className="font-medium">{data.name}</div>
          <div className="text-default-600">{data.producer}</div>
          {type === 'pack' ? (
            <div className="text-default-600">
              Pack: {data.quantity} {data.unit} (@{data.itemsPerPack} {item.unit})
            </div>
          ) : (
            <div className="text-default-600">
              Unit: {data.unit}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon icon="heroicons:qr-code" className="w-5 h-5" />
            Barcode - {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Barcode Type Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Jenis Barcode</Label>
            <RadioGroup
              value={barcodeType}
              onValueChange={(value) => setBarcodeType(value as BarcodeOptions['type'])}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="item" id="item" />
                <Label htmlFor="item" className="cursor-pointer">
                  <div>
                    <span className="font-medium">Barcode per Item</span>
                    <p className="text-sm text-default-500">
                      Barcode untuk unit satuan obat
                    </p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pack" id="pack" />
                <Label htmlFor="pack" className="cursor-pointer">
                  <div>
                    <span className="font-medium">Barcode per Kemasan</span>
                    <p className="text-sm text-default-500">
                      Barcode untuk kemasan besar (dus, box, pack)
                    </p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Barcode Preview */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preview Barcode</Label>
            <BarcodeDisplay data={barcodeData} type={barcodeType} />
          </div>

          {/* Print Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Icon icon="heroicons:information-circle" className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Tips Pencetakan:</p>
                <ul className="text-blue-700 space-y-1 text-xs">
                  <li>• Gunakan printer thermal atau laser untuk hasil terbaik</li>
                  <li>• Pastikan ukuran kertas sesuai dengan kebutuhan</li>
                  <li>• Barcode pack cocok untuk label kemasan besar</li>
                  <li>• Barcode item cocok untuk label produk satuan</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button onClick={handlePrint}>
            <Icon icon="heroicons:printer" className="w-4 h-4 mr-2" />
            Cetak Barcode
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeModal;

// # END OF Barcode Modal Component 