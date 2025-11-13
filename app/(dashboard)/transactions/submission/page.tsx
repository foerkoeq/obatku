"use client";

import {
  useState,
  useEffect
} from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { transactionService } from '@/lib/services/transaction.service';
import {
  TagInput
} from "@/components/form/tag-input";
import {
  ImageUpload
} from "@/components/form/image-upload";
import {
  SelectWithCreate,
  type SelectOption
} from "@/components/form/select-with-create";
import {
  MultiSelectWithCreate
} from "@/components/form/multi-select-with-create";
import {
  useFarmerGroups,
  useCommodities,
  usePestTypes,
  useVillages
} from "@/hooks/use-master-data";
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
    // Drug request items
    drugItems: z
      .array(
        z.object({
          medicineId: z.string().optional(),
          name: z.string().min(1, "Nama obat wajib diisi"),
          quantity: z
            .number({ invalid_type_error: "Jumlah harus berupa angka" })
            .int("Jumlah harus bilangan bulat")
            .positive("Jumlah harus lebih dari 0"),
        })
      )
      .min(1, "Minimal satu jenis obat harus diminta"),
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

  // ----------------------------------------------------------------
  // Master Data Hooks
  // ----------------------------------------------------------------
  const { farmerGroups, loading: farmerGroupsLoading, createFarmerGroup } = useFarmerGroups({
    district,
    status: 'ACTIVE'
  });
  
  const { commodities, loading: commoditiesLoading, createCommodity } = useCommodities({
    status: 'ACTIVE'
  });
  
  const { pestTypes, loading: pestTypesLoading, createPestType } = usePestTypes({
    status: 'ACTIVE'
  });
  
  const { villages, loading: villagesLoading } = useVillages(district);

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
      drugItems: [
        { medicineId: undefined, name: "", quantity: 1 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'drugItems',
  });

  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------------------
  // Transform data for dropdowns
  // ----------------------------------------------------------------
  const farmerGroupOptions: SelectOption[] = farmerGroups.map(group => ({
    value: group.id,
    label: group.name,
    description: `${group.leader} - ${group.village}`
  }));

  const commodityOptions: SelectOption[] = commodities.map(commodity => ({
    value: commodity.id,
    label: commodity.name,
    description: commodity.category
  }));

  const pestTypeOptions: SelectOption[] = pestTypes.map(pest => ({
    value: pest.id,
    label: pest.name,
    description: `${pest.category} - ${pest.severity}`
  }));

  const villageOptions: SelectOption[] = villages.map(village => ({
    value: village,
    label: village
  }));

  const onSubmit = async (data: SubmissionFormData) => {
    setLoading(true);

    try {
      // Prepare payload
      const fileObj = Array.isArray(data.letterFile) && data.letterFile.length > 0 ? data.letterFile[0] : null;
      const file: File | undefined = fileObj?.file instanceof File ? fileObj.file : undefined;

      // Get selected farmer group and commodity names for submission
      const selectedFarmerGroup = farmerGroups.find(g => g.id === data.farmerGroup);
      const selectedCommodity = commodities.find(c => c.id === data.commodity);
      const selectedPestTypes = pestTypes.filter(p => data.pestType.includes(p.id));

      const payload = {
        district: data.district,
        village: data.village,
        farmerGroup: selectedFarmerGroup?.name || data.farmerGroup,
        leader: data.leader,
        commodity: selectedCommodity?.name || data.commodity,
        totalArea: data.totalArea,
        affectedArea: data.affectedArea,
        pestType: selectedPestTypes.map(p => p.name),
        letterNumber: data.letterNumber,
        letterDate: data.letterDate.toISOString(),
        drugItems: data.drugItems.map((it) => ({ name: it.name, medicineId: it.medicineId, quantity: it.quantity })),
      };

      const resp = await transactionService.submit(payload, file);

      if (resp && resp.success) {
        toast.success(resp.message || 'Pengajuan berhasil dikirim');
        router.push('/transactions/list');
      } else {
        throw resp;
      }
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
                      <SelectWithCreate
                        value={field.value}
                        onChange={field.onChange}
                        options={villageOptions}
                        placeholder="Pilih desa..."
                        searchPlaceholder="Cari desa..."
                        emptyMessage="Tidak ada desa ditemukan."
                        loading={villagesLoading}
                        allowClear
                        onClear={() => field.onChange("")}
                      />
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
                      <SelectWithCreate
                        value={field.value}
                        onChange={field.onChange}
                        options={farmerGroupOptions}
                        placeholder="Pilih kelompok tani..."
                        searchPlaceholder="Cari kelompok tani..."
                        emptyMessage="Tidak ada kelompok tani ditemukan."
                        loading={farmerGroupsLoading}
                        onCreate={async (data) => {
                          const newGroup = await createFarmerGroup({
                            name: data.name,
                            leader: data.leader || '',
                            district: district,
                            village: form.getValues('village') || '',
                            memberCount: parseInt(data.memberCount) || 0,
                            establishedDate: new Date().toISOString(),
                            contactInfo: {
                              phone: data.phone,
                              email: data.email
                            }
                          });
                          return {
                            value: newGroup.id,
                            label: newGroup.name,
                            description: `${newGroup.leader} - ${newGroup.village}`
                          };
                        }}
                        createButtonText="Tambah Kelompok Tani"
                        createDialogTitle="Tambah Kelompok Tani Baru"
                        createDialogDescription="Buat kelompok tani baru untuk ditambahkan ke daftar."
                        createFormFields={[
                          { name: 'name', label: 'Nama Kelompok', type: 'text', required: true, placeholder: 'Contoh: Tani Makmur' },
                          { name: 'leader', label: 'Ketua Kelompok', type: 'text', required: true, placeholder: 'Nama ketua kelompok' },
                          { name: 'memberCount', label: 'Jumlah Anggota', type: 'text', required: true, placeholder: 'Jumlah anggota' },
                          { name: 'phone', label: 'No. Telepon', type: 'text', required: false, placeholder: 'No. telepon (opsional)' },
                          { name: 'email', label: 'Email', type: 'text', required: false, placeholder: 'Email (opsional)' }
                        ]}
                        allowClear
                        onClear={() => field.onChange("")}
                      />
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
                      <SelectWithCreate
                        value={field.value}
                        onChange={field.onChange}
                        options={commodityOptions}
                        placeholder="Pilih komoditas..."
                        searchPlaceholder="Cari komoditas..."
                        emptyMessage="Tidak ada komoditas ditemukan."
                        loading={commoditiesLoading}
                        onCreate={async (data) => {
                          const newCommodity = await createCommodity({
                            name: data.name,
                            category: data.category || 'Umum',
                            description: data.description,
                            commonPestTypes: []
                          });
                          return {
                            value: newCommodity.id,
                            label: newCommodity.name,
                            description: newCommodity.category
                          };
                        }}
                        createButtonText="Tambah Komoditas"
                        createDialogTitle="Tambah Komoditas Baru"
                        createDialogDescription="Buat komoditas baru untuk ditambahkan ke daftar."
                        createFormFields={[
                          { name: 'name', label: 'Nama Komoditas', type: 'text', required: true, placeholder: 'Contoh: Padi' },
                          { name: 'category', label: 'Kategori', type: 'text', required: true, placeholder: 'Contoh: Pangan' },
                          { name: 'description', label: 'Deskripsi', type: 'textarea', required: false, placeholder: 'Deskripsi komoditas (opsional)' }
                        ]}
                        allowClear
                        onClear={() => field.onChange("")}
                      />
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
                    <FormControl>
                      <MultiSelectWithCreate
                        value={field.value}
                        onChange={field.onChange}
                        options={pestTypeOptions}
                        placeholder="Pilih jenis OPT..."
                        searchPlaceholder="Cari jenis OPT..."
                        emptyMessage="Tidak ada jenis OPT ditemukan."
                        loading={pestTypesLoading}
                        onCreate={async (data) => {
                          const newPestType = await createPestType({
                            name: data.name,
                            category: data.category || 'Umum',
                            description: data.description,
                            affectedCommodities: [form.getValues('commodity')].filter(Boolean),
                            severity: data.severity || 'MEDIUM'
                          });
                          return {
                            value: newPestType.id,
                            label: newPestType.name,
                            description: `${newPestType.category} - ${newPestType.severity}`
                          };
                        }}
                        createButtonText="Tambah Jenis OPT"
                        createDialogTitle="Tambah Jenis OPT Baru"
                        createDialogDescription="Buat jenis OPT baru untuk ditambahkan ke daftar."
                        createFormFields={[
                          { name: 'name', label: 'Nama OPT', type: 'text', required: true, placeholder: 'Contoh: Wereng Coklat' },
                          { name: 'category', label: 'Kategori', type: 'text', required: true, placeholder: 'Contoh: Hama' },
                          { name: 'severity', label: 'Tingkat Keparahan', type: 'text', required: true, placeholder: 'LOW, MEDIUM, HIGH, CRITICAL' },
                          { name: 'description', label: 'Deskripsi', type: 'textarea', required: false, placeholder: 'Deskripsi OPT (opsional)' }
                        ]}
                        maxSelections={10}
                        showSelectedCount
                      />
                    </FormControl>
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

          {/* Drug Request Items */}
          <Card>
            <CardHeader>
              <CardTitle>Permintaan Obat</CardTitle>
              <CardDescription>Tambah obat yang diminta beserta jumlah</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-7">
                    <FormField
                      control={form.control}
                      name={`drugItems.${index}.name` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nama Obat</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Pestisida X" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`drugItems.${index}.quantity` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah</FormLabel>
                          <FormControl>
                            <Input type="number" min={1} {...field} onChange={(e) => field.onChange(parseInt(e.target.value || '0'))} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => remove(index)}>
                        Hapus
                      </Button>
                      {index === fields.length - 1 && (
                        <Button type="button" onClick={() => append({ medicineId: undefined, name: '', quantity: 1 })}>
                          Tambah
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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