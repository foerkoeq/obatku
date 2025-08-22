import * as z from "zod";

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
  role: z.enum(["Admin", "PPL", "Dinas", "POPT"]),
});

// Extended schema for profile updates
export const userProfileSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }).optional().or(z.literal("")),
  phone: z.string().min(10, { message: "Phone number is required." }),
  address: z.string().optional(),
  role: z.enum(["Admin", "PPL", "Dinas", "POPT"]),
  isActive: z.boolean(),
});

// Schema for creating users via API
export const createUserSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  role: z.enum(["Admin", "PPL", "Dinas", "POPT"]),
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
  role: z.enum(["Admin", "PPL", "Dinas", "POPT"]).optional(),
  permissions: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

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