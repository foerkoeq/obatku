// # START OF Multi Select With Create Component - Enhanced multi-select with create new option
// Purpose: Provide a multi-select component that allows creating new options on the fly
// Props: value, onChange, options, placeholder, onCreate, loading, disabled, className
// Returns: JSX element with multi-select and create functionality
// Dependencies: React, shadcn/ui components, Lucide icons

"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CreateFormData {
  name: string;
  description?: string;
  [key: string]: any;
}

interface MultiSelectWithCreateProps {
  value?: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  onCreate?: (data: CreateFormData) => Promise<SelectOption>;
  createButtonText?: string;
  createDialogTitle?: string;
  createDialogDescription?: string;
  createFormFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'textarea';
    required?: boolean;
    placeholder?: string;
  }>;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  maxSelections?: number;
  showSelectedCount?: boolean;
}

export const MultiSelectWithCreate: React.FC<MultiSelectWithCreateProps> = ({
  value = [],
  onChange,
  options,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari opsi...",
  emptyMessage = "Tidak ada opsi ditemukan.",
  onCreate,
  createButtonText = "Tambah Baru",
  createDialogTitle = "Tambah Opsi Baru",
  createDialogDescription = "Buat opsi baru untuk ditambahkan ke daftar.",
  createFormFields = [
    { name: 'name', label: 'Nama', type: 'text', required: true },
    { name: 'description', label: 'Deskripsi', type: 'textarea', required: false }
  ],
  loading = false,
  disabled = false,
  className,
  maxSelections,
  showSelectedCount = true,
}) => {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateFormData>({});

  const selectedOptions = useMemo(() => {
    return options.filter((option) => value.includes(option.value));
  }, [options, value]);

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      if (maxSelections && value.length >= maxSelections) {
        toast.error(`Maksimal ${maxSelections} pilihan`);
        return;
      }
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleCreate = async () => {
    if (!onCreate) return;

    setCreateLoading(true);
    try {
      const newOption = await onCreate(createFormData);
      onChange([...value, newOption.value]);
      setCreateDialogOpen(false);
      setCreateFormData({});
      toast.success("Opsi berhasil ditambahkan");
    } catch (error) {
      console.error("Error creating option:", error);
      toast.error("Gagal menambahkan opsi");
    } finally {
      setCreateLoading(false);
    }
  };

  const updateCreateFormData = (field: string, fieldValue: any) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: fieldValue
    }));
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Selected Items Display */}
      {selectedOptions.length > 0 && (
        <div className="mb-2">
          <div className="flex flex-wrap gap-2">
            {selectedOptions.map((option) => (
              <Badge key={option.value} variant="secondary" className="pr-1">
                {option.label}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => handleRemove(option.value)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          {showSelectedCount && (
            <p className="text-xs text-muted-foreground mt-1">
              {selectedOptions.length} item dipilih
              {maxSelections && ` (maksimal ${maxSelections})`}
            </p>
          )}
        </div>
      )}

      {/* Select Trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memuat...
              </>
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-4">
                    {emptyMessage}
                  </p>
                  {onCreate && (
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" />
                          {createButtonText}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>{createDialogTitle}</DialogTitle>
                          <DialogDescription>
                            {createDialogDescription}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {createFormFields.map((field) => (
                            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor={field.name} className="text-right">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                              </Label>
                              <div className="col-span-3">
                                {field.type === 'textarea' ? (
                                  <Textarea
                                    id={field.name}
                                    placeholder={field.placeholder}
                                    value={createFormData[field.name] || ''}
                                    onChange={(e) => updateCreateFormData(field.name, e.target.value)}
                                    required={field.required}
                                  />
                                ) : (
                                  <Input
                                    id={field.name}
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={createFormData[field.name] || ''}
                                    onChange={(e) => updateCreateFormData(field.name, e.target.value)}
                                    required={field.required}
                                  />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCreateDialogOpen(false)}
                            disabled={createLoading}
                          >
                            Batal
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCreate}
                            disabled={createLoading}
                          >
                            {createLoading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            {createLoading ? "Menyimpan..." : "Simpan"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    disabled={option.disabled}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
                {onCreate && (
                  <CommandItem
                    onSelect={() => setCreateDialogOpen(true)}
                    className="text-primary"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {createButtonText}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelectWithCreate;

// # END OF Multi Select With Create Component
