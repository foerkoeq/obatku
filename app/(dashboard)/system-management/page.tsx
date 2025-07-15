import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const SystemManagementPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-default-900">Manajemen Sistem</h1>
        <p className="text-default-600">Kelola pengaturan dan fitur sistem</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:squares-plus" className="h-5 w-5" />
              Kontrol Fitur
            </CardTitle>
            <CardDescription>
              Aktifkan/nonaktifkan fitur sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/system-management/features">
              <Button className="w-full">
                Kelola Fitur
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:wrench-screwdriver" className="h-5 w-5" />
              Mode Maintenance
            </CardTitle>
            <CardDescription>
              Mengatur mode pemeliharaan sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/system-management/maintenance">
              <Button className="w-full">
                Pengaturan Maintenance
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:document-duplicate" className="h-5 w-5" />
              Halaman Sistem
            </CardTitle>
            <CardDescription>
              Kelola halaman error dan maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/system-management/system-pages">
              <Button className="w-full">
                Kelola Halaman
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemManagementPage;
