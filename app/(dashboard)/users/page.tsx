import { Metadata } from "next";
import Link from "next/link";
import { UserTable } from "@/components/users";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Manajemen Pengguna",
  description: "Kelola pengguna sistem, role, dan aksesnya",
};

export default function UsersPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-default-500 mt-1">
            Lihat, atur, tambah, dan hapus pengguna sistem.
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" asChild>
          <Link href="/users/add">
            <Plus className="h-4 w-4" />
            Tambah Pengguna
          </Link>
        </Button>
      </div>

      <UserTable />
    </div>
  );
}