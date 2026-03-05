// # START OF TrxProcessModal - Multi-step process modal for Dinas approval
// Purpose: 3-step wizard: (1) Info request, (2) Select medicines, (3) Summary & approve
// Features: Medicine recommendations, plus/minus quantity, responsive, mobile-first
// Props: open, onClose, item
// Dependencies: Dialog, Button, Badge, Icon, medicine stock data

"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import TrxStatusBadge from "./trx-status-badge";
import {
  TrxListItem,
  MedicineStockItem,
  SelectedMedicine,
  JENIS_PESTISIDA_LABELS,
} from "@/lib/types/transaction-list";
import {
  mockMedicineStock,
  getRecommendedMedicines,
} from "@/lib/data/transaction-list-mock";

interface TrxProcessModalProps {
  open: boolean;
  onClose: () => void;
  item: TrxListItem | null;
  onApproved?: (item: TrxListItem, medicines: SelectedMedicine[]) => void;
}

// ========== Step Indicator ==========

const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = [
    { num: 1, label: "Info Permintaan" },
    { num: 2, label: "Pilih Obat" },
    { num: 3, label: "Ringkasan" },
  ];

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-3">
      {steps.map((step, idx) => (
        <React.Fragment key={step.num}>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                currentStep === step.num
                  ? "bg-primary text-primary-foreground"
                  : currentStep > step.num
                  ? "bg-green-500 text-white"
                  : "bg-default-200 text-default-500"
              )}
            >
              {currentStep > step.num ? (
                <Icon icon="heroicons:check" className="h-4 w-4" />
              ) : (
                step.num
              )}
            </div>
            <span
              className={cn(
                "text-xs font-medium hidden sm:block",
                currentStep === step.num
                  ? "text-primary"
                  : currentStep > step.num
                  ? "text-green-600"
                  : "text-default-400"
              )}
            >
              {step.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                "w-8 sm:w-12 h-0.5 rounded",
                currentStep > step.num ? "bg-green-400" : "bg-default-200"
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ========== Plus/Minus Counter ==========

const QuantityControl: React.FC<{
  value: number;
  max: number;
  label: string;
  onChange: (val: number) => void;
}> = ({ value, max, label, onChange }) => (
  <div className="flex flex-col items-center gap-1">
    <span className="text-[11px] text-default-500 font-medium">{label}</span>
    <div className="flex items-center gap-0">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-r-none border-r-0"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
      >
        <Icon icon="heroicons:minus" className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const val = parseInt(e.target.value) || 0;
          onChange(Math.max(0, Math.min(max, val)));
        }}
        className="h-8 w-14 rounded-none text-center text-sm border-x-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-l-none border-l-0"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
      >
        <Icon icon="heroicons:plus" className="h-3 w-3" />
      </Button>
    </div>
    <span className="text-[10px] text-default-400">maks: {max}</span>
  </div>
);

// ========== Medicine Card (Step 2) ==========

const MedicineCard: React.FC<{
  med: MedicineStockItem;
  isSelected: boolean;
  isRecommended: boolean;
  selectedData?: SelectedMedicine;
  onToggle: () => void;
  onUpdateQty: (field: "jumlahBesar" | "jumlahKecil", val: number) => void;
}> = ({ med, isSelected, isRecommended, selectedData, onToggle, onUpdateQty }) => {
  const jenisLabel =
    med.jenis === "kimia"
      ? "Kimia"
      : med.jenis === "nabati"
      ? "Nabati"
      : "Agen Hayati";

  const jenisColor =
    med.jenis === "kimia"
      ? "bg-red-50 text-red-700 border-red-200"
      : med.jenis === "nabati"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-purple-50 text-purple-700 border-purple-200";

  return (
    <div
      className={cn(
        "border rounded-xl p-3 sm:p-4 transition-all",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "border-default-200 hover:border-default-300"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-default-900">{med.nama}</span>
            {isRecommended && (
              <Badge className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border border-amber-200">
                <Icon icon="heroicons:star" className="h-2.5 w-2.5 mr-0.5" />
                Rekomendasi
              </Badge>
            )}
          </div>
          <p className="text-xs text-default-500 mt-0.5">{med.bahanAktif}</p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Badge className={cn("text-[10px] px-1.5 py-0 border", jenisColor)}>
              {jenisLabel}
            </Badge>
            <span className="text-[10px] text-default-400">
              Stok: {med.stokBesar} {med.satuanBesar}
            </span>
          </div>
          {/* Target OPT */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {med.targetOpt.slice(0, 3).map((opt) => (
              <span key={opt} className="text-[10px] text-default-400 bg-default-50 px-1.5 py-0.5 rounded">
                {opt}
              </span>
            ))}
            {med.targetOpt.length > 3 && (
              <span className="text-[10px] text-default-400">+{med.targetOpt.length - 3}</span>
            )}
          </div>
        </div>

        {/* Toggle Button */}
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          className={cn("h-8 text-xs gap-1 flex-shrink-0", isSelected && "bg-primary")}
          onClick={onToggle}
        >
          {isSelected ? (
            <>
              <Icon icon="heroicons:check" className="h-3.5 w-3.5" />
              Dipilih
            </>
          ) : (
            <>
              <Icon icon="heroicons:plus" className="h-3.5 w-3.5" />
              Pilih
            </>
          )}
        </Button>
      </div>

      {/* Quantity Controls (shown when selected) */}
      {isSelected && selectedData && (
        <div className="mt-3 pt-3 border-t border-dashed border-primary/20">
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            <QuantityControl
              value={selectedData.jumlahBesar}
              max={selectedData.maxBesar}
              label={med.satuanBesar}
              onChange={(val) => onUpdateQty("jumlahBesar", val)}
            />
            <QuantityControl
              value={selectedData.jumlahKecil}
              max={selectedData.maxKecil}
              label={med.satuanKecil}
              onChange={(val) => onUpdateQty("jumlahKecil", val)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// ========== Step 1: Info Request ==========

const Step1Info: React.FC<{ item: TrxListItem }> = ({ item }) => {
  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-0 py-2 border-b border-default-100 last:border-0">
      <span className="text-xs text-default-500 font-medium sm:min-w-[160px] flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-default-900 flex-1">{value}</span>
    </div>
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 mb-3">
        <Icon icon="heroicons:information-circle" className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-default-900">Informasi Permintaan BPP</h3>
      </div>

      <InfoRow label="Diajukan oleh" value={item.diajukanOleh.nama} />
      <InfoRow label="POPT" value={item.namaPopt || "-"} />
      <InfoRow label="Poktan" value={item.poktan.nama} />
      <InfoRow label="Ketua" value={item.poktan.ketua} />
      <InfoRow label="Desa / Kecamatan" value={`${item.poktan.desa}, ${item.poktan.kecamatan}`} />
      <InfoRow
        label="Luas Terserang"
        value={<span className="font-semibold text-red-600">{item.luasTerserang} ha</span>}
      />
      <InfoRow
        label="Luas Waspada"
        value={<span className="font-semibold text-amber-600">{item.luasWaspada} ha</span>}
      />
      <InfoRow
        label="OPT"
        value={
          <div className="flex flex-wrap gap-1">
            {item.opt.map((o) => (
              <Badge key={o} className="text-xs bg-orange-50 text-orange-700 border border-orange-200">
                {o}
              </Badge>
            ))}
          </div>
        }
      />
      <InfoRow
        label="Jenis Pestisida"
        value={
          <div className="flex flex-wrap gap-1">
            {item.jenisPestisida.map((jp) => (
              <Badge key={jp} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200">
                {JENIS_PESTISIDA_LABELS[jp]}
              </Badge>
            ))}
          </div>
        }
      />
      <InfoRow label="Kandungan Dikehendaki" value={item.kandunganDikehendaki || "-"} />
      <InfoRow
        label="Permintaan Obat"
        value={
          item.permintaanObat.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {item.permintaanObat.map((o) => (
                <Badge key={o} className="text-xs bg-blue-50 text-blue-700 border border-blue-200">
                  {o}
                </Badge>
              ))}
            </div>
          ) : (
            "-"
          )
        }
      />
      {item.catatan && <InfoRow label="Catatan" value={<span className="italic">{item.catatan}</span>} />}
    </div>
  );
};

// ========== Step 3: Summary ==========

const Step3Summary: React.FC<{
  item: TrxListItem;
  medicines: SelectedMedicine[];
}> = ({ item, medicines }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-2">
      <Icon icon="heroicons:clipboard-document-check" className="h-5 w-5 text-green-500" />
      <h3 className="font-semibold text-default-900">Ringkasan Persetujuan</h3>
    </div>

    {/* Transaction Info */}
    <div className="bg-default-50 rounded-lg p-3 space-y-1 text-sm">
      <div className="flex justify-between">
        <span className="text-default-500">Poktan</span>
        <span className="font-medium text-default-900">{item.poktan.nama}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-default-500">Kecamatan</span>
        <span className="text-default-800">{item.poktan.kecamatan}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-default-500">OPT</span>
        <span className="text-default-800">{item.opt.join(", ")}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-default-500">Luas Terserang</span>
        <span className="font-medium text-red-600">{item.luasTerserang} ha</span>
      </div>
    </div>

    {/* Medicine List */}
    <div>
      <h4 className="text-sm font-semibold text-default-800 mb-2">
        Obat yang Disetujui ({medicines.length} jenis)
      </h4>
      <div className="space-y-2">
        {medicines.map((med) => (
          <div
            key={med.id}
            className="border rounded-lg p-3 bg-green-50/50 border-green-200"
          >
            <p className="font-medium text-sm text-default-900">{med.nama}</p>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs">
              {med.jumlahBesar > 0 && (
                <span className="text-default-700">
                  <span className="font-semibold text-green-700">{med.jumlahBesar}</span>{" "}
                  {med.satuanBesar}
                </span>
              )}
              {med.jumlahKecil > 0 && (
                <span className="text-default-700">
                  <span className="font-semibold text-green-700">{med.jumlahKecil}</span>{" "}
                  {med.satuanKecil}
                </span>
              )}
              {med.jumlahBesar === 0 && med.jumlahKecil === 0 && (
                <span className="text-red-500 italic">Jumlah belum diisi</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ========== Main Component ==========

const TrxProcessModal: React.FC<TrxProcessModalProps> = ({
  open,
  onClose,
  item,
  onApproved,
}) => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<Map<string, SelectedMedicine>>(new Map());
  const [searchMed, setSearchMed] = useState("");

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelected(new Map());
      setSearchMed("");
    }
  }, [open]);

  // Get recommended medicines
  const recommended = useMemo(() => {
    if (!item) return new Set<string>();
    const recs = getRecommendedMedicines(item.opt, item.permintaanObat);
    return new Set(recs.map((r) => r.id));
  }, [item]);

  // Sorted medicine list (recommended first)
  const sortedMedicines = useMemo(() => {
    let meds = [...mockMedicineStock];

    // Filter by search
    if (searchMed.trim()) {
      const q = searchMed.toLowerCase();
      meds = meds.filter(
        (m) =>
          m.nama.toLowerCase().includes(q) ||
          m.bahanAktif.toLowerCase().includes(q) ||
          m.targetOpt.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort: recommended first, then by name
    meds.sort((a, b) => {
      const aRec = recommended.has(a.id) ? 0 : 1;
      const bRec = recommended.has(b.id) ? 0 : 1;
      if (aRec !== bRec) return aRec - bRec;
      return a.nama.localeCompare(b.nama);
    });

    return meds;
  }, [recommended, searchMed]);

  const toggleMedicine = useCallback(
    (med: MedicineStockItem) => {
      setSelected((prev) => {
        const next = new Map(prev);
        if (next.has(med.id)) {
          next.delete(med.id);
        } else {
          next.set(med.id, {
            id: med.id,
            nama: med.nama,
            jumlahBesar: 0,
            satuanBesar: med.satuanBesar,
            jumlahKecil: 0,
            satuanKecil: med.satuanKecil,
            maxBesar: med.stokBesar,
            maxKecil: med.stokKecil,
          });
        }
        return next;
      });
    },
    []
  );

  const updateQty = useCallback(
    (medId: string, field: "jumlahBesar" | "jumlahKecil", val: number) => {
      setSelected((prev) => {
        const next = new Map(prev);
        const existing = next.get(medId);
        if (existing) {
          next.set(medId, { ...existing, [field]: val });
        }
        return next;
      });
    },
    []
  );

  const selectedList = useMemo(() => Array.from(selected.values()), [selected]);
  const hasValidSelection = selectedList.length > 0 && selectedList.some((m) => m.jumlahBesar > 0 || m.jumlahKecil > 0);

  const handleApprove = () => {
    if (!item) return;
    onApproved?.(item, selectedList);
    toast.success("Transaksi berhasil disetujui!", {
      description: `${selectedList.length} jenis obat dialokasikan untuk ${item.poktan.nama}`,
    });
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-2 border-b flex-shrink-0">
          <DialogTitle className="text-lg font-bold text-default-900">
            Proses Transaksi
          </DialogTitle>
          <StepIndicator currentStep={step} />
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 1 && <Step1Info item={item} />}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon icon="heroicons:beaker" className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-default-900">Pilih Obat dari Stok</h3>
              </div>
              <p className="text-xs text-default-500">
                Obat dengan label <span className="text-amber-700 font-medium">Rekomendasi</span> sesuai
                dengan OPT dan permintaan BPP. Anda bisa memilih lebih dari satu jenis obat.
              </p>

              {/* Search medicines */}
              <div className="relative">
                <Icon
                  icon="heroicons:magnifying-glass"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-default-400"
                />
                <Input
                  placeholder="Cari obat, bahan aktif, atau OPT..."
                  value={searchMed}
                  onChange={(e) => setSearchMed(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>

              {/* Selected count */}
              {selected.size > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    {selected.size} obat dipilih
                  </Badge>
                </div>
              )}

              {/* Medicine list */}
              <div className="space-y-2">
                {sortedMedicines.map((med) => (
                  <MedicineCard
                    key={med.id}
                    med={med}
                    isSelected={selected.has(med.id)}
                    isRecommended={recommended.has(med.id)}
                    selectedData={selected.get(med.id)}
                    onToggle={() => toggleMedicine(med)}
                    onUpdateQty={(field, val) => updateQty(med.id, field, val)}
                  />
                ))}

                {sortedMedicines.length === 0 && (
                  <div className="text-center text-default-400 py-8 text-sm">
                    Tidak ada obat yang cocok dengan pencarian
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && <Step3Summary item={item} medicines={selectedList} />}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t px-5 py-4 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="gap-2 w-full sm:w-auto">
                <Icon icon="heroicons:arrow-left" className="h-4 w-4" />
                Kembali
              </Button>
            )}
          </div>
          <div className="flex gap-2 flex-col sm:flex-row">
            <Button variant="ghost" onClick={onClose} className="sm:order-1">
              Batal
            </Button>

            {step < 3 && (
              <Button
                onClick={() => setStep((s) => s + 1)}
                className="sm:order-2 gap-2"
                disabled={step === 2 && selected.size === 0}
              >
                Selanjutnya
                <Icon icon="heroicons:arrow-right" className="h-4 w-4" />
              </Button>
            )}

            {step === 3 && (
              <Button
                onClick={handleApprove}
                className="sm:order-2 gap-2 bg-green-600 hover:bg-green-700 text-white"
                disabled={!hasValidSelection}
              >
                <Icon icon="heroicons:check-circle" className="h-4 w-4" />
                Setujui
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrxProcessModal;

// # END OF TrxProcessModal
