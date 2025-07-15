import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const MaintenancePage = () => {
  // Mock data untuk maintenance status
  const maintenanceStatus = {
    enabled: false,
    scheduledStart: "",
    scheduledEnd: "",
    reason: "",
    type: "scheduled", // scheduled, emergency, update
    allowedUsers: ["admin"],
    showCountdown: true,
    customMessage: ""
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-default-900">Mode Maintenance</h1>
        <p className="text-default-600">Kelola mode pemeliharaan sistem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:wrench-screwdriver" className="h-5 w-5" />
              Status Maintenance
            </CardTitle>
            <CardDescription>
              Status maintenance sistem saat ini
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-toggle">Mode Maintenance</Label>
              <Switch 
                id="maintenance-toggle"
                checked={maintenanceStatus.enabled}
              />
            </div>
            
            <Alert color="primary" variant="soft">
              <Icon icon="heroicons-outline:information-circle" className="h-4 w-4" />
              <AlertDescription>
                {maintenanceStatus.enabled 
                  ? "Sistem sedang dalam mode maintenance" 
                  : "Sistem berjalan normal"
                }
              </AlertDescription>
            </Alert>

            {maintenanceStatus.enabled && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons-outline:clock" className="h-4 w-4" />
                  <span className="text-sm">Dimulai: 2024-01-15 10:00</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="heroicons-outline:clock" className="h-4 w-4" />
                  <span className="text-sm">Estimasi selesai: 2024-01-15 12:00</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons-outline:calendar" className="h-5 w-5" />
              Jadwal Maintenance
            </CardTitle>
            <CardDescription>
              Atur jadwal maintenance yang akan datang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Mulai</Label>
                <Input 
                  id="start-time"
                  type="datetime-local"
                  value={maintenanceStatus.scheduledStart}
                />
              </div>
              <div>
                <Label htmlFor="end-time">Selesai</Label>
                <Input 
                  id="end-time"
                  type="datetime-local"
                  value={maintenanceStatus.scheduledEnd}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="maintenance-type">Tipe Maintenance</Label>
              <Select value={maintenanceStatus.type}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe maintenance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Terjadwal</SelectItem>
                  <SelectItem value="emergency">Darurat</SelectItem>
                  <SelectItem value="update">Update Sistem</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">
              <Icon icon="heroicons-outline:calendar-days" className="h-4 w-4 mr-2" />
              Jadwalkan Maintenance
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Maintenance</CardTitle>
          <CardDescription>
            Konfigurasi detail mode maintenance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="reason">Alasan Maintenance</Label>
            <Textarea 
              id="reason"
              placeholder="Masukkan alasan maintenance..."
              value={maintenanceStatus.reason}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="custom-message">Pesan Kustom</Label>
            <Textarea 
              id="custom-message"
              placeholder="Pesan yang akan ditampilkan kepada user..."
              value={maintenanceStatus.customMessage}
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-countdown">Tampilkan Countdown</Label>
            <Switch 
              id="show-countdown"
              checked={maintenanceStatus.showCountdown}
            />
          </div>

          <div>
            <Label>User yang Diizinkan Akses</Label>
            <div className="flex gap-2 mt-2">
              <Badge color="default">admin</Badge>
              <Badge color="default">superuser</Badge>
              <Button variant="outline" size="sm">
                <Icon icon="heroicons-outline:plus" className="h-4 w-4 mr-1" />
                Tambah User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
          <CardDescription>
            Aktifkan maintenance mode dengan pengaturan preset
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" color="primary" className="flex flex-col items-center gap-2 h-auto p-4">
              <Icon icon="heroicons-outline:wrench-screwdriver" className="h-6 w-6" />
              <span>Maintenance 1 Jam</span>
              <span className="text-xs text-default-500">Maintenance singkat</span>
            </Button>
            
            <Button variant="outline" color="warning" className="flex flex-col items-center gap-2 h-auto p-4">
              <Icon icon="heroicons-outline:arrow-path" className="h-6 w-6" />
              <span>Update Sistem</span>
              <span className="text-xs text-default-500">Maintenance untuk update</span>
            </Button>
            
            <Button variant="outline" color="destructive" className="flex flex-col items-center gap-2 h-auto p-4">
              <Icon icon="heroicons-outline:exclamation-triangle" className="h-6 w-6" />
              <span>Maintenance Darurat</span>
              <span className="text-xs text-default-500">Maintenance segera</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenancePage;
