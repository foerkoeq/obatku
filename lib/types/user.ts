export type User = {
  id: string;
  name: string;
  email?: string;
  role: "Admin" | "PPL" | "Dinas" | "POPT";
  avatar?: string;
  status: "active" | "inactive";
  lastLogin: string;
  nip: string;
  phone: string;
  birthDate: string;
}; 