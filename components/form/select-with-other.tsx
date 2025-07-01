import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Check, X } from "lucide-react";

interface SelectWithOtherProps {
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAddNew?: (newOption: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SelectWithOther: React.FC<SelectWithOtherProps> = ({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi",
  onAddNew,
  disabled = false,
  className,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__other__") {
      setShowCustomInput(true);
      setCustomValue("");
    } else {
      onChange(selectedValue);
      setShowCustomInput(false);
    }
  };

  const handleAddCustom = () => {
    if (customValue.trim()) {
      onChange(customValue.trim());
      onAddNew?.(customValue.trim());
      setShowCustomInput(false);
      setCustomValue("");
    }
  };

  const handleCancelCustom = () => {
    setShowCustomInput(false);
    setCustomValue("");
  };

  if (showCustomInput) {
    return (
      <div className={`flex gap-2 ${className}`}>
        <Input
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="Masukkan opsi baru..."
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddCustom();
            } else if (e.key === "Escape") {
              handleCancelCustom();
            }
          }}
          autoFocus
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleAddCustom}
          disabled={!customValue.trim() || disabled}
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={handleCancelCustom}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Select onValueChange={handleSelectChange} value={value} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
        <SelectItem value="__other__" className="text-primary">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Lainnya...
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}; 