"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { toast } from "sonner";

const TransactionSubmissionForm = () => {
  const [formData, setFormData] = useState({
    district: "",
    village: "",
    farmerGroup: "",
    groupLeader: "",
    commodity: "",
    totalArea: "",
    affectedArea: "",
    pestTypes: [] as string[],
    letterNumber: "",
    letterDate: "",
    priority: "MEDIUM",
    notes: "",
  });

  const [items, setItems] = useState([
    { medicineId: "", requestedQuantity: "", unit: "", notes: "" }
  ]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePestTypeToggle = (pestType: string) => {
    setFormData(prev => ({
      ...prev,
      pestTypes: prev.pestTypes.includes(pestType)
        ? prev.pestTypes.filter(p => p !== pestType)
        : [...prev.pestTypes, pestType]
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { medicineId: "", requestedQuantity: "", unit: "", notes: "" }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.district || !formData.village || !formData.farmerGroup) {
      toast.error("Mohon lengkapi informasi dasar");
      return;
    }

    if (formData.pestTypes.length === 0) {
      toast.error("Pilih minimal satu jenis OPT");
      return;
    }

    if (items.some(item => !item.medicineId || !item.requestedQuantity || !item.unit)) {
      toast.error("Lengkapi semua item obat");
      return;
    }

    try {
      // Here you would call the transaction service
      toast.success("Pengajuan berhasil dikirim!");
      
      // Reset form
      setFormData({
        district: "", village: "", farmerGroup: "", groupLeader: "",
        commodity: "", totalArea: "", affectedArea: "", pestTypes: [],
        letterNumber: "", letterDate: "", priority: "MEDIUM", notes: ""
      });
      setItems([{ medicineId: "", requestedQuantity: "", unit: "", notes: "" }]);
      
    } catch (error) {
      toast.error("Gagal mengirim pengajuan");
    }
  };

  const pestTypeOptions = [
    "Hama Penggerek Batang", "Hama Penggerek Buah", "Penyakit Bakteri", 
    "Penyakit Jamur", "Penyakit Virus", "Gulma"
  ];

  const commodityOptions = ["Padi", "Jagung", "Kedelai", "Cabai", "Tomat", "Kentang"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="heroicons:information-circle" className="w-5 h-5" />
            Informasi Dasar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district">Kabupaten *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                placeholder="Masukkan kabupaten"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="village">Desa *</Label>
              <Input
                id="village"
                value={formData.village}
                onChange={(e) => handleInputChange("village", e.target.value)}
                placeholder="Masukkan desa"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="farmerGroup">Nama Kelompok Tani *</Label>
              <Input
                id="farmerGroup"
                value={formData.farmerGroup}
                onChange={(e) => handleInputChange("farmerGroup", e.target.value)}
                placeholder="Masukkan nama kelompok tani"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="groupLeader">Ketua Kelompok *</Label>
              <Input
                id="groupLeader"
                value={formData.groupLeader}
                onChange={(e) => handleInputChange("groupLeader", e.target.value)}
                placeholder="Masukkan nama ketua kelompok"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farming Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="heroicons:leaf" className="w-5 h-5" />
            Detail Pertanian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="commodity">Komoditas *</Label>
              <select
                id="commodity"
                value={formData.commodity}
                onChange={(e) => handleInputChange("commodity", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Pilih komoditas</option>
                {commodityOptions.map(commodity => (
                  <option key={commodity} value={commodity}>{commodity}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="totalArea">Total Luas (ha) *</Label>
              <Input
                id="totalArea"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.totalArea}
                onChange={(e) => handleInputChange("totalArea", e.target.value)}
                placeholder="0.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="affectedArea">Luas Terserang (ha) *</Label>
              <Input
                id="affectedArea"
                type="number"
                step="0.1"
                min="0.1"
                value={formData.affectedArea}
                onChange={(e) => handleInputChange("affectedArea", e.target.value)}
                placeholder="0.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Prioritas</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange("priority", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="LOW">Rendah</option>
                <option value="MEDIUM">Sedang</option>
                <option value="HIGH">Tinggi</option>
                <option value="URGENT">Mendesak</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Jenis OPT (Organisme Pengganggu Tanaman) *</Label>
            <div className="flex flex-wrap gap-2">
              {pestTypeOptions.map((pestType) => (
                <Badge
                  key={pestType}
                  variant={formData.pestTypes.includes(pestType) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handlePestTypeToggle(pestType)}
                >
                  {pestType}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Letter Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="heroicons:document-text" className="w-5 h-5" />
            Informasi Surat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="letterNumber">Nomor Surat *</Label>
              <Input
                id="letterNumber"
                value={formData.letterNumber}
                onChange={(e) => handleInputChange("letterNumber", e.target.value)}
                placeholder="Masukkan nomor surat"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="letterDate">Tanggal Surat *</Label>
              <Input
                id="letterDate"
                type="date"
                value={formData.letterDate}
                onChange={(e) => handleInputChange("letterDate", e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>File Surat</Label>
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Upload surat rekomendasi (PDF/Image, max 5MB)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Drug Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="heroicons:beaker" className="w-5 h-5" />
            Permintaan Obat
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Obat #{index + 1}</h4>
                {items.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Icon icon="heroicons:trash" className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Nama Obat *</Label>
                  <Input
                    placeholder="Masukkan nama obat"
                    value={item.medicineId}
                    onChange={(e) => updateItem(index, "medicineId", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Jumlah *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="0"
                    value={item.requestedQuantity}
                    onChange={(e) => updateItem(index, "requestedQuantity", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Satuan *</Label>
                  <Input
                    placeholder="kg, liter, dll"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Catatan</Label>
                <Textarea
                  placeholder="Catatan tambahan (opsional)"
                  value={item.notes}
                  onChange={(e) => updateItem(index, "notes", e.target.value)}
                />
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full"
          >
            <Icon icon="heroicons:plus" className="w-4 h-4 mr-2" />
            Tambah Obat
          </Button>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="heroicons:chat-bubble-left-right" className="w-5 h-5" />
            Informasi Tambahan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Catatan Tambahan</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Catatan tambahan atau informasi khusus (opsional)"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button type="button" variant="outline">
          Batal
        </Button>
        <Button type="submit" className="min-w-[120px]">
          <Icon icon="heroicons:paper-airplane" className="w-4 h-4 mr-2" />
          Kirim Pengajuan
        </Button>
      </div>
    </form>
  );
};

export default TransactionSubmissionForm;
