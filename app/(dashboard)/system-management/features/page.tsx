import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const FeaturesPage = () => {
  // Mock data untuk features
  const features = [
    {
      id: "inventory_management",
      name: "Manajemen Inventori",
      description: "Fitur untuk mengelola stok obat dan inventory",
      enabled: true,
      category: "Core",
      dependencies: []
    },
    {
      id: "transaction_management",
      name: "Manajemen Transaksi",
      description: "Fitur untuk mengelola transaksi masuk dan keluar",
      enabled: true,
      category: "Core",
      dependencies: ["inventory_management"]
    },
    {
      id: "user_management",
      name: "Manajemen User",
      description: "Fitur untuk mengelola pengguna sistem",
      enabled: true,
      category: "Core",
      dependencies: []
    },
    {
      id: "reports",
      name: "Laporan",
      description: "Fitur untuk generate laporan sistem",
      enabled: true,
      category: "Feature",
      dependencies: ["inventory_management", "transaction_management"]
    },
    {
      id: "notifications",
      name: "Notifikasi",
      description: "Sistem notifikasi untuk user",
      enabled: false,
      category: "Feature",
      dependencies: []
    },
    {
      id: "api_access",
      name: "API Access",
      description: "Akses API untuk integrasi external",
      enabled: false,
      category: "Advanced",
      dependencies: []
    },
    {
      id: "audit_logs",
      name: "Audit Logs",
      description: "Pencatatan audit log sistem",
      enabled: true,
      category: "Advanced",
      dependencies: []
    }
  ];

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "Core":
        return <Badge color="default" className="bg-blue-100 text-blue-800">Core</Badge>;
      case "Feature":
        return <Badge color="default" className="bg-green-100 text-green-800">Feature</Badge>;
      case "Advanced":
        return <Badge color="default" className="bg-purple-100 text-purple-800">Advanced</Badge>;
      default:
        return <Badge color="secondary">{category}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-default-900">Kontrol Fitur</h1>
        <p className="text-default-600">Aktifkan atau nonaktifkan fitur sistem</p>
      </div>

      <Alert>
        <Icon icon="heroicons-outline:information-circle" className="h-4 w-4" />
        <AlertDescription>
          Perubahan pada fitur core dapat mempengaruhi stabilitas sistem. Pastikan untuk backup data sebelum melakukan perubahan.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4">
        {features.map((feature) => (
          <Card key={feature.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                  {getCategoryBadge(feature.category)}
                </div>
                <Switch 
                  checked={feature.enabled} 
                  disabled={feature.category === "Core"}
                />
              </div>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {feature.dependencies.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-default-600">
                    <Icon icon="heroicons-outline:link" className="h-4 w-4" />
                    <span>Bergantung pada: {feature.dependencies.join(", ")}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Icon 
                    icon={feature.enabled ? "heroicons-outline:check-circle" : "heroicons-outline:x-circle"} 
                    className={`h-4 w-4 ${feature.enabled ? "text-green-600" : "text-red-600"}`}
                  />
                  <span className={feature.enabled ? "text-green-600" : "text-red-600"}>
                    {feature.enabled ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aksi Massal</CardTitle>
          <CardDescription>
            Aktifkan atau nonaktifkan multiple fitur sekaligus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline">
              <Icon icon="heroicons-outline:check" className="h-4 w-4 mr-2" />
              Aktifkan Semua Feature
            </Button>
            <Button variant="outline">
              <Icon icon="heroicons-outline:x-mark" className="h-4 w-4 mr-2" />
              Nonaktifkan Semua Feature
            </Button>
          </div>
          <Alert>
            <Icon icon="heroicons-outline:exclamation-triangle" className="h-4 w-4" />
            <AlertDescription>
              Fitur Core tidak dapat dinonaktifkan karena diperlukan untuk operasi sistem.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesPage;
