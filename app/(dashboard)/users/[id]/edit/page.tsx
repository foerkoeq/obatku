"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { UserForm } from "@/components/users/user-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { users as usersMock } from "@/lib/data/user-demo";

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const user = usersMock.find((u) => u.id === id) ?? null;

  if (!user) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Card>
          <CardContent className="p-6 sm:p-8 space-y-4 text-center">
            <p className="text-default-700 font-medium">
              Data pengguna tidak ditemukan.
            </p>
            <Button asChild>
              <Link href="/users">Kembali ke Manajemen Pengguna</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-default-900">
          Edit Pengguna
        </h1>
        <p className="text-sm text-default-500 mt-1">
          Perbarui data pengguna <span className="font-medium">{user.name}</span>.
          Kata sandi kosongkan jika tidak ingin diubah.
        </p>
      </div>

      <UserForm mode="edit" initialData={user} />
    </div>
  );
}
