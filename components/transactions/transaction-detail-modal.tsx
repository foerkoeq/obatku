// # START OF Transaction Detail Modal Component - Detailed view modal for transactions
// Purpose: Display comprehensive transaction information in a modal format
// Props: isOpen, onClose, transaction, onApprove, onDistribute, userRole
// Returns: Modal with detailed transaction information and actions
// Dependencies: Dialog, Badge, Button, Transaction Status Indicator

"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import TransactionStatusIndicator from "./transaction-status-indicator";
import { Transaction, UserRole, getRolePermissions } from "@/lib/types/transaction";

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onApprove?: (transaction: Transaction) => void;
  onDistribute?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  userRole: UserRole;
}

const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onApprove,
  onDistribute,
  onEdit,
  userRole,
}) => {
  if (!transaction) return null;

  const permissions = getRolePermissions(userRole);
  const canApprove = permissions.canApprove && ['submitted', 'under_review'].includes(transaction.status);
  const canDistribute = permissions.canDistribute && ['approved', 'ready_distribution'].includes(transaction.status);
  const canEdit = permissions.canEdit && ['draft'].includes(transaction.status);

  // Helper function to generate BAST number
  const getBastNumber = () => {
    return `BAST-${transaction.id.slice(-6).toUpperCase()}`;
  };

  // Helper to get pickup date
  const getPickupDate = () => {
    if (transaction.approval?.pickupSchedule) {
      return format(new Date(transaction.approval.pickupSchedule), "dd/MM/yyyy", { locale: id });
    }
    if (transaction.distribution?.distributedDate) {
      return format(new Date(transaction.distribution.distributedDate), "dd/MM/yyyy", { locale: id });
    }
    return "-";
  };

  // Helper to get distributed by
  const getDistributedBy = () => {
    return transaction.distribution?.distributedBy || "-";
  };

  // Check if status is approved or completed
  const isApprovedOrCompleted = ['approved', 'completed', 'ready_distribution', 'distributing'].includes(transaction.status);

  // Calculate waspada area
  const waspadaArea = transaction.farmingDetails.totalArea - transaction.farmingDetails.affectedArea;

  const DetailItem = ({ label, value }: { 
    label: string; 
    value: React.ReactNode;
  }) => (
    <div className="flex justify-between items-start py-2 border-b border-default-100 last:border-0">
      <span className="text-sm text-default-600 font-medium min-w-[180px]">{label}</span>
      <span className="text-sm text-default-900 text-right flex-1">{value}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-default-900">
            Detail Transaksi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex justify-end">
            <TransactionStatusIndicator 
              status={transaction.status} 
              priority={transaction.priority}
            />
          </div>

          {/* Simple Detail List */}
          <div className="space-y-1">
            <DetailItem 
              label="No BAST" 
              value={<span className="font-semibold">{getBastNumber()}</span>} 
            />
            <DetailItem 
              label="No Surat" 
              value={transaction.letterNumber} 
            />
            <DetailItem 
              label="Pengusul" 
              value={transaction.bppOfficer.name} 
            />
            <DetailItem 
              label="Nama Petugas POPT" 
              value={<span className="text-default-400">-</span>} 
            />
            <DetailItem 
              label="Kecamatan" 
              value={transaction.farmerGroup.subDistrict} 
            />
            <DetailItem 
              label="Nama Kelompok Tani" 
              value={transaction.farmerGroup.name} 
            />
            <DetailItem 
              label="Nama Ketua Kelompok Tani" 
              value={transaction.farmerGroup.leader} 
            />
            <DetailItem 
              label="No HP Ketua Kelompok Tani" 
              value={<span className="text-default-400">-</span>} 
            />
            <DetailItem 
              label="OPT Penyerang" 
              value={
                <div className="flex flex-wrap gap-1">
                  {transaction.farmingDetails.pestType.map((pest, idx) => (
                    <Badge key={idx} className="text-xs bg-secondary text-secondary-foreground">
                      {pest}
                    </Badge>
                  ))}
                </div>
              } 
            />
            <DetailItem 
              label="Luas Lahan Terserang" 
              value={`${transaction.farmingDetails.affectedArea} ha`} 
            />
            <DetailItem 
              label="Luas Lahan Waspada" 
              value={`${waspadaArea} ha`} 
            />
            <DetailItem 
              label="Status Permintaan" 
              value={
                <TransactionStatusIndicator 
                  status={transaction.status} 
                  priority={transaction.priority}
                  showText={true}
                />
              } 
            />
            
            {isApprovedOrCompleted && (
              <>
                <DetailItem 
                  label="Tanggal Pengambilan" 
                  value={getPickupDate()} 
                />
                <DetailItem 
                  label="Diserahkan Oleh" 
                  value={getDistributedBy()} 
                />
                <DetailItem 
                  label="Foto" 
                  value={
                    <div className="flex items-center gap-2">
                      <span className="text-default-400">-</span>
                      {/* Placeholder for photo - can be added later */}
                    </div>
                  } 
                />
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          
          {canEdit && onEdit && (
            <Button onClick={() => onEdit(transaction)}>
              <Icon icon="heroicons:pencil" className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {canApprove && onApprove && (
            <Button onClick={() => onApprove(transaction)} className="bg-green-600 hover:bg-green-700">
              <Icon icon="heroicons:check-circle" className="h-4 w-4 mr-2" />
              Setujui
            </Button>
          )}
          
          {canDistribute && onDistribute && (
            <Button onClick={() => onDistribute(transaction)} className="bg-blue-600 hover:bg-blue-700">
              <Icon icon="heroicons:truck" className="h-4 w-4 mr-2" />
              Distribusi
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailModal;

// # END OF Transaction Detail Modal Component 