import { Metadata } from "next";
import { UserForm } from "@/components/users/user-form";

export const metadata: Metadata = {
  title: "Tambah Pengguna",
  description: "Tambahkan pengguna baru ke sistem",
};

export default function AddUserPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-default-900">
          Tambah Pengguna Baru
        </h1>
        <p className="text-sm text-default-500 mt-1">
          Isi formulir di bawah untuk mendaftarkan pengguna baru ke sistem.
          Pastikan data yang diisi sudah benar.
        </p>
      </div>

      <UserForm mode="add" />
    </div>
  );
}
