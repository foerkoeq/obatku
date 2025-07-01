import * as z from "zod";

export const approvalWizardSchema = z.object({
  approvedDrugs: z.array(z.object({
    drug: z.object({
      id: z.string().min(1, "Obat harus dipilih"),
      name: z.string(),
      stock: z.number(),
    }),
    quantity: z.coerce.number().min(1, "Jumlah harus diisi").positive("Jumlah harus positif"),
  })).min(1, "Minimal satu obat harus disetujui"),
  noteToSubmitter: z.string().optional(),
  noteToWarehouse: z.string().optional(),
  pickupDate: z.date({
    required_error: "Tanggal pengambilan harus diisi.",
  }),
});

export type ApprovalWizardSchema = z.infer<typeof approvalWizardSchema>; 