"use client";

import React, { useState } from "react";
import { Warehouse, Plus, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface StorageLocation {
  id: string;
  warehouse: string;
  storageArea: string;
  rack: string;
}

interface MultiLocationStorageManagerProps {
  locations: StorageLocation[];
  onChange: (locations: StorageLocation[]) => void;
  className?: string;
}

// Default options - dalam aplikasi real, ini bisa diambil dari backend
const defaultWarehouses = ["Gudang A", "Gudang B", "Gudang C", "Gudang Utama"];
const defaultStorageAreas = ["Area 1", "Area 2", "Area 3", "Area Khusus"];
const defaultRacks = ["Rak 1", "Rak 2", "Rak 3", "Rak 4", "Rak 5"];

export const MultiLocationStorageManager: React.FC<MultiLocationStorageManagerProps> = ({
  locations,
  onChange,
  className,
}) => {
  const [warehouses, setWarehouses] = useState(defaultWarehouses);
  const [storageAreas, setStorageAreas] = useState(defaultStorageAreas);
  const [racks, setRacks] = useState(defaultRacks);

  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [showAddArea, setShowAddArea] = useState(false);
  const [showAddRack, setShowAddRack] = useState(false);

  const [newWarehouse, setNewWarehouse] = useState("");
  const [newArea, setNewArea] = useState("");
  const [newRack, setNewRack] = useState("");

  const addLocation = () => {
    const newLocation: StorageLocation = {
      id: `location-${Date.now()}`,
      warehouse: "",
      storageArea: "",
      rack: "",
    };
    onChange([...locations, newLocation]);
  };

  const removeLocation = (id: string) => {
    if (locations.length > 1) {
      onChange(locations.filter((location) => location.id !== id));
    }
  };

  const updateLocation = (id: string, updates: Partial<StorageLocation>) => {
    onChange(
      locations.map((location) => (location.id === id ? { ...location, ...updates } : location))
    );
  };

  const addWarehouse = () => {
    if (newWarehouse.trim() && !warehouses.includes(newWarehouse.trim())) {
      setWarehouses([...warehouses, newWarehouse.trim()]);
      setNewWarehouse("");
      setShowAddWarehouse(false);
    }
  };

  const addArea = () => {
    if (newArea.trim() && !storageAreas.includes(newArea.trim())) {
      setStorageAreas([...storageAreas, newArea.trim()]);
      setNewArea("");
      setShowAddArea(false);
    }
  };

  const addRackOption = () => {
    if (newRack.trim() && !racks.includes(newRack.trim())) {
      setRacks([...racks, newRack.trim()]);
      setNewRack("");
      setShowAddRack(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Warehouse className="w-4 h-4" />
            Lokasi Penyimpanan
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Tentukan lokasi penyimpanan obat (dapat lebih dari 1 lokasi)
          </p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" onClick={addLocation} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Tambah Lokasi
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Tambah lokasi penyimpanan baru</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Locations */}
      <div className="space-y-4">
        {locations.map((location, index) => (
          <Card key={location.id} className="relative">
            <CardContent className="pt-6">
              {/* Location number indicator */}
              <div className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Lokasi #{index + 1}
              </div>

              {/* Delete button */}
              {locations.length > 1 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeLocation(location.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hapus lokasi ini</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Warehouse */}
                <div className="space-y-2">
                  <Label className="text-xs">Lokasi Gudang *</Label>
                  <Select
                    value={location.warehouse}
                    onValueChange={(value) => updateLocation(location.id, { warehouse: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse} value={warehouse}>
                          {warehouse}
                        </SelectItem>
                      ))}
                      <Dialog open={showAddWarehouse} onOpenChange={setShowAddWarehouse}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-primary"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah Gudang Baru
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tambah Gudang Baru</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Nama gudang..."
                              value={newWarehouse}
                              onChange={(e) => setNewWarehouse(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addWarehouse();
                                }
                              }}
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowAddWarehouse(false);
                                  setNewWarehouse("");
                                }}
                              >
                                Batal
                              </Button>
                              <Button type="button" onClick={addWarehouse}>
                                Tambah
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </SelectContent>
                  </Select>
                </div>

                {/* Storage Area */}
                <div className="space-y-2">
                  <Label className="text-xs">Tempat Penyimpanan *</Label>
                  <Select
                    value={location.storageArea}
                    onValueChange={(value) => updateLocation(location.id, { storageArea: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih area" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                      <Dialog open={showAddArea} onOpenChange={setShowAddArea}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-primary"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah Area Baru
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tambah Area Penyimpanan Baru</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Nama area..."
                              value={newArea}
                              onChange={(e) => setNewArea(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addArea();
                                }
                              }}
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowAddArea(false);
                                  setNewArea("");
                                }}
                              >
                                Batal
                              </Button>
                              <Button type="button" onClick={addArea}>
                                Tambah
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rack */}
                <div className="space-y-2">
                  <Label className="text-xs">Rak Penyimpanan *</Label>
                  <Select
                    value={location.rack}
                    onValueChange={(value) => updateLocation(location.id, { rack: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih rak" />
                    </SelectTrigger>
                    <SelectContent>
                      {racks.map((rack) => (
                        <SelectItem key={rack} value={rack}>
                          {rack}
                        </SelectItem>
                      ))}
                      <Dialog open={showAddRack} onOpenChange={setShowAddRack}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-primary"
                          >
                            <Plus className="w-4 h-4" />
                            Tambah Rak Baru
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Tambah Rak Baru</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              placeholder="Nama rak..."
                              value={newRack}
                              onChange={(e) => setNewRack(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addRackOption();
                                }
                              }}
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setShowAddRack(false);
                                  setNewRack("");
                                }}
                              >
                                Batal
                              </Button>
                              <Button type="button" onClick={addRackOption}>
                                Tambah
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location summary */}
              {location.warehouse && location.storageArea && location.rack && (
                <div className="mt-3 p-2 bg-primary/5 rounded-md border border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    📍 <span className="font-medium">{location.warehouse}</span> →{" "}
                    <span className="font-medium">{location.storageArea}</span> →{" "}
                    <span className="font-medium">{location.rack}</span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
