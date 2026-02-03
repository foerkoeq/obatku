"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, MapPin, User, Phone, Users, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SubmissionFormData } from "./schema";
import { useFarmerGroups } from "@/hooks/use-master-data";
import { FarmerGroup } from "@/lib/services/master-data.service";
import { TUBAN_DATA } from "@/lib/data/tuban-data";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Step1BasicInfo() {
  const { control, watch, setValue } = useFormContext<SubmissionFormData>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  
  // Watchers
  const district = watch("district") || "";
  const selectedGroupId = watch("farmerGroupId");
  const village = watch("village");

  // Local data for districts and villages
  const availableDistricts = TUBAN_DATA.map(d => d.name);
  const [availableVillages, setAvailableVillages] = useState<string[]>([]);

  // Data Hooks
  const { 
    farmerGroups, 
    loading: loadingGroups, 
    error: groupsError,
    createFarmerGroup,
    updateFarmerGroup,
    refetch: refetchGroups
  } = useFarmerGroups({ 
    district: district || undefined, 
    status: 'ACTIVE' 
  });
  
  // Handle District Change - Update village list and reset fields
  const handleDistrictChange = (newDistrict: string) => {
    setValue("district", newDistrict);
    setValue("village", ""); // Reset village
    setValue("farmerGroupId", ""); // Reset farmer group

    const selectedDistrictData = TUBAN_DATA.find(d => d.name === newDistrict);
    setAvailableVillages(selectedDistrictData ? selectedDistrictData.villages.map(v => v.name) : []);
  };

  // Handle Group Selection - Auto-fill data
  useEffect(() => {
    if (selectedGroupId && farmerGroups.length > 0) {
      const group = farmerGroups.find(g => g.id === selectedGroupId);
      if (group) {
        setValue("farmerGroupName", group.name);
        setValue("groupLeader", group.leader || "");
        setValue("village", group.village || "");
        setValue("phoneNumber", group.contactInfo?.phone || "");
        // Set land area if available (will be used in step 2)
        if ((group as any).landArea) {
          setValue("landArea", (group as any).landArea);
        }
      }
    }
  }, [selectedGroupId, farmerGroups, setValue]);

  // Create/Edit Group Form State
  const [groupForm, setGroupForm] = useState({
    district: district || "",
    village: "",
    name: "",
    leader: "",
    phone: "",
    landArea: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isCreateModalOpen) {
      setGroupForm({
        district: district || "",
        village: village || "",
        name: "",
        leader: "",
        phone: "",
        landArea: "",
      });
    }
  }, [isCreateModalOpen, district, village]);

  // Load group data for editing
  useEffect(() => {
    if (isEditModalOpen && editingGroupId) {
      const group = farmerGroups.find(g => g.id === editingGroupId);
      if (group) {
        setGroupForm({
          district: group.district,
          village: group.village,
          name: group.name,
          leader: group.leader || "",
          phone: group.contactInfo?.phone || "",
          landArea: ((group as any).landArea || "").toString(),
        });
      }
    }
  }, [isEditModalOpen, editingGroupId, farmerGroups]);

  const handleCreateGroup = async () => {
    if (!groupForm.name || !groupForm.village || !groupForm.leader) {
      toast.error("Mohon lengkapi semua field yang wajib");
      return;
    }

    try {
      const newGroup: FarmerGroup | undefined = await createFarmerGroup({
        name: groupForm.name,
        leader: groupForm.leader,
        district: groupForm.district,
        village: groupForm.village,
        establishedDate: new Date().toISOString(),
        memberCount: 10, // default value
        contactInfo: {
          phone: groupForm.phone || undefined,
        },
        // landArea is not part of the core FarmerGroup model
        // landArea: groupForm.landArea ? parseFloat(groupForm.landArea) : undefined,
      });

      // Auto-select the newly created group
      if (newGroup?.id) {
        setValue("farmerGroupId", newGroup.id);
        setValue("farmerGroupName", newGroup.name);
        setValue("groupLeader", newGroup.leader || "");
        setValue("village", newGroup.village || "");
        setValue("phoneNumber", newGroup.contactInfo?.phone || "");
      }

      setIsCreateModalOpen(false);
      toast.success("Kelompok tani berhasil ditambahkan");
    } catch (error: any) {
      console.error("Error creating group:", error);
      toast.error(error?.message || "Gagal menambahkan kelompok tani");
    }
  };

  const handleEditGroup = async () => {
    if (!editingGroupId || !groupForm.name || !groupForm.village || !groupForm.leader) {
      toast.error("Mohon lengkapi semua field yang wajib");
      return;
    }

    try {
      await updateFarmerGroup(editingGroupId, {
        name: groupForm.name,
        leader: groupForm.leader,
        district: groupForm.district,
        village: groupForm.village,
        contactInfo: {
          phone: groupForm.phone || undefined,
        },
        // landArea is not part of the core FarmerGroup model
        // landArea: groupForm.landArea ? parseFloat(groupForm.landArea) : undefined,
      });

      // Refresh groups and update form if this is the selected group
      await refetchGroups();
      if (selectedGroupId === editingGroupId) {
        setValue("farmerGroupName", groupForm.name);
        setValue("groupLeader", groupForm.leader);
        setValue("village", groupForm.village);
        setValue("phoneNumber", groupForm.phone || "");
      }

      setIsEditModalOpen(false);
      setEditingGroupId(null);
      toast.success("Kelompok tani berhasil diperbarui");
    } catch (error: any) {
      console.error("Error updating group:", error);
      toast.error(error?.message || "Gagal memperbarui kelompok tani");
    }
  };

  const handleEditClick = () => {
    if (selectedGroupId) {
      setEditingGroupId(selectedGroupId);
      setIsEditModalOpen(true);
    } else {
      toast.error("Pilih kelompok tani terlebih dahulu");
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          Lengkapi informasi dasar pemohon dan kelompok tani. Data yang sudah ada akan terisi otomatis.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* District (Selectable) */}
        <FormField
          control={control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Kecamatan *
              </FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleDistrictChange(value);
                }} 
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={"Pilih Kecamatan"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDistricts.map((dist) => (
                    <SelectItem key={dist} value={dist}>
                      {dist}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Pilih kecamatan di Kabupaten Tuban
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Village */}
        <FormField
          control={control}
          name="village"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Desa *
              </FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value || ""}
                disabled={!district}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !district 
                          ? "Pilih kecamatan terlebih dahulu" 
                          : "Pilih Desa"
                      } 
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableVillages.length > 0 ? (
                    availableVillages.map((village) => (
                      <SelectItem key={village} value={village}>
                        {village}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      { !district ? "Pilih kecamatan terlebih dahulu" : "Tidak ada data desa" }
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Farmer Group */}
        <div className="md:col-span-2">
          <FormField
            control={control}
            name="farmerGroupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Kelompok Tani *
                </FormLabel>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                      disabled={loadingGroups || !district || !village}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue 
                            placeholder={
                              !district || !village
                                ? "Pilih kecamatan dan desa terlebih dahulu"
                                : loadingGroups 
                                  ? "Memuat kelompok tani..." 
                                  : "Pilih Kelompok Tani"
                            } 
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {farmerGroups.length > 0 ? (
                          farmerGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-data" disabled>
                            {!district || !village
                              ? "Pilih kecamatan dan desa terlebih dahulu"
                              : groupsError 
                                ? "Gagal memuat data" 
                                : "Tidak ada data"}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={handleEditClick}
                    disabled={!selectedGroupId || loadingGroups || !district || !village}
                    title="Edit kelompok tani"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateModalOpen(true)}
                    disabled={loadingGroups || !district || !village}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah
                  </Button>
                </div>
                <FormDescription>
                  Pilih kelompok tani yang sudah ada, atau tambah kelompok tani baru
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Leader */}
        <FormField
          control={control}
          name="groupLeader"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Ketua Kelompok *
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nama Ketua" />
              </FormControl>
              <FormDescription>
                Nama ketua kelompok tani (terisi otomatis jika memilih kelompok yang sudah ada)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone - Optional */}
        <FormField
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                No. HP
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="08..." type="tel" />
              </FormControl>
              <FormDescription>
                Nomor HP ketua kelompok tani (opsional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Create Group Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tambah Kelompok Tani Baru</DialogTitle>
            <DialogDescription>
              Isi data kelompok tani baru. Data ini akan tersimpan dan dapat digunakan untuk pengajuan berikutnya.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kecamatan *</Label>
                <Select 
                  value={groupForm.district} 
                  onValueChange={(v) => setGroupForm({...groupForm, district: v, village: ""})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((dist) => (
                      <SelectItem key={dist} value={dist}>
                        {dist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Desa *</Label>
                <Select 
                  value={groupForm.village} 
                  onValueChange={(v) => setGroupForm({...groupForm, village: v})}
                  disabled={!groupForm.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!groupForm.district ? "Pilih Kecamatan dulu" : "Pilih Desa"} />
                  </SelectTrigger>
                  <SelectContent>
                    {groupForm.district ? (
                      availableVillages.map((village) => (
                        <SelectItem key={village} value={village}>
                          {village}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        Pilih kecamatan terlebih dahulu
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama Kelompok Tani *</Label>
              <Input 
                value={groupForm.name}
                onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                placeholder="Contoh: Tani Makmur"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ketua Kelompok *</Label>
                <Input 
                  value={groupForm.leader}
                  onChange={(e) => setGroupForm({...groupForm, leader: e.target.value})}
                  placeholder="Nama Ketua"
                />
              </div>
              <div className="space-y-2">
                <Label>No. HP</Label>
                <Input 
                  value={groupForm.phone}
                  onChange={(e) => setGroupForm({...groupForm, phone: e.target.value})}
                  placeholder="08..."
                  type="tel"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Luas Lahan (Ha)</Label>
              <Input 
                type="number"
                step="0.01"
                value={groupForm.landArea}
                onChange={(e) => setGroupForm({...groupForm, landArea: e.target.value})}
                placeholder="0.0"
              />
              <p className="text-xs text-muted-foreground">
                Luas lahan total yang dimiliki kelompok tani
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleCreateGroup}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Kelompok Tani</DialogTitle>
            <DialogDescription>
              Perbarui data kelompok tani yang dipilih.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kecamatan *</Label>
                <Select 
                  value={groupForm.district} 
                  onValueChange={(v) => setGroupForm({...groupForm, district: v, village: ""})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kecamatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map((dist) => (
                      <SelectItem key={dist} value={dist}>
                        {dist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Desa *</Label>
                <Select 
                  value={groupForm.village} 
                  onValueChange={(v) => setGroupForm({...groupForm, village: v})}
                  disabled={!groupForm.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!groupForm.district ? "Pilih Kecamatan dulu" : "Pilih Desa"} />
                  </SelectTrigger>
                  <SelectContent>
                    {groupForm.district ? (
                      availableVillages.map((village) => (
                        <SelectItem key={village} value={village}>
                          {village}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        Pilih kecamatan terlebih dahulu
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama Kelompok Tani *</Label>
              <Input 
                value={groupForm.name}
                onChange={(e) => setGroupForm({...groupForm, name: e.target.value})}
                placeholder="Contoh: Tani Makmur"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ketua Kelompok *</Label>
                <Input 
                  value={groupForm.leader}
                  onChange={(e) => setGroupForm({...groupForm, leader: e.target.value})}
                  placeholder="Nama Ketua"
                />
              </div>
              <div className="space-y-2">
                <Label>No. HP</Label>
                <Input 
                  value={groupForm.phone}
                  onChange={(e) => setGroupForm({...groupForm, phone: e.target.value})}
                  placeholder="08..."
                  type="tel"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Luas Lahan (Ha)</Label>
              <Input 
                type="number"
                step="0.01"
                value={groupForm.landArea}
                onChange={(e) => setGroupForm({...groupForm, landArea: e.target.value})}
                placeholder="0.0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setEditingGroupId(null);
            }}>
              Batal
            </Button>
            <Button onClick={handleEditGroup}>
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
