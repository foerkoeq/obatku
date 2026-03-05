"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TUBAN_DAERAH } from "@/lib/data/tuban-daerah";

const numericString = z
  .string()
  .min(1, "Wajib diisi")
  .regex(/^\d+$/, "Hanya angka yang diperbolehkan");

const formSchema = z
  .object({
    kecamatan: z.string().min(1, "Kecamatan wajib dipilih"),
    desa: z.string().min(1, "Desa wajib dipilih"),
    jenisKelompok: z.enum(["Gapoktan", "Poktan"]),
    namaGapoktan: z.string().optional(),
    namaKetuaGapoktan: z.string().optional(),
    nikGapoktan: z.string().optional(),
    noHpGapoktan: z.string().optional(),
    poktanMembers: z
      .array(
        z.object({
          namaPoktan: z.string().min(1, "Nama poktan wajib diisi"),
          namaKetuaPoktan: z.string().min(1, "Nama ketua poktan wajib diisi"),
          nikPoktan: numericString.refine((value) => value.length === 16, "NIK harus 16 digit"),
          noHpPoktan: numericString.refine(
            (value) => value.length >= 10 && value.length <= 15,
            "No. HP harus 10-15 digit"
          ),
        })
      )
      .min(1, "Minimal ada 1 data poktan"),
  })
  .superRefine((data, ctx) => {
    if (data.jenisKelompok === "Gapoktan") {
      if (!data.namaGapoktan?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["namaGapoktan"],
          message: "Nama gapoktan wajib diisi",
        });
      }

      if (!data.namaKetuaGapoktan?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["namaKetuaGapoktan"],
          message: "Nama ketua gapoktan wajib diisi",
        });
      }

      if (!data.nikGapoktan?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nikGapoktan"],
          message: "NIK ketua gapoktan wajib diisi",
        });
      } else if (!/^\d{16}$/.test(data.nikGapoktan)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["nikGapoktan"],
          message: "NIK ketua gapoktan harus 16 digit",
        });
      }

      if (!data.noHpGapoktan?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["noHpGapoktan"],
          message: "No. HP ketua gapoktan wajib diisi",
        });
      } else if (!/^\d{10,15}$/.test(data.noHpGapoktan)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["noHpGapoktan"],
          message: "No. HP ketua gapoktan harus 10-15 digit",
        });
      }
    }
  });

export type FarmerGroupFormValues = z.infer<typeof formSchema>;
type SubmitAction = "save" | "save-and-add";

interface FarmerGroupFormProps {
  mode?: "add" | "edit";
  initialValues?: FarmerGroupFormValues;
}

const createEmptyPoktan = () => ({
  namaPoktan: "",
  namaKetuaPoktan: "",
  nikPoktan: "",
  noHpPoktan: "",
});

const getDesaOptions = (kecamatan: string) => {
  return TUBAN_DAERAH.find((item) => item.kecamatan === kecamatan)?.desa ?? [];
};

const getDefaultValues = (): FarmerGroupFormValues => ({
  kecamatan: "",
  desa: "",
  jenisKelompok: "Poktan",
  namaGapoktan: "",
  namaKetuaGapoktan: "",
  nikGapoktan: "",
  noHpGapoktan: "",
  poktanMembers: [createEmptyPoktan()],
});

export function FarmerGroupForm({ mode = "add", initialValues }: FarmerGroupFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [submitAction, setSubmitAction] = useState<SubmitAction>("save");

  const defaultValues = useMemo(() => {
    if (!initialValues) return getDefaultValues();
    return {
      ...getDefaultValues(),
      ...initialValues,
      poktanMembers:
        initialValues.poktanMembers && initialValues.poktanMembers.length > 0
          ? initialValues.poktanMembers
          : [createEmptyPoktan()],
    };
  }, [initialValues]);

  const form = useForm<FarmerGroupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "poktanMembers",
  });

  const jenisKelompok = form.watch("jenisKelompok");
  const selectedKecamatan = form.watch("kecamatan");

  const kecamatanOptions = useMemo(
    () => TUBAN_DAERAH.map((item) => item.kecamatan).sort((a, b) => a.localeCompare(b, "id")),
    []
  );

  const desaOptions = useMemo(() => getDesaOptions(selectedKecamatan), [selectedKecamatan]);

  useEffect(() => {
    const currentDesa = form.getValues("desa");
    if (currentDesa && !desaOptions.includes(currentDesa)) {
      form.setValue("desa", "", { shouldValidate: true });
    }
  }, [desaOptions, form]);

  useEffect(() => {
    if (jenisKelompok === "Poktan") {
      const first = form.getValues("poktanMembers.0") ?? createEmptyPoktan();
      replace([first]);
    } else if (jenisKelompok === "Gapoktan" && fields.length === 0) {
      replace([createEmptyPoktan()]);
    }
  }, [jenisKelompok, fields.length, form, replace]);

  const normalizeNumericInput = (value: string) => value.replace(/\D/g, "");

  const onSubmit = async (values: FarmerGroupFormValues) => {
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log("Mock save farmer group", values);

      if (mode === "add" && submitAction === "save-and-add") {
        toast.success("Data berhasil disimpan. Silakan tambah data berikutnya.");
        form.reset(getDefaultValues());
        return;
      }

      toast.success(mode === "edit" ? "Perubahan data berhasil disimpan." : "Data kelompok tani berhasil disimpan.");
      router.push("/farmers");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg sm:text-xl">
          {mode === "edit" ? "Form Edit Data Kelompok Tani" : "Form Tambah Data Kelompok Tani"}
        </CardTitle>
        <CardDescription>
          Isi data secara lengkap agar pendataan lebih akurat dan meminimalkan human error.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kecamatan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan</FormLabel>
                    <Select value={field.value || undefined} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kecamatan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kecamatanOptions.map((kecamatan) => (
                          <SelectItem key={kecamatan} value={kecamatan}>
                            {kecamatan}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desa</FormLabel>
                    <Select
                      value={field.value || undefined}
                      onValueChange={field.onChange}
                      disabled={!selectedKecamatan}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedKecamatan ? "Pilih desa" : "Pilih kecamatan terlebih dahulu"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {desaOptions.map((desa) => (
                          <SelectItem key={desa} value={desa}>
                            {desa}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Desa otomatis menyesuaikan kecamatan yang dipilih.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="jenisKelompok"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jenis Kelompok</FormLabel>
                  <FormControl>
                    <RadioGroup
                      className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <label className="flex items-center gap-3 rounded-lg border border-default-200 px-4 py-3 cursor-pointer">
                        <RadioGroupItem value="Poktan" />
                        <span className="text-sm font-medium text-default-800">Poktan</span>
                      </label>
                      <label className="flex items-center gap-3 rounded-lg border border-default-200 px-4 py-3 cursor-pointer">
                        <RadioGroupItem value="Gapoktan" />
                        <span className="text-sm font-medium text-default-800">Gapoktan</span>
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {jenisKelompok === "Gapoktan" && (
              <div className="rounded-lg border border-default-200 p-4 space-y-4">
                <h3 className="text-sm font-semibold text-default-900">Data Gapoktan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="namaGapoktan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Gapoktan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama gapoktan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="namaKetuaGapoktan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Ketua Gapoktan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama ketua gapoktan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nikGapoktan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>NIK Ketua Gapoktan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="16 digit NIK"
                            inputMode="numeric"
                            maxLength={16}
                            value={field.value ?? ""}
                            onChange={(event) => field.onChange(normalizeNumericInput(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="noHpGapoktan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No. HP Ketua Gapoktan</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Contoh: 0812xxxx"
                            inputMode="numeric"
                            maxLength={15}
                            value={field.value ?? ""}
                            onChange={(event) => field.onChange(normalizeNumericInput(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <div className="rounded-lg border border-default-200 p-4 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-default-900">
                  {jenisKelompok === "Gapoktan" ? "Data Poktan" : "Data Poktan Utama"}
                </h3>

                {jenisKelompok === "Gapoktan" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => append(createEmptyPoktan())}
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Poktan
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="rounded-lg border border-default-100 bg-default-50 p-3 sm:p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-default-800">
                        {jenisKelompok === "Gapoktan" ? `Poktan ${index + 1}` : "Poktan"}
                      </p>

                      {jenisKelompok === "Gapoktan" && fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          color="destructive"
                          size="sm"
                          className="gap-1"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`poktanMembers.${index}.namaPoktan`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Poktan</FormLabel>
                            <FormControl>
                              <Input placeholder="Masukkan nama poktan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`poktanMembers.${index}.namaKetuaPoktan`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nama Ketua Poktan</FormLabel>
                            <FormControl>
                              <Input placeholder="Masukkan nama ketua poktan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`poktanMembers.${index}.nikPoktan`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NIK Ketua Poktan</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="16 digit NIK"
                                inputMode="numeric"
                                maxLength={16}
                                value={field.value ?? ""}
                                onChange={(event) => field.onChange(normalizeNumericInput(event.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`poktanMembers.${index}.noHpPoktan`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>No. HP Ketua Poktan</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Contoh: 0812xxxx"
                                inputMode="numeric"
                                maxLength={15}
                                value={field.value ?? ""}
                                onChange={(event) => field.onChange(normalizeNumericInput(event.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/farmers")}
                disabled={isSaving}
              >
                Batal
              </Button>

              {mode === "add" && (
                <Button
                  type="submit"
                  variant="outline"
                  className="gap-2"
                  disabled={isSaving}
                  onClick={() => setSubmitAction("save-and-add")}
                >
                  <Save className="h-4 w-4" />
                  Simpan & Tambah Lagi
                </Button>
              )}

              <Button
                type="submit"
                className="gap-2"
                disabled={isSaving}
                onClick={() => setSubmitAction("save")}
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
