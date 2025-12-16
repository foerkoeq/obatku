import { z } from "zod";

export const submissionSchema = z.object({
  // Step 1: Basic Info
  district: z.string(),
  village: z.string().min(1, "Desa wajib diisi"),
  farmerGroupId: z.string().min(1, "Kelompok tani wajib dipilih"),
  farmerGroupName: z.string().min(1, "Nama kelompok tani wajib diisi"),
  groupLeader: z.string().min(1, "Ketua kelompok tani wajib diisi"),
  phoneNumber: z.string().min(1, "Nomor HP wajib diisi"), // New field
  
  // Step 2: Farming Details
  landArea: z.coerce
    .number({ invalid_type_error: "Luas lahan harus berupa angka" })
    .positive("Luas lahan harus lebih dari 0"),
  commodities: z.array(z.string()).min(1, "Minimal satu komoditas wajib dipilih"),
  pestTypes: z.array(z.string()).min(1, "Minimal satu jenis OPT wajib diisi"),
  affectedArea: z.coerce
    .number({ invalid_type_error: "Luas lahan terserang harus berupa angka" })
    .min(0, "Tidak boleh negatif"),

  // Step 3: Medicine Request
  drugItems: z
    .array(
      z.object({
        medicineId: z.string(),
        name: z.string(),
        quantity: z.coerce
          .number()
          .positive("Jumlah harus lebih dari 0"),
        unit: z.string(),
        maxStock: z.number().optional(),
      })
    )
    .min(1, "Minimal satu jenis obat harus diminta"),

  // Step 4: Documents
  letterNumber: z.string().min(1, "Nomor surat wajib diisi"),
  letterDate: z.date({
    required_error: "Tanggal surat wajib diisi",
  }),
  pickupDate: z.date({
    required_error: "Rencana pengambilan wajib diisi",
  }).min(new Date(new Date().setHours(0, 0, 0, 0)), "Tanggal tidak boleh mundur"),
  letterFile: z.any().optional(), // Handle file validation separately or refine
  poptRecommendationFile: z.any().optional(),
}).refine((data) => data.affectedArea <= data.landArea, {
  message: "Luas terserang tidak boleh melebihi luasan total",
  path: ["affectedArea"],
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;
