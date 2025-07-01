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

  const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-default-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  );

  const DetailItem = ({ label, value, className }: { 
    label: string; 
    value: React.ReactNode; 
    className?: string 
  }) => (
    <div className={`flex justify-between items-start py-1 ${className}`}>
      <span className="text-sm text-default-600 min-w-[120px]">{label}</span>
      <span className="text-sm font-medium text-default-900 text-right flex-1">{value}</span>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-default-900">
            Detail Transaksi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Information */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-default-900">
                {transaction.letterNumber}
              </h3>
              <p className="text-sm text-default-600">
                Tanggal Pengajuan: {format(new Date(transaction.submissionDate), "dd MMMM yyyy", { locale: id })}
              </p>
            </div>
            <TransactionStatusIndicator 
              status={transaction.status} 
              priority={transaction.priority}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <DetailSection title="Informasi Dasar">
              <DetailItem label="ID Transaksi" value={transaction.id} />
              <DetailItem label="No. Surat" value={transaction.letterNumber} />
              <DetailItem 
                label="Tanggal Pengajuan" 
                value={format(new Date(transaction.submissionDate), "dd/MM/yyyy HH:mm", { locale: id })} 
              />
              <DetailItem label="Prioritas" value={
                <Badge className="text-xs border border-default-300 bg-default-50 text-default-700">
                  {transaction.priority}
                </Badge>
              } />
              <DetailItem label="Dibuat Oleh" value={transaction.createdBy} />
              {transaction.updatedBy && (
                <DetailItem label="Diperbarui Oleh" value={transaction.updatedBy} />
              )}
            </DetailSection>

            {/* BPP Officer Information */}
            <DetailSection title="Petugas BPP">
              <DetailItem label="Nama" value={transaction.bppOfficer.name} />
              <DetailItem label="NIP" value={transaction.bppOfficer.nip} />
              <DetailItem label="Jabatan" value={transaction.bppOfficer.position} />
            </DetailSection>

            {/* Farmer Group Information */}
            <DetailSection title="Kelompok Tani">
              <DetailItem label="Nama Kelompok" value={transaction.farmerGroup.name} />
              <DetailItem label="Ketua Kelompok" value={transaction.farmerGroup.leader} />
              <DetailItem label="Kabupaten" value={transaction.farmerGroup.district} />
              <DetailItem label="Kecamatan" value={transaction.farmerGroup.subDistrict} />
              <DetailItem label="Desa" value={transaction.farmerGroup.village} />
            </DetailSection>

            {/* Farming Details */}
            <DetailSection title="Detail Pertanian">
              <DetailItem label="Komoditas" value={transaction.farmingDetails.commodity} />
              <DetailItem 
                label="Luas Terserang" 
                value={`${transaction.farmingDetails.affectedArea} ha`} 
              />
              <DetailItem 
                label="Total Luas" 
                value={`${transaction.farmingDetails.totalArea} ha`} 
              />
              <DetailItem 
                label="Jenis OPT" 
                value={
                  <div className="space-y-1">
                    {transaction.farmingDetails.pestType.map((pest, idx) => (
                      <Badge key={idx} className="text-xs mr-1 bg-secondary text-secondary-foreground">
                        {pest}
                      </Badge>
                    ))}
                  </div>
                } 
              />
              <DetailItem 
                label="Deskripsi OPT" 
                value={
                  <div className="text-sm text-default-700 max-w-xs">
                    {transaction.farmingDetails.pestDescription}
                  </div>
                } 
              />
            </DetailSection>
          </div>

          {/* Submission Details */}
          <DetailSection title="Detail Pengajuan">
            <DetailItem 
              label="File Surat" 
              value={
                <div className="flex items-center gap-2">
                  <span className="text-sm">{transaction.submission.letter.filename}</span>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                    <Icon icon="heroicons:eye" className="w-3 h-3 mr-1" />
                    Lihat
                  </Button>
                </div>
              } 
            />
            <DetailItem 
              label="Tanggal Upload" 
              value={format(new Date(transaction.submission.letter.uploadDate), "dd/MM/yyyy HH:mm", { locale: id })} 
            />
            
            {transaction.submission.requestedDrugs && transaction.submission.requestedDrugs.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-default-600">Obat yang Diminta:</span>
                <div className="space-y-2">
                  {transaction.submission.requestedDrugs.map((drug, idx) => (
                    <div key={idx} className="bg-default-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-sm">{drug.drugName}</div>
                          <div className="text-xs text-default-600">{drug.purpose}</div>
                        </div>
                        <div className="text-sm font-medium">
                          {drug.requestedQuantity} {drug.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {transaction.submission.notes && (
              <DetailItem 
                label="Catatan" 
                value={
                  <div className="text-sm text-default-700 max-w-xs">
                    {transaction.submission.notes}
                  </div>
                } 
              />
            )}
          </DetailSection>

          {/* Approval Details */}
          {transaction.approval && (
            <DetailSection title="Detail Persetujuan">
              <DetailItem label="Disetujui Oleh" value={transaction.approval.approvedBy} />
              <DetailItem 
                label="Tanggal Persetujuan" 
                value={format(new Date(transaction.approval.approvedDate), "dd/MM/yyyy HH:mm", { locale: id })} 
              />
              <DetailItem 
                label="Status Persetujuan" 
                value={
                  <Badge 
                    className={`text-xs ${
                      transaction.approval.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      transaction.approval.status === 'partially_approved' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {transaction.approval.status === 'approved' ? 'Disetujui' :
                     transaction.approval.status === 'partially_approved' ? 'Sebagian Disetujui' : 'Ditolak'}
                  </Badge>
                } 
              />
              
              {transaction.approval.approvedDrugs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-default-600">Obat yang Disetujui:</span>
                  <div className="space-y-2">
                    {transaction.approval.approvedDrugs.map((drug, idx) => (
                      <div key={idx} className="bg-green-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm">{drug.drugName}</div>
                            {drug.condition && (
                              <div className="text-xs text-default-600">{drug.condition}</div>
                            )}
                          </div>
                          <div className="text-sm font-medium text-green-700">
                            {drug.approvedQuantity} {drug.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {transaction.approval.noteToSubmitter && (
                <DetailItem 
                  label="Catatan untuk Pengaju" 
                  value={
                    <div className="text-sm text-default-700 max-w-xs">
                      {transaction.approval.noteToSubmitter}
                    </div>
                  } 
                />
              )}
              
              {transaction.approval.noteToWarehouse && (
                <DetailItem 
                  label="Catatan untuk Gudang" 
                  value={
                    <div className="text-sm text-default-700 max-w-xs">
                      {transaction.approval.noteToWarehouse}
                    </div>
                  } 
                />
              )}
            </DetailSection>
          )}

          {/* Distribution Details */}
          {transaction.distribution && (
            <DetailSection title="Detail Distribusi">
              <DetailItem label="Didistribusi Oleh" value={transaction.distribution.distributedBy} />
              <DetailItem 
                label="Tanggal Distribusi" 
                value={format(new Date(transaction.distribution.distributedDate), "dd/MM/yyyy HH:mm", { locale: id })} 
              />
              <DetailItem label="Diterima Oleh" value={transaction.distribution.receivedBy} />
              <DetailItem 
                label="Status Distribusi" 
                value={
                  <Badge className="text-xs bg-blue-100 text-blue-700">
                    {transaction.distribution.status}
                  </Badge>
                } 
              />
              
              {transaction.distribution.actualDrugs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-default-600">Obat yang Didistribusi:</span>
                  <div className="space-y-2">
                    {transaction.distribution.actualDrugs.map((drug, idx) => (
                      <div key={idx} className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-sm">{drug.drugName}</div>
                            <div className="text-xs text-default-600">
                              Batch: {drug.batchNumber} | 
                              Exp: {format(new Date(drug.expiryDate), "dd/MM/yyyy", { locale: id })}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-blue-700">
                            {drug.distributedQuantity} {drug.unit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {transaction.distribution.notes && (
                <DetailItem 
                  label="Catatan Distribusi" 
                  value={
                    <div className="text-sm text-default-700 max-w-xs">
                      {transaction.distribution.notes}
                    </div>
                  } 
                />
              )}
            </DetailSection>
          )}
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