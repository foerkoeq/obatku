import * as z from "zod";

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