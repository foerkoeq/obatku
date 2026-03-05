"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { FarmerGroupsTable } from "@/components/farmers";
import { Button } from "@/components/ui/button";

export default function FarmersPage() {
	const router = useRouter();

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-default-900">Daftar Kelompok Tani</h1>
					<p className="text-sm text-default-500 mt-1">
						Informasi kelompok tani di wilayah Tuban untuk membantu proses pendataan yang rapi,
						cepat, dan meminimalkan human error.
					</p>
				</div>

				<Button className="gap-2 w-full sm:w-auto" onClick={() => router.push("/farmers/add")}> 
					<Plus className="h-4 w-4" />
					Tambah Data
				</Button>
			</div>

			<FarmerGroupsTable />
		</div>
	);
}
