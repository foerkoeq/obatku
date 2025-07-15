import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DataManagementPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-default-900">Manajemen Data</h1>
        <p className="text-default-600">Kelola data sistem dan backup</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:clock" className="h-5 w-5" />
              History Data
            </CardTitle>
            <CardDescription>
              Lihat riwayat perubahan data sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/data-management/history">
              <Button className="w-full">
                Lihat History Data
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:server" className="h-5 w-5" />
              Backup & Restore
            </CardTitle>
            <CardDescription>
              Backup dan restore data sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/data-management/backup">
              <Button className="w-full">
                Kelola Backup
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataManagementPage;
