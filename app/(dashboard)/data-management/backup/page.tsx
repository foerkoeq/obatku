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
import { Alert, AlertDescription } from "@/components/ui/alert";

const BackupPage = () => {
  // Mock data untuk backup
  const backupData = [
    {
      id: 1,
      filename: "backup_2024-01-15_10-30.sql",
      size: "15.2 MB",
      type: "Scheduled",
      status: "Success",
      created: "2024-01-15 10:30:00",
      tables: ["inventory", "transactions", "users"]
    },
    {
      id: 2,
      filename: "backup_2024-01-14_10-30.sql",
      size: "14.8 MB",
      type: "Scheduled",
      status: "Success",
      created: "2024-01-14 10:30:00",
      tables: ["inventory", "transactions", "users"]
    },
    {
      id: 3,
      filename: "manual_backup_2024-01-13_15-45.sql",
      size: "14.5 MB",
      type: "Manual",
      status: "Success",
      created: "2024-01-13 15:45:00",
      tables: ["inventory", "transactions", "users"]
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Success":
        return <Badge color="default" className="bg-green-100 text-green-800">Success</Badge>;
      case "Failed":
        return <Badge color="default" className="bg-red-100 text-red-800">Failed</Badge>;
      case "Processing":
        return <Badge color="default" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Scheduled":
        return <Badge color="default">Scheduled</Badge>;
      case "Manual":
        return <Badge color="default">Manual</Badge>;
      default:
        return <Badge color="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-default-900">Backup & Restore</h1>
        <p className="text-default-600">Kelola backup dan restore data sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:cloud-arrow-up" className="h-5 w-5" />
              Buat Backup
            </CardTitle>
            <CardDescription>
              Backup data sistem secara manual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full">
              <Icon icon="heroicons-outline:server" className="h-4 w-4 mr-2" />
              Backup Sekarang
            </Button>
            <Alert>
              <Icon icon="heroicons-outline:information-circle" className="h-4 w-4" />
              <AlertDescription>
                Backup otomatis dilakukan setiap hari pukul 10:30 WIB
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:cloud-arrow-down" className="h-5 w-5" />
              Restore Data
            </CardTitle>
            <CardDescription>
              Restore data dari backup yang tersedia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              <Icon icon="heroicons-outline:arrow-up-tray" className="h-4 w-4 mr-2" />
              Upload Backup File
            </Button>
            <Alert>
              <Icon icon="heroicons-outline:exclamation-triangle" className="h-4 w-4" />
              <AlertDescription>
                Restore akan mengganti semua data yang ada!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Backup</CardTitle>
          <CardDescription>
            Daftar backup yang telah dibuat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Filename</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backupData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.filename}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{getTypeBadge(item.type)}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.created}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Icon icon="heroicons-outline:arrow-down-tray" className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Icon icon="heroicons-outline:arrow-path" className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Icon icon="heroicons-outline:trash" className="h-4 w-4" />
                      </Button>
                    </div>
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

export default BackupPage;
