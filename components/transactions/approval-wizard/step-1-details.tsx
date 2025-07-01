"use client";

import { useState } from "react";
import { Transaction } from "@/lib/types/transaction";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { PreviewLetterModal } from "./preview-letter-modal";

interface InfoSectionProps {
  title: string;
  children: React.ReactNode;
}
const InfoSection = ({ title, children }: InfoSectionProps) => (
  <div className="space-y-3">
    <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">
      {title}
    </h4>
    <div className="space-y-2 text-sm">{children}</div>
  </div>
);

interface InfoItemProps {
    label: string;
    value: React.ReactNode;
}
const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex justify-between items-start">
    <span className="text-gray-500 dark:text-gray-400">{label}</span>
    <div className="text-right font-medium text-gray-700 dark:text-gray-300 max-w-[70%]">
        {value}
    </div>
  </div>
);

interface Step1DetailsProps {
  transaction: Transaction;
}

export const Step1Details = ({ transaction }: Step1DetailsProps) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  return (
    <>
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6">
        <InfoSection title="Detail Pemohon">
          <InfoItem
            label="Kelompok Tani"
            value={transaction.farmerGroup.name}
          />
          <InfoItem label="Ketua" value={transaction.farmerGroup.leader} />
          <InfoItem
            label="Wilayah"
            value={`${transaction.farmerGroup.village}, ${transaction.farmerGroup.subDistrict}, ${transaction.farmerGroup.district}`}
          />
          <InfoItem label="Petugas PPL" value={transaction.bppOfficer.name} />
        </InfoSection>

        <InfoSection title="Detail Pertanian">
          <InfoItem
            label="Komoditas"
            value={transaction.farmingDetails.commodity}
          />
          <InfoItem
            label="Luas Terdampak"
            value={`${transaction.farmingDetails.affectedArea} Ha`}
          />
          <InfoItem
            label="Total Lahan"
            value={`${transaction.farmingDetails.totalArea} Ha`}
          />
          <InfoItem
            label="Jenis OPT"
            value={
              <div className="flex flex-wrap gap-1 justify-end">
                {transaction.farmingDetails.pestType.map((p) => (
                  <Badge key={p} color="secondary">
                    {p}
                  </Badge>
                ))}
              </div>
            }
          />
        </InfoSection>

        <InfoSection title="Detail Pengajuan">
            <InfoItem 
                label="Nomor Surat"
                value={transaction.letterNumber}
            />
            <InfoItem 
                label="Obat yang Diajukan"
                value={
                     <div className="flex flex-col gap-2 items-end">
                        {transaction.submission.requestedDrugs?.map(drug => (
                            <div key={drug.drugId} className="text-right">
                                {drug.drugName} (Qty: <span className="font-bold">{drug.requestedQuantity} {drug.unit}</span>)
                            </div>
                        ))}
                    </div>
                }
            />
             <Button
                type="button"
                variant="outline"
                className="w-full mt-2"
                onClick={() => setIsPreviewOpen(true)}
                >
                <Icon icon="lucide:file-text" className="w-4 h-4 mr-2" />
                Lihat Surat Pengajuan
            </Button>
        </InfoSection>
      </div>
    </ScrollArea>
    <PreviewLetterModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        letterUrl={transaction.submission.letter.url}
    />
    </>
  );
}; 