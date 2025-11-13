"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TransactionsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-default-900">Manajemen Transaksi</h1>
        <p className="text-default-600 mt-2">
          Kelola semua transaksi obat dari pengajuan hingga penyelesaian
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Transaction forms implementation coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
