import * as React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { QrCode, Edit, Trash2, ArrowLeft, Loader2, Package, Calendar, MapPin } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import StatusIndicator from "@/components/inventory/status-indicator";
import { Badge } from "@/components/ui/badge";
import { DrugInventory } from "@/lib/types/inventory";

interface MedicineDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medicine: DrugInventory | null;
  loading?: boolean;
  deleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  onViewBarcode?: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const MedicineDetailModal: React.FC<MedicineDetailModalProps> = ({
  open,
  onOpenChange,
  medicine,
  loading,
  deleting,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
  onBack,
  onViewBarcode,
}) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Detail Obat"
      description={medicine ? `Informasi lengkap tentang: ${medicine.name}` : undefined}
      className="max-w-2xl"
      footer={
        <div className="flex flex-wrap gap-2 justify-end">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
          <Button
            variant="outline"
            onClick={() => medicine && window.location.assign(`/inventory/${medicine.id}`)}
          >
            <QrCode className="mr-2 h-4 w-4" />
            Lihat Detail
          </Button>
          {canEdit && (
            <Button variant="outline" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Ubah
            </Button>
          )}
          {canDelete && (
            <Button
              variant="outline"
              onClick={onDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {deleting ? 'Menghapus...' : 'Hapus'}
            </Button>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Memuat data obat...</span>
        </div>
      ) : !medicine ? (
        <div className="text-center py-8 text-muted-foreground">Data obat tidak ditemukan.</div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <StatusIndicator status={medicine.status} />
            <div>
              <h3 className="text-lg font-semibold">{medicine.name}</h3>
              <p className="text-sm text-muted-foreground">Barcode: {medicine.barcode}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Produsen</span>
                <div className="text-sm">{medicine.producer}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Kandungan</span>
                <div className="text-sm">{medicine.content}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Kategori</span>
                <div className="text-sm">{medicine.category.name}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Supplier</span>
                <div className="text-sm">{medicine.supplier}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Jenis OPT</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {medicine.targetPest.map((pest, idx) => (
                    <Badge key={idx} className="text-xs bg-secondary text-secondary-foreground">{pest}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Stok Saat Ini</span>
                <div className="text-sm font-semibold">{medicine.stock} {medicine.unit}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Kemasan Besar</span>
                <div className="text-sm">
                  {medicine.largePack.quantity} {medicine.largePack.unit} ({medicine.largePack.itemsPerPack} {medicine.unit}/kemasan)
                </div>
              </div>
              {medicine.pricePerUnit && (
                <div>
                  <span className="text-xs text-muted-foreground">Harga per Unit</span>
                  <div className="text-sm">{formatCurrency(medicine.pricePerUnit)}</div>
                </div>
              )}
              <div>
                <span className="text-xs text-muted-foreground">Lokasi Penyimpanan</span>
                <div className="text-sm flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {medicine.storageLocation}
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" />Tanggal Masuk</span>
              <div className="text-sm">{format(medicine.entryDate, 'dd MMMM yyyy', { locale: id })}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" />Tanggal Expired</span>
              <div className="text-sm">{format(medicine.expiryDate, 'dd MMMM yyyy', { locale: id })}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Terakhir Diperbarui</span>
              <div className="text-sm">{format(medicine.lastUpdated, 'dd MMMM yyyy HH:mm', { locale: id })}</div>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Dibuat oleh</span>
              <div className="text-sm">{medicine.createdBy}</div>
            </div>
          </div>
          {medicine.notes && (
            <div>
              <span className="text-xs text-muted-foreground">Catatan</span>
              <div className="text-sm bg-muted p-3 rounded-md">{medicine.notes}</div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default MedicineDetailModal;
