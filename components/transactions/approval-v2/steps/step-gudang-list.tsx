// # START OF Step Gudang List - Warehouse step 1: Medicine list overview
// Purpose: Display list of poktan with their approved medicines for warehouse preparation
// Features: Grouped by poktan, medicine details with quantities

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ApprovalItem,
  ApprovedMedicineDetail,
} from "@/lib/types/approval";

interface StepGudangListProps {
  item: ApprovalItem;
}

const StepGudangList: React.FC<StepGudangListProps> = ({ item }) => {
  const obatDisetujui = item.obatDisetujui || [];

  // Group by poktan
  const grouped = new Map<string, ApprovedMedicineDetail[]>();
  obatDisetujui.forEach((med) => {
    const list = grouped.get(med.poktanId) || [];
    list.push(med);
    grouped.set(med.poktanId, list);
  });

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 pr-2 pb-4">
        {/* Header banner */}
        <div className="rounded-lg bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30 p-3 border border-purple-100 dark:border-purple-900/40">
          <div className="flex items-center gap-2 text-sm">
            <Icon icon="heroicons:building-storefront" className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-800 dark:text-purple-200">
              Daftar Obat untuk Distribusi
            </span>
          </div>
          <p className="text-[11px] text-purple-600/70 dark:text-purple-400/70 mt-1 ml-7">
            Siapkan obat berikut, lalu lanjut ke langkah scan untuk verifikasi
          </p>
        </div>

        {/* Poktan groups */}
        {Array.from(grouped.entries()).map(([poktanId, medicines]) => {
          const poktan = item.poktanList.find((p) => p.id === poktanId);
          return (
            <div
              key={poktanId}
              className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Poktan header */}
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40">
                    <Icon icon="heroicons:users" className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {poktan?.nama || poktanId}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Icon icon="heroicons:squares-2x2-mini" className="w-3 h-3" />
                        {poktan?.komoditas.join(', ')}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Icon icon="heroicons:bug-ant-mini" className="w-3 h-3" />
                        {poktan?.opt.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Medicine list */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {medicines.map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 shrink-0">
                      <Icon icon="heroicons:beaker" className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {med.nama}
                        </span>
                        {med.isPreferensiBpp && (
                          <Badge className="text-[9px] px-1 py-0 bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 border-0">
                            BPP
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">{med.bahanAktif}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {med.jumlahBesar} {med.satuanBesar}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        ({med.jumlahKecil.toLocaleString()} {med.satuanKecil})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {obatDisetujui.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            <Icon icon="heroicons:inbox" className="w-8 h-8 mx-auto mb-2 opacity-50" />
            Tidak ada obat yang disetujui
          </div>
        )}

        {/* Total summary */}
        {obatDisetujui.length > 0 && (
          <div className="rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800 p-3 bg-purple-50/30 dark:bg-purple-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Total Item
              </span>
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                {obatDisetujui.length} jenis obat
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Untuk Poktan
              </span>
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                {grouped.size} poktan
              </span>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

export default StepGudangList;
