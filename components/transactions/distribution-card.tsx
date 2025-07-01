"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Transaction, UserRole } from "@/lib/types/transaction";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Truck } from "lucide-react";

const distributionSchema = z.object({
  distributedDrugs: z.array(z.object({
    drugId: z.string(),
    drugName: z.string(),
    distributedQuantity: z.number(),
    batchNumber: z.string().min(1, "Batch no. wajib diisi."),
    expiryDate: z.date({ required_error: "Tgl. kadaluarsa wajib diisi." }),
  })),
  receivedBy: z.string().min(1, "Nama penerima wajib diisi."),
  notes: z.string().optional(),
});

type DistributionFormData = z.infer<typeof distributionSchema>;

export const DistributionCard = ({ transaction, userRole }: { transaction: Transaction, userRole: UserRole }) => {
  const [loading, setLoading] = useState(false);
  
  const form = useForm<DistributionFormData>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      distributedDrugs: transaction.approval?.approvedDrugs?.map(d => ({
        drugId: d.drugId,
        drugName: d.drugName,
        distributedQuantity: d.approvedQuantity,
        batchNumber: "",
        expiryDate: new Date(),
      })) || [],
      receivedBy: transaction.farmerGroup.leader, // Default to group leader
      notes: "",
    }
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "distributedDrugs",
  });

  const onSubmit = async (data: DistributionFormData) => {
    setLoading(true);
    console.log("Distribution data:", data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Distribusi obat telah dikonfirmasi.");
    setLoading(false);
  };

  if (!transaction.approval) return null;

  return (
    <Card className="border-blue-500">
      <CardHeader>
        <CardTitle>Tindakan Distribusi</CardTitle>
        <CardDescription>Konfirmasi obat yang akan didistribusikan.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <FormLabel>Obat untuk Didistribusikan</FormLabel>
              <div className="space-y-4 mt-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-md border p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{field.drugName}</p>
                      <p className="text-sm font-bold">{field.distributedQuantity} unit</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`distributedDrugs.${index}.batchNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">No. Batch</FormLabel>
                            <Input placeholder="No. batch..." {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`distributedDrugs.${index}.expiryDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Tgl. Kadaluarsa</FormLabel>
                            <DatePicker value={field.value} onChange={field.onChange} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="receivedBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Penerima</FormLabel>
                  <Input placeholder="Nama lengkap penerima..." {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan Distribusi (Opsional)</FormLabel>
                  <Textarea placeholder="Catatan tambahan..." {...field} />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading} className="w-full">
              <Truck className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : "Konfirmasi Distribusi"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DistributionCard;
