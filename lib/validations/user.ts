import * as z from "zod";
import { USER_ROLES } from "@/lib/types/user";

// Basic user schema for registration
export const userSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  nip: z
    .string()
    .min(5, { message: "NIP/NIK must be at least 5 characters." }),
  birthDate: z.date({
    required_error: "A date of birth is required.",
  }),
  phone: z.string().min(10, { message: "Phone number is required." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  role: z.enum(USER_ROLES),
});

// Extended schema for profile updates
export const userProfileSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phone: z.string().min(10, { message: "Phone number is required." }),
  address: z.string().optional(),
  role: z.enum(USER_ROLES),
  isActive: z.boolean(),
});

// Schema for creating users via API
export const createUserSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(USER_ROLES),
  phone: z.string().min(10, { message: "Phone number is required." }),
  address: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
});

// Schema for updating users via API
export const updateUserSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }).optional(),
  email: z.string().email({ message: "Invalid email address." }).optional(),
  phone: z.string().min(10, { message: "Phone number is required." }).optional(),
  address: z.string().optional(),
  role: z.enum(USER_ROLES).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Schema for add user page form (comprehensive)
export const addUserPageSchema = z
  .object({
    // Segmen Info Akun
    username: z
      .string()
      .min(3, { message: "Nama pengguna minimal 3 karakter." })
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message: "Nama pengguna hanya boleh huruf, angka, titik, underscore, atau dash.",
      }),
    password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }),
    confirmPassword: z.string().min(1, { message: "Ulangi kata sandi wajib diisi." }),
    email: z.string().email({ message: "Format surel tidak valid." }),
    phone: z
      .string()
      .min(10, { message: "No. HP minimal 10 digit." })
      .regex(/^[0-9+\-\s]+$/, { message: "No. HP hanya boleh angka, +, -, atau spasi." }),

    // Segmen Role & Status
    role: z.enum(USER_ROLES, { required_error: "Role wajib dipilih." }),
    lokasi: z.string().optional(),
    lokasiMultiple: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),

    // Segmen Data Pribadi
    name: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
    nip: z.string().optional(),
    pangkat: z.string().optional(),
    golongan: z.string().optional(),
    jabatan: z.string().optional(),
    birthDate: z.date().optional().nullable(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Kata sandi tidak cocok.",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      // BPP & PPL must select exactly 1 kecamatan
      if (data.role === "BPP" || data.role === "PPL") {
        return !!data.lokasi && data.lokasi.trim().length > 0;
      }
      return true;
    },
    {
      message: "Kecamatan wajib dipilih.",
      path: ["lokasi"],
    }
  )
  .refine(
    (data) => {
      // POPT must select at least 1 kecamatan
      if (data.role === "POPT") {
        return data.lokasiMultiple && data.lokasiMultiple.length > 0;
      }
      return true;
    },
    {
      message: "Pilih minimal 1 kecamatan.",
      path: ["lokasiMultiple"],
    }
  );

export type AddUserPageFormValues = z.infer<typeof addUserPageSchema>;

// Schema for edit user page form (no password required, optional change)
export const editUserPageSchema = z
  .object({
    // Segmen Info Akun
    username: z
      .string()
      .min(3, { message: "Nama pengguna minimal 3 karakter." })
      .regex(/^[a-zA-Z0-9._-]+$/, {
        message: "Nama pengguna hanya boleh huruf, angka, titik, underscore, atau dash.",
      }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    email: z.string().email({ message: "Format surel tidak valid." }),
    phone: z
      .string()
      .min(10, { message: "No. HP minimal 10 digit." })
      .regex(/^[0-9+\-\s]+$/, { message: "No. HP hanya boleh angka, +, -, atau spasi." }),

    // Segmen Role & Status
    role: z.enum(USER_ROLES, { required_error: "Role wajib dipilih." }),
    lokasi: z.string().optional(),
    lokasiMultiple: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),

    // Segmen Data Pribadi
    name: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
    nip: z.string().optional(),
    pangkat: z.string().optional(),
    golongan: z.string().optional(),
    jabatan: z.string().optional(),
    birthDate: z.date().optional().nullable(),
  })
  .refine(
    (data) => {
      // If password is provided, confirm must match
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Kata sandi tidak cocok.",
      path: ["confirmPassword"],
    }
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Kata sandi minimal 6 karakter.",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "BPP" || data.role === "PPL") {
        return !!data.lokasi && data.lokasi.trim().length > 0;
      }
      return true;
    },
    {
      message: "Kecamatan wajib dipilih.",
      path: ["lokasi"],
    }
  )
  .refine(
    (data) => {
      if (data.role === "POPT") {
        return data.lokasiMultiple && data.lokasiMultiple.length > 0;
      }
      return true;
    },
    {
      message: "Pilih minimal 1 kecamatan.",
      path: ["lokasiMultiple"],
    }
  );

export type EditUserPageFormValues = z.infer<typeof editUserPageSchema>;

// Schema for user filters
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

// Schema for pagination
export const paginationSchema = z.object({
  page: z.number().min(1, { message: "Page must be at least 1." }),
  limit: z.number().min(1, { message: "Limit must be at least 1." }).max(100, { message: "Limit cannot exceed 100." }),
}); 