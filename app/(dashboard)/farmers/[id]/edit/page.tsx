"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { FarmerGroupForm, FarmerGroupFormValues } from "@/components/farmers/farmer-group-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getFarmerGroupById } from "@/lib/data/farmer-groups-mock";

const mapToFormValues = (id: string): FarmerGroupFormValues | null => {
  const data = getFarmerGroupById(id);
  if (!data) return null;

  return {
    kecamatan: data.kecamatan,
    desa: data.desa,
    jenisKelompok: data.jenis,
    namaGapoktan: data.namaGapoktan ?? "",
    namaKetuaGapoktan: data.ketuaGapoktan?.nama ?? "",
    nikGapoktan: data.ketuaGapoktan?.nik ?? "",
    noHpGapoktan: data.ketuaGapoktan?.noHp ?? "",
    poktanMembers: data.poktan.map((item) => ({
      namaPoktan: item.namaPoktan,
      namaKetuaPoktan: item.ketua.nama,
      nikPoktan: item.ketua.nik,
      noHpPoktan: item.ketua.noHp,
    })),
  };
};

export default function EditFarmerGroupPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const initialValues = mapToFormValues(id);

  if (!initialValues) {
    return (
      <Card>
        <CardContent className="p-6 sm:p-8 space-y-4 text-center">
          <p className="text-default-700 font-medium">Data kelompok tani tidak ditemukan.</p>
          <Button asChild>
            <Link href="/farmers">Kembali ke Daftar Kelompok Tani</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-default-900">Edit Data Kelompok Tani</h1>
        <p className="text-sm text-default-500 mt-1">
          Perbarui data poktan/gapoktan secara akurat untuk menjaga kualitas data lapangan.
        </p>
      </div>

      <FarmerGroupForm mode="edit" initialValues={initialValues} />
    </div>
  );
}
