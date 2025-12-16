"use client";

import { useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
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
import { Plus, MapPin, User, Phone, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SubmissionFormData } from "./schema";
import { useFarmerGroups, useVillages } from "@/hooks/use-master-data";

// Mock Data for Tuban (Simplified)
const KECAMATAN_TUBAN = [
  "Tuban", "Palang", "Semanding", "Plumpang", "Widang", "Rengel", "Soko", "Parengan", "Singgahan", "Senori", "Bangilan", "Kenduruan", "Jatirogo", "Bancar", "Tambakboyo", "Kerek", "Merakurak", "Montong", "Grabagan", "Jenu"
];

// Mock Villages (Just a few for demo)
const DESA_MOCK: Record<string, string[]> = {
  "Tuban": ["Baturetno", "Doromukti", "Karangsari"],
  "Semanding": ["Bejagung", "Bektiharjo", "Gedongombo"],
  // ... add more as needed or fetch dynamically
};

export function Step1BasicInfo() {
  const { control, watch, setValue } = useFormContext<SubmissionFormData>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Watchers
  const district = watch("district");
  const selectedGroupId = watch("farmerGroupId");

  // Data Hooks
  const { farmerGroups } = useFarmerGroups({ district, status: 'ACTIVE' });
  const { villages } = useVillages(district); // Assuming this hook exists and works

  // Handle Group Selection
  useEffect(() => {
    if (selectedGroupId) {
      const group = farmerGroups.find(g => g.id === selectedGroupId);
      if (group) {
        setValue("farmerGroupName", group.name);
        setValue("groupLeader", group.leader || "");
        setValue("village", group.village || "");
        // If the group has phone/landArea in the future, set them here
        // setValue("phoneNumber", group.phone); 
        // setValue("landArea", group.landArea);
      }
    }
  }, [selectedGroupId, farmerGroups, setValue]);

  // Create Group Form State
  const [newGroup, setNewGroup] = useState({
    district: district,
    village: "",
    name: "",
    leader: "",
    phone: "",
    landArea: "",
  });

  const handleCreateGroup = () => {
    // In a real app, call API to create group
    // For now, we simulate it and select it
    console.log("Creating group:", newGroup);
    
    // Simulate adding to list (UI only for now)
    setValue("farmerGroupId", "new-id-" + Date.now()); // Mock ID
    setValue("farmerGroupName", newGroup.name);
    setValue("groupLeader", newGroup.leader);
    setValue("phoneNumber", newGroup.phone);
    setValue("village", newGroup.village);
    setValue("landArea", Number(newGroup.landArea));
    
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* District (Read Only) */}
        <FormField
          control={control}
          name="district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kecamatan</FormLabel>
              <FormControl>
                <Input {...field} disabled className="bg-muted" />
              </FormControl>
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
              <FormLabel>Desa</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Desa" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {villages.map((village) => (
                    <SelectItem key={village} value={village}>
                      {village}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Farmer Group */}
        <div className="md:col-span-2">
          <div className="flex items-end gap-2">
            <FormField
              control={control}
              name="farmerGroupId"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Kelompok Tani</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Kelompok Tani" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {farmerGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(true)}
              className="mb-2" // Align with input
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Baru
            </Button>
          </div>
        </div>

        {/* Leader */}
        <FormField
          control={control}
          name="groupLeader"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ketua Kelompok</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nama Ketua" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>No. HP</FormLabel>
              <FormControl>
                <Input {...field} placeholder="08..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Create Group Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Kelompok Tani Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kecamatan</Label>
                <Input value={district} disabled />
              </div>
              <div className="space-y-2">
                <Label>Desa</Label>
                <Select 
                  value={newGroup.village} 
                  onValueChange={(v) => setNewGroup({...newGroup, village: v})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Desa" />
                  </SelectTrigger>
                  <SelectContent>
                     {villages.map((village) => (
                      <SelectItem key={village} value={village}>
                        {village}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama Kelompok Tani</Label>
              <Input 
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                placeholder="Contoh: Tani Makmur"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ketua Kelompok</Label>
                <Input 
                  value={newGroup.leader}
                  onChange={(e) => setNewGroup({...newGroup, leader: e.target.value})}
                  placeholder="Nama Ketua"
                />
              </div>
              <div className="space-y-2">
                <Label>No. HP</Label>
                <Input 
                  value={newGroup.phone}
                  onChange={(e) => setNewGroup({...newGroup, phone: e.target.value})}
                  placeholder="08..."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Luas Lahan (Ha)</Label>
              <Input 
                type="number"
                value={newGroup.landArea}
                onChange={(e) => setNewGroup({...newGroup, landArea: e.target.value})}
                placeholder="0.0"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Batal</Button>
            <Button onClick={handleCreateGroup}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
