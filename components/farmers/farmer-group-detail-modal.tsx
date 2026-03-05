"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { FarmerGroup } from "@/lib/data/farmer-groups-mock";
import { Pencil, Trash2 } from "lucide-react";

interface FarmerGroupDetailModalProps {
  open: boolean;
  data: FarmerGroup | null;
  onClose: () => void;
  onEdit: (item: FarmerGroup) => void;
  onDelete: (item: FarmerGroup) => void;
}

const ContactInfo = ({
  label,
  nama,
  nik,
  noHp,
}: {
  label: string;
  nama: string;
  nik: string;
  noHp: string;
}) => {
  return (
    <div className="rounded-lg border border-default-200 p-3 sm:p-4 space-y-2">
      <p className="text-xs sm:text-sm font-semibold text-default-900">{label}</p>
      <div className="space-y-1 text-xs sm:text-sm text-default-700">
        <p>
          <span className="text-default-500">Nama:</span> {nama}
        </p>
        <p>
          <span className="text-default-500">NIK:</span> {nik}
        </p>
        <p>
          <span className="text-default-500">No. HP:</span> {noHp}
        </p>
      </div>
    </div>
  );
};

export function FarmerGroupDetailModal({
  open,
  data,
  onClose,
  onEdit,
  onDelete,
}: FarmerGroupDetailModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent size="md" className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detail Kelompok Tani
            <Badge color={data.jenis === "Gapoktan" ? "info" : "success"}>{data.jenis}</Badge>
          </DialogTitle>
          <DialogDescription>
            {data.desa}, {data.kecamatan}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {data.jenis === "Gapoktan" && data.namaGapoktan ? (
            <div>
              <p className="text-xs text-default-500">Nama Gapoktan</p>
              <h3 className="text-base sm:text-lg font-semibold text-default-900">{data.namaGapoktan}</h3>
            </div>
          ) : (
            <div>
              <p className="text-xs text-default-500">Nama Poktan</p>
              <h3 className="text-base sm:text-lg font-semibold text-default-900">
                {data.poktan[0]?.namaPoktan ?? data.namaKelompokTani}
              </h3>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs text-default-500">Nama Poktan</p>
            {data.jenis === "Gapoktan" ? (
              <ul className="list-disc list-inside space-y-1 text-sm text-default-800">
                {data.poktan.map((poktan) => (
                  <li key={poktan.namaPoktan}>{poktan.namaPoktan}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-default-800 font-medium">{data.poktan[0]?.namaPoktan}</p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {data.jenis === "Gapoktan" && data.ketuaGapoktan ? (
              <ContactInfo
                label="Nama Ketua Gapoktan"
                nama={data.ketuaGapoktan.nama}
                nik={data.ketuaGapoktan.nik}
                noHp={data.ketuaGapoktan.noHp}
              />
            ) : null}

            {data.jenis === "Poktan" ? (
              <ContactInfo
                label="Nama Ketua Poktan"
                nama={data.poktan[0]?.ketua.nama ?? "-"}
                nik={data.poktan[0]?.ketua.nik ?? "-"}
                noHp={data.poktan[0]?.ketua.noHp ?? "-"}
              />
            ) : (
              <div className="rounded-lg border border-default-200 p-3 sm:p-4 space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-default-900">Nama Ketua Poktan</p>
                <ul className="space-y-2 text-xs sm:text-sm text-default-700">
                  {data.poktan.map((item) => (
                    <li key={item.namaPoktan} className="rounded-md bg-default-50 p-2.5 space-y-1">
                      <p className="font-medium text-default-900">{item.namaPoktan}</p>
                      <p>
                        <span className="text-default-500">Nama:</span> {item.ketua.nama}
                      </p>
                      <p>
                        <span className="text-default-500">NIK:</span> {item.ketua.nik}
                      </p>
                      <p>
                        <span className="text-default-500">No. HP:</span> {item.ketua.noHp}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" className="gap-2" onClick={() => onEdit(data)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button color="destructive" className="gap-2" onClick={() => onDelete(data)}>
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
