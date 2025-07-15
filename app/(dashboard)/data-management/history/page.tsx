import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DataHistoryPage = () => {
  // Mock data untuk history
  const historyData = [
    {
      id: 1,
      action: "CREATE",
      table: "inventory",
      description: "Menambahkan obat Paracetamol 500mg",
      user: "Admin",
      timestamp: "2024-01-15 10:30:00",
      changes: { name: "Paracetamol 500mg", stock: 100 }
    },
    {
      id: 2,
      action: "UPDATE",
      table: "inventory",
      description: "Mengubah stok obat Amoxicillin 500mg",
      user: "Farmasi",
      timestamp: "2024-01-15 09:15:00",
      changes: { stock: { old: 50, new: 75 } }
    },
    {
      id: 3,
      action: "DELETE",
      table: "transactions",
      description: "Menghapus transaksi TRX-001",
      user: "Admin",
      timestamp: "2024-01-14 16:45:00",
      changes: { transaction_id: "TRX-001" }
    }
  ];

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge color="default" className="bg-green-100 text-green-800">CREATE</Badge>;
      case "UPDATE":
        return <Badge color="default" className="bg-blue-100 text-blue-800">UPDATE</Badge>;
      case "DELETE":
        return <Badge color="default" className="bg-red-100 text-red-800">DELETE</Badge>;
      default:
        return <Badge color="secondary">{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-default-900">History Data</h1>
          <p className="text-default-600">Riwayat perubahan data sistem</p>
        </div>
        <Button variant="outline">
          <Icon icon="heroicons-outline:arrow-down-tray" className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas</CardTitle>
          <CardDescription>
            Semua perubahan data dicatat secara otomatis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aksi</TableHead>
                <TableHead>Tabel</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Waktu</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{getActionBadge(item.action)}</TableCell>
                  <TableCell className="font-medium">{item.table}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.user}</TableCell>
                  <TableCell>{item.timestamp}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Icon icon="heroicons-outline:eye" className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataHistoryPage;
