"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Save,
  Shield,
  User as UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import DatePicker from "@/components/ui/date-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { USER_ROLES, UserRoleType, User } from "@/lib/types/user";
import { TUBAN_KECAMATAN } from "@/lib/data/daerah-tuban";
import {
  addUserPageSchema,
  editUserPageSchema,
  type AddUserPageFormValues,
  type EditUserPageFormValues,
} from "@/lib/validations/user";
import { cn } from "@/lib/utils";

// --- Constants ---

const ROLE_DESCRIPTIONS: Record<UserRoleType, string> = {
  Admin: "Akses penuh ke seluruh sistem",
  Kabid: "Kepala Bidang – monitoring & persetujuan",
  Kasubbid: "Kepala Sub Bidang – supervisi kegiatan bidang",
  "Staf Dinas": "Staf administrasi Dinas Pertanian",
  BPP: "Balai Penyuluhan Pertanian – koordinator kecamatan",
  PPL: "Penyuluh Pertanian Lapangan – tugas di 1 kecamatan",
  POPT: "Pengamat OPT – bisa di beberapa kecamatan",
};

const LOKASI_AUTO_MAP: Partial<Record<UserRoleType, string>> = {
  Admin: "Admin",
  Kabid: "Dinas",
  Kasubbid: "Dinas",
  "Staf Dinas": "Dinas",
};

// Roles that need kecamatan selection
const ROLES_NEED_SINGLE_KECAMATAN: UserRoleType[] = ["BPP", "PPL"];
const ROLES_NEED_MULTI_KECAMATAN: UserRoleType[] = ["POPT"];

// --- Section Header ---

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-1">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <h3 className="font-semibold text-default-900 text-sm sm:text-base">
          {title}
        </h3>
        <p className="text-xs text-default-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// --- Multi Kecamatan Select (simple checkbox-style) ---

function MultiKecamatanSelect({
  value,
  onChange,
  disabled,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  disabled?: boolean;
}) {
  const toggle = (kec: string) => {
    if (value.includes(kec)) {
      onChange(value.filter((v) => v !== kec));
    } else {
      onChange([...value, kec]);
    }
  };

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((kec) => (
            <Badge
              key={kec}
              color="primary"
              className="gap-1 cursor-pointer"
              onClick={() => !disabled && toggle(kec)}
            >
              Kec. {kec}
              <span className="text-[10px] opacity-70">✕</span>
            </Badge>
          ))}
        </div>
      )}
      <div className="border border-default-200 rounded-lg max-h-48 overflow-y-auto">
        {TUBAN_KECAMATAN.map((kec) => {
          const selected = value.includes(kec);
          return (
            <button
              key={kec}
              type="button"
              disabled={disabled}
              onClick={() => toggle(kec)}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors",
                "hover:bg-default-100 focus:bg-default-100",
                selected && "bg-primary/5 text-primary font-medium",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-default-300"
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </div>
              <span>Kec. {kec}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-default-400">
        {value.length} kecamatan dipilih
      </p>
    </div>
  );
}

// --- Props ---

type UserFormMode = "add" | "edit";

interface UserFormProps {
  mode?: UserFormMode;
  initialData?: User | null;
}

// --- Main Form Component ---

export function UserForm({ mode = "add", initialData }: UserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEdit = mode === "edit";
  const schema = isEdit ? editUserPageSchema : addUserPageSchema;

  const defaultValues = useMemo(() => {
    if (isEdit && initialData) {
      return {
        username: initialData.username || "",
        password: "",
        confirmPassword: "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        role: initialData.role,
        lokasi:
          ROLES_NEED_SINGLE_KECAMATAN.includes(initialData.role)
            ? initialData.lokasi
            : "",
        lokasiMultiple:
          ROLES_NEED_MULTI_KECAMATAN.includes(initialData.role)
            ? [initialData.lokasi]
            : [],
        isActive: initialData.isActive ?? true,
        name: initialData.name || "",
        nip: initialData.nip || "",
        pangkat: initialData.pangkat || "",
        golongan: initialData.golongan || "",
        jabatan: initialData.jabatan || "",
        birthDate: initialData.birthDate
          ? new Date(initialData.birthDate)
          : null,
      };
    }
    return {
      username: "",
      password: "",
      confirmPassword: "",
      email: "",
      phone: "",
      role: "PPL" as UserRoleType,
      lokasi: "",
      lokasiMultiple: [] as string[],
      isActive: true,
      name: "",
      nip: "",
      pangkat: "",
      golongan: "",
      jabatan: "",
      birthDate: null as Date | null,
    };
  }, [isEdit, initialData]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const watchedRole = form.watch("role") as UserRoleType;

  // Determine lokasi behavior based on role
  const needsSingleKecamatan = ROLES_NEED_SINGLE_KECAMATAN.includes(watchedRole);
  const needsMultiKecamatan = ROLES_NEED_MULTI_KECAMATAN.includes(watchedRole);
  const autoLokasi = LOKASI_AUTO_MAP[watchedRole];

  // Reset lokasi fields when role changes
  useEffect(() => {
    if (autoLokasi) {
      form.setValue("lokasi", "");
      form.setValue("lokasiMultiple", []);
    } else if (needsSingleKecamatan) {
      form.setValue("lokasiMultiple", []);
    } else if (needsMultiKecamatan) {
      form.setValue("lokasi", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedRole]);

  async function onSubmit(values: AddUserPageFormValues | EditUserPageFormValues) {
    try {
      setIsSubmitting(true);

      // Resolve final lokasi
      let finalLokasi = "";
      if (autoLokasi) {
        finalLokasi = autoLokasi;
      } else if (needsSingleKecamatan) {
        finalLokasi = values.lokasi || "";
      } else if (needsMultiKecamatan) {
        // For POPT, store the first kecamatan as primary lokasi
        // (lokasiMultiple stored separately)
        finalLokasi = values.lokasiMultiple?.[0] || "";
      }

      // Build user payload
      const payload = {
        username: values.username,
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role,
        lokasi: finalLokasi,
        lokasiMultiple: needsMultiKecamatan ? values.lokasiMultiple : undefined,
        isActive: values.isActive,
        nip: values.nip || "",
        pangkat: values.pangkat || "",
        golongan: values.golongan || "",
        jabatan: values.jabatan || "",
        birthDate: values.birthDate
          ? values.birthDate.toISOString().split("T")[0]
          : "",
        ...(values.password && values.password.length > 0
          ? { password: values.password }
          : {}),
      };

      // Simulate API call (frontend-only)
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (isEdit) {
        toast.success("Pengguna berhasil diperbarui!", {
          description: `Data ${values.name} telah disimpan.`,
        });
      } else {
        toast.success("Pengguna berhasil ditambahkan!", {
          description: `Akun ${values.username} telah dibuat.`,
        });
      }

      router.push("/users");
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(isEdit ? "Gagal memperbarui pengguna" : "Gagal menambahkan pengguna", {
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* ============ SEGMEN 1: INFO AKUN ============ */}
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <SectionHeader
              icon={Lock}
              title="Informasi Akun"
              description="Kredensial login dan kontak pengguna"
            />
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Nama Pengguna <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contoh: ppl.palang01"
                        {...field}
                        autoComplete="off"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Digunakan untuk login. Huruf kecil, angka, titik, underscore, atau dash.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kata Sandi {!isEdit && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={isEdit ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter"}
                          {...field}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    {isEdit && (
                      <FormDescription className="text-xs">
                        Kosongkan jika tidak ingin mengubah kata sandi.
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Ulangi Kata Sandi {!isEdit && <span className="text-destructive">*</span>}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Ketik ulang kata sandi"
                          {...field}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-600 transition-colors"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Surel <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nama@email.com"
                        {...field}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      No. HP <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="081234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ============ SEGMEN 2: ROLE & STATUS ============ */}
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <SectionHeader
              icon={Shield}
              title="Role & Status"
              description="Tentukan role, lokasi penugasan, dan status akun"
            />
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Role <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            <span className="font-medium">{role}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {watchedRole && (
                      <FormDescription className="text-xs">
                        {ROLE_DESCRIPTIONS[watchedRole]}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Akun</FormLabel>
                    <div className="flex items-center gap-3 pt-1">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        color={field.value ? "success" : "default"}
                      />
                      <Badge
                        color={field.value ? "success" : "default"}
                        className="text-xs"
                      >
                        {field.value ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                    <FormDescription className="text-xs">
                      Pengguna nonaktif tidak dapat login ke sistem.
                    </FormDescription>
                  </FormItem>
                )}
              />

              {/* Lokasi — auto display for Admin/Kabid/Kasubbid/Staf Dinas */}
              {autoLokasi && (
                <div className="sm:col-span-2 rounded-lg border border-default-200 bg-default-50/50 p-3">
                  <p className="text-xs text-default-500 mb-1">
                    Lokasi Penugasan
                  </p>
                  <p className="text-sm font-medium text-default-800">
                    {autoLokasi === "Admin"
                      ? "Administrator Sistem"
                      : "Dinas Pertanian Kab. Tuban"}
                  </p>
                  <p className="text-xs text-default-400 mt-1">
                    Lokasi ditetapkan otomatis berdasarkan role.
                  </p>
                </div>
              )}

              {/* Lokasi — single kecamatan for BPP & PPL */}
              {needsSingleKecamatan && (
                <FormField
                  control={form.control}
                  name="lokasi"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>
                        Kecamatan Penugasan{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kecamatan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TUBAN_KECAMATAN.map((kec) => (
                            <SelectItem key={kec} value={kec}>
                              Kec. {kec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        {watchedRole === "BPP"
                          ? "BPP ditugaskan di 1 kecamatan sebagai koordinator."
                          : "PPL ditugaskan di 1 kecamatan."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Lokasi — multi kecamatan for POPT */}
              {needsMultiKecamatan && (
                <FormField
                  control={form.control}
                  name="lokasiMultiple"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>
                        Kecamatan Penugasan{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <MultiKecamatanSelect
                          value={field.value || []}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        POPT dapat bertugas di beberapa kecamatan. Pilih
                        minimal 1.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* ============ SEGMEN 3: DATA PRIBADI ============ */}
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <SectionHeader
              icon={UserIcon}
              title="Data Pribadi"
              description="Informasi kepegawaian dan identitas pengguna"
            />
            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Nama Lengkap <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nama lengkap beserta gelar"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NIP */}
              <FormField
                control={form.control}
                name="nip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIP / NIPPPK</FormLabel>
                    <FormControl>
                      <Input placeholder="199001012020121001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Birth Date */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Lahir</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ?? undefined}
                        onChange={(date) => field.onChange(date ?? null)}
                        placeholder="Pilih tanggal lahir"
                        allowClear
                        displayFormat="dd/MM/yyyy"
                        maxDate={new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pangkat */}
              <FormField
                control={form.control}
                name="pangkat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pangkat</FormLabel>
                    <FormControl>
                      <Input placeholder="cth: Penata Muda Tk. I" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Golongan */}
              <FormField
                control={form.control}
                name="golongan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Golongan</FormLabel>
                    <FormControl>
                      <Input placeholder="cth: III/b" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Jabatan */}
              <FormField
                control={form.control}
                name="jabatan"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Jabatan</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="cth: Penyuluh Pertanian Lapangan"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* ============ FORM ACTIONS ============ */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-2 pb-4">
          <Button
            type="button"
            variant="outline"
            className="gap-2 w-full sm:w-auto"
            onClick={() => router.push("/users")}
            disabled={isSubmitting}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <Button
            type="submit"
            color="primary"
            className="gap-2 w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting
              ? "Menyimpan..."
              : isEdit
                ? "Simpan Perubahan"
                : "Tambah Pengguna"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
