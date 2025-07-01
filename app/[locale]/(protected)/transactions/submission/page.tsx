"use client";

import {
  useState,
  useEffect
} from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  TagInput
} from "@/components/form/tag-input";
import {
  ImageUpload
} from "@/components/form/image-upload";
import PageTitle from "@/components/page-title";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import type { UserRole } from "@/lib/types/transaction";

// ------------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------------
const submissionSchema = z
  .object({
    district: z.string(), // auto filled, read-only
    village: z.string().min(1, "Desa wajib diisi"),
    farmerGroup: z.string().min(1, "Nama kelompok tani wajib diisi"),
    leader: z.string().min(1, "Ketua kelompok tani wajib diisi"),
    commodity: z.string().min(1, "Komoditas wajib diisi"),
    totalArea: z
      .number({ invalid_type_error: "Luas lahan harus berupa angka" })
      .positive("Luas lahan harus lebih dari 0"),
    affectedArea: z
      .number({ invalid_type_error: "Luas lahan terserang harus berupa angka" })
      .min(0, "Tidak boleh negatif"),
    pestType: z
      .array(z.string())
      .min(1, "Minimal satu jenis OPT wajib diisi"),
    letterNumber: z.string().min(1, "Nomor surat wajib diisi"),
    letterDate: z.date({
      required_error: "Tanggal surat wajib diisi",
    }),
    letterFile: z
      .array(z.any())
      .min(1, "File surat wajib diunggah")
      .max(1, "Hanya satu file yang diperbolehkan"),
  })
  .refine((data) => data.affectedArea <= data.totalArea, {
    message: "Luas terserang tidak boleh melebihi luasan total",
    path: ["affectedArea"],
  });

type SubmissionFormData = z.infer<typeof submissionSchema>;

// ------------------------------------------------------------------
// Page Component
// ------------------------------------------------------------------
const SubmissionPage = () => {
  const router = useRouter();

  // ----------------------------------------------------------------
  // Mock Auth – replace with actual auth context / server session
  // ----------------------------------------------------------------
  const [userRole] = useState<UserRole>("ppl"); // treat ppl ~ BPP
  const [district] = useState<string>("Kecamatan Example"); // derive from user profile

  // Gate access – only BPP/PPL allowed
  useEffect(() => {
    if (userRole !== "ppl") {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push("/dashboard");
    }
  }, [userRole, router]);

  // React Hook Form setup
  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      district: district,
      village: "",
      farmerGroup: "",
      leader: "",
      commodity: "",
      totalArea: 0,
      affectedArea: 0,
      pestType: [],
      letterNumber: "",
      letterDate: new Date(),
      letterFile: [],
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: SubmissionFormData) => {
    setLoading(true);

    try {
      // TODO: integrate with API
      console.log("Submitting request:", data);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Pengajuan berhasil dikirim");
      router.push("/transactions/list");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim pengajuan");
    } finally {
      setLoading(false);
    }
  };

  // Unauthorized fallback (should rarely show since we redirect)
  if (userRole !== "ppl") {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Anda tidak memiliki akses untuk membuat pengajuan.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <PageTitle title="Pengajuan Permintaan Obat" className="mb-2" />
          <p className="text-sm text-muted-foreground">
            Lengkapi form berikut untuk mengajukan permintaan obat ke Dinas
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      {/* Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Data umum pengajuan</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* District */}
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                  </FormItem>
                )}
              />
              {/* Village */}
              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama desa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Farmer Group */}
              <FormField
                control={form.control}
                name="farmerGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Kelompok Tani/Gapoktan</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Tani Makmur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Leader */}
              <FormField
                control={form.control}
                name="leader"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ketua Kelompok Tani</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama ketua" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detail Pertanian</CardTitle>
              <CardDescription>Informasi lahan dan OPT</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Commodity */}
              <FormField
                control={form.control}
                name="commodity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Komoditas</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Padi" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Total Area */}
              <FormField
                control={form.control}
                name="totalArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Luas Lahan (Ha)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Misal: 5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Affected Area */}
              <FormField
                control={form.control}
                name="affectedArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Luas Terserang (Ha)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Misal: 1.5"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Pest Type */}
              <FormField
                control={form.control}
                name="pestType"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Jenis OPT</FormLabel>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tambahkan jenis OPT..."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dokumen Pengajuan</CardTitle>
              <CardDescription>Lengkapi informasi surat</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Letter Number */}
              <FormField
                control={form.control}
                name="letterNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Surat</FormLabel>
                    <FormControl>
                      <Input placeholder="Misal: 123/ABC/2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Letter Date */}
              <FormField
                control={form.control}
                name="letterDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Surat</FormLabel>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Letter File Upload */}
              <FormField
                control={form.control}
                name="letterFile"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Upload Dokumen Surat</FormLabel>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      maxFiles={1}
                      acceptedTypes={["application/pdf", "image/jpeg", "image/png"]}
                      className="mt-2"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Menyimpan..." : "Kirim Pengajuan"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubmissionPage; 