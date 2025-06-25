// # START OF Inventory Detail Modal Component - Detailed view modal for drug inventory
// Purpose: Display comprehensive drug information in a modal format
// Props: isOpen, onClose, item, onEdit, userRole
// Returns: Modal with detailed drug information and actions
// Dependencies: Dialog, Badge, Button, StatusIndicator

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import StatusIndicator from "./status-indicator";
import { DrugInventory, UserRole } from "@/lib/types/inventory";

interface InventoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: DrugInventory | null;
  onEdit?: (item: DrugInventory) => void;
  onViewBarcode?: (item: DrugInventory) => void;
  userRole: UserRole;
}

const InventoryDetailModal: React.FC<InventoryDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onEdit,
  onViewBarcode,
  userRole,
}) => {
  if (!item) return null;

  const canEdit = userRole !== 'ppl';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-default-900 flex items-center gap-2">
        {title}
      </h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  const DetailItem = ({ label, value, className }: { 
    label: string; 
    value: React.ReactNode; 
    className?: string 
  }) => (
    <div className={`flex justify-between items-center py-1 ${className}`}>
      <span className="text-sm text-default-600">{label}</span>
      <span className="text-sm font-medium text-default-900">{value}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon icon="heroicons:information-circle" className="w-6 h-6 text-primary" />
              <span>Detail Stok Obat</span>
            </div>
            <StatusIndicator status={item.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <DetailSection title="Informasi Dasar">
            <DetailItem label="Nama Obat" value={item.name} />
            <DetailItem label="Produsen" value={item.producer} />
            <DetailItem label="Kandungan" value={item.content} />
            <DetailItem label="Kategori" value={item.category.name} />
            <DetailItem label="Supplier" value={item.supplier} />
          </DetailSection>

          <Separator />

          {/* Stock Information */}
          <DetailSection title="Informasi Stok">
            <DetailItem 
              label="Stok Saat Ini" 
              value={
                <span className={`font-bold ${
                  item.status === 'low' ? 'text-warning' : 
                  item.status === 'expired' ? 'text-destructive' : 'text-success'
                }`}>
                  {item.stock} {item.unit}
                </span>
              } 
            />
            <DetailItem 
              label="Kemasan Besar" 
              value={`${item.largePack.quantity} ${item.largePack.unit} (@${item.largePack.itemsPerPack} ${item.unit})`} 
            />
            <DetailItem label="Lokasi Penyimpanan" value={item.storageLocation} />
            {item.barcode && (
              <DetailItem 
                label="Barcode" 
                value={
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-default-100 rounded text-xs">
                      {item.barcode}
                    </code>
                    {onViewBarcode && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewBarcode(item)}
                        className="h-6 px-2 text-xs"
                      >
                        <Icon icon="heroicons:qr-code" className="w-3 h-3 mr-1" />
                        Lihat
                      </Button>
                    )}
                  </div>
                } 
              />
            )}
          </DetailSection>

          <Separator />

          {/* Date Information */}
          <DetailSection title="Informasi Tanggal">
            <DetailItem 
              label="Tanggal Masuk" 
              value={format(new Date(item.entryDate), "dd MMMM yyyy", { locale: id })} 
            />
            <DetailItem 
              label="Tanggal Kadaluarsa" 
              value={
                <span className={
                  item.status === 'expired' || item.status === 'near_expiry' 
                    ? 'text-destructive font-medium' 
                    : ''
                }>
                  {format(new Date(item.expiryDate), "dd MMMM yyyy", { locale: id })}
                </span>
              } 
            />
          </DetailSection>

          <Separator />

          {/* Additional Information */}
          <DetailSection title="Informasi Tambahan">
            <DetailItem 
              label="Jenis OPT" 
              value={
                <div className="flex flex-wrap gap-1">
                  {item.targetPest.map((pest, index) => (
                    <Badge key={index} className="text-xs border border-default-200">
                      {pest}
                    </Badge>
                  ))}
                </div>
              } 
            />
            {item.pricePerUnit && (
              <DetailItem 
                label="Harga per Unit" 
                value={formatCurrency(item.pricePerUnit)} 
              />
            )}
            {item.notes && (
              <div className="pt-2">
                <span className="text-sm text-default-600">Catatan:</span>
                <p className="text-sm text-default-900 mt-1 p-3 bg-default-50 rounded-md">
                  {item.notes}
                </p>
              </div>
            )}
          </DetailSection>

          <Separator />

          {/* Activity Log */}
          <DetailSection title="Log Aktivitas">
            <DetailItem 
              label="Dibuat oleh" 
              value={item.createdBy} 
            />
            <DetailItem 
              label="Terakhir diperbarui" 
              value={format(new Date(item.lastUpdated), "dd/MM/yyyy HH:mm", { locale: id })} 
            />
            {item.updatedBy && (
              <DetailItem 
                label="Diperbarui oleh" 
                value={item.updatedBy} 
              />
            )}
          </DetailSection>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          
          {onViewBarcode && (
            <Button
              variant="outline"
              onClick={() => onViewBarcode(item)}
            >
              <Icon icon="heroicons:qr-code" className="w-4 h-4 mr-2" />
              Lihat Barcode
            </Button>
          )}

          {canEdit && onEdit && (
            <Button onClick={() => onEdit(item)}>
              <Icon icon="heroicons:pencil" className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDetailModal;

// # END OF Inventory Detail Modal Component 