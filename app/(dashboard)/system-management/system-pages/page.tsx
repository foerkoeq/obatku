import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

const SystemPagesPage = () => {
  const systemPages = [
    {
      name: "404 - Not Found",
      path: "/404",
      description: "Halaman yang ditampilkan ketika halaman tidak ditemukan",
      status: "active",
      lastModified: "2024-01-15 10:00:00",
      preview: "/preview/404"
    },
    {
      name: "Coming Soon",
      path: "/coming-soon",
      description: "Halaman yang menampilkan fitur yang akan datang",
      status: "active",
      lastModified: "2024-01-15 09:30:00",
      preview: "/preview/coming-soon"
    },
    {
      name: "Under Construction",
      path: "/under-construction",
      description: "Halaman yang menampilkan bahwa sistem sedang dalam pembangunan",
      status: "active",
      lastModified: "2024-01-15 09:00:00",
      preview: "/preview/under-construction"
    },
    {
      name: "Under Maintenance",
      path: "/under-maintenance",
      description: "Halaman yang ditampilkan ketika sistem dalam mode maintenance",
      status: "active",
      lastModified: "2024-01-15 08:30:00",
      preview: "/preview/under-maintenance"
    },
    {
      name: "Access Denied",
      path: "/access-denied",
      description: "Halaman yang ditampilkan ketika akses ditolak",
      status: "draft",
      lastModified: "2024-01-14 15:00:00",
      preview: "/preview/access-denied"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge color="default" className="bg-green-100 text-green-800">Active</Badge>;
      case "draft":
        return <Badge color="default" className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      case "disabled":
        return <Badge color="default" className="bg-red-100 text-red-800">Disabled</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-default-900">Halaman Sistem</h1>
        <p className="text-default-600">Kelola halaman error dan maintenance</p>
      </div>

      <Alert>
        <Icon icon="heroicons-outline:information-circle" className="h-4 w-4" />
        <AlertDescription>
          Halaman sistem ini menggunakan i18n routing yang sudah tidak digunakan lagi. Perlu disesuaikan untuk menghilangkan dependency i18n.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="pages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pages">Halaman Sistem</TabsTrigger>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <div className="grid gap-4">
            {systemPages.map((page, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{page.name}</CardTitle>
                      {getStatusBadge(page.status)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Icon icon="heroicons-outline:eye" className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm">
                        <Icon icon="heroicons-outline:pencil" className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                  <CardDescription>{page.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-default-600">
                      <Icon icon="heroicons-outline:link" className="h-4 w-4" />
                      <span>Path: {page.path}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-default-600">
                      <Icon icon="heroicons-outline:clock" className="h-4 w-4" />
                      <span>Last Modified: {page.lastModified}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Global</CardTitle>
              <CardDescription>
                Pengaturan yang berlaku untuk semua halaman sistem
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Icon icon="heroicons-outline:exclamation-triangle" className="h-4 w-4" />
                <AlertDescription>
                  <strong>Perbaikan yang Diperlukan:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Menghilangkan penggunaan `Link` dari `@/i18n/routing`</li>
                    <li>Menggunakan `next/link` standar</li>
                    <li>Menyesuaikan routing tanpa i18n</li>
                    <li>Update path dan URL handling</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Icon icon="heroicons-outline:wrench-screwdriver" className="h-6 w-6" />
                  <span>Perbaiki i18n Routing</span>
                  <span className="text-xs text-default-500">Hapus dependency i18n</span>
                </Button>
                
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Icon icon="heroicons-outline:arrow-path" className="h-6 w-6" />
                  <span>Update Templates</span>
                  <span className="text-xs text-default-500">Perbarui template halaman</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Aksi cepat untuk mengelola halaman sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Icon icon="heroicons-outline:plus" className="h-6 w-6" />
                  <span>Buat Halaman Baru</span>
                  <span className="text-xs text-default-500">Tambah halaman sistem</span>
                </Button>
                
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Icon icon="heroicons-outline:document-duplicate" className="h-6 w-6" />
                  <span>Duplicate Template</span>
                  <span className="text-xs text-default-500">Salin template existing</span>
                </Button>
                
                <Button variant="outline" className="flex flex-col items-center gap-2 h-auto p-4">
                  <Icon icon="heroicons-outline:arrow-up-tray" className="h-6 w-6" />
                  <span>Import Template</span>
                  <span className="text-xs text-default-500">Import template baru</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemPagesPage;
