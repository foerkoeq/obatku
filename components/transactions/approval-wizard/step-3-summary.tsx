"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { Transaction } from "@/lib/types/transaction";
import { ApprovalWizardSchema } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Step3SummaryProps {
  form: UseFormReturn<ApprovalWizardSchema>;
  transaction: Transaction;
}

export const Step3Summary = ({ form, transaction }: Step3SummaryProps) => {
  const { control } = form;
  const approvedDrugs = useWatch({
    control,
    name: "approvedDrugs",
  });

  return (
    <ScrollArea className="h-full pr-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left side: Summary */}
        <div className="space-y-4">
            <h4 className="text-lg font-semibold">Ringkasan Persetujuan</h4>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Obat yang Disetujui</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {approvedDrugs.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <span>{item.drug.name}</span>
                            <span className="font-bold">{item.quantity} Unit</span>
                        </div>
                    ))}
                    {approvedDrugs.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Belum ada obat yang dipilih.</p>
                    )}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-base">Informasi Pemohon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Kelompok Tani:</span> <strong>{transaction.farmerGroup.name}</strong></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Petugas PPL:</span> <strong>{transaction.bppOfficer.name}</strong></div>
                </CardContent>
            </Card>
        </div>

        {/* Right side: Notes and Date */}
        <div className="space-y-4">
             <h4 className="text-lg font-semibold">Catatan & Penjadwalan</h4>
            <FormField
                control={control}
                name="pickupDate"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tanggal Pengambilan Obat</FormLabel>
                    <FormControl>
                    <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
              control={control}
              name="noteToSubmitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan untuk PPL (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Pengambilan obat sesuai jadwal, bawa surat tugas."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="noteToWarehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan untuk Gudang (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Contoh: Siapkan obat 1 jam sebelum jadwal pengambilan."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
        </div>
      </div>
    </ScrollArea>
  );
}; 