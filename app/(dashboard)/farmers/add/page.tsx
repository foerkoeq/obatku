"use client";

import { FarmerGroupForm } from "@/components/farmers/farmer-group-form";

export default function AddFarmerGroupPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-default-900">Tambah Data Kelompok Tani</h1>
        <p className="text-sm text-default-500 mt-1">
          Input data poktan/gapoktan secara terstruktur untuk mendukung pendataan yang cepat,
          konsisten, dan minim human error.
        </p>
      </div>

      <FarmerGroupForm />
    </div>
  );
}
