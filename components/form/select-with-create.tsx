// # START OF Select With Create Component - Enhanced select with create new option
// Purpose: Provide a select component that allows creating new options on the fly
// Props: value, onChange, options, placeholder, onCreate, loading, disabled, className
// Returns: JSX element with select and create functionality
// Dependencies: React, shadcn/ui components, Lucide icons

"use client";

import React, { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

interface SelectWithCreateProps {
  value?: string;
  onChange: (value: string) => void;
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
  allowClear?: boolean;
  onClear?: () => void;
}

export const SelectWithCreate: React.FC<SelectWithCreateProps> = ({
  value,
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
  allowClear = false,
  onClear,
}) => {
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateFormData>({});

  const selectedOption = useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  const handleCreate = async () => {
    if (!onCreate) return;

    setCreateLoading(true);
    try {
      const newOption = await onCreate(createFormData);
      onChange(newOption.value);
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

  const handleClear = () => {
    onChange("");
    onClear?.();
  };

  const updateCreateFormData = (field: string, fieldValue: any) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: fieldValue
    }));
  };

  return (
    <div className={cn("w-full", className)}>
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
            ) : selectedOption ? (
              <>
                {selectedOption.label}
                {selectedOption.description && (
                  <span className="text-muted-foreground ml-2">
                    - {selectedOption.description}
                  </span>
                )}
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
                    onSelect={(currentValue) => {
                      onChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }}
                    disabled={option.disabled}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
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
      
      {allowClear && value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="mt-2 h-8 px-2 lg:px-3"
        >
          Hapus pilihan
        </Button>
      )}
    </div>
  );
};

export default SelectWithCreate;

// # END OF Select With Create Component
