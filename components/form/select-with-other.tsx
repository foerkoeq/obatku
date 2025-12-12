// # START OF Select With Other Component - Enhanced select with "Others" option
// Purpose: Provides a select component that allows adding custom options via "Lainnya" option
// Features: Dynamic option addition, custom input handling, react-hook-form compatible
// Returns: Select component with "Others" functionality
// Dependencies: React, shadcn/ui components, Lucide icons

import React, { useState, useEffect, useMemo } from "react";
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
  otherOptionLabel?: string;
  customInputPlaceholder?: string;
}

export const SelectWithOther: React.FC<SelectWithOtherProps> = ({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi",
  onAddNew,
  disabled = false,
  className,
  otherOptionLabel = "Lainnya",
  customInputPlaceholder = "Masukkan opsi baru...",
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");

  // Filter out "Lainnya" from options to avoid duplication
  // This must be called before any conditional returns to follow rules of hooks
  const filteredOptions = useMemo(() => {
    return options.filter((opt) => opt.value !== "__other__" && opt.label !== otherOptionLabel);
  }, [options, otherOptionLabel]);

  // Check if current value is a custom value (not in filtered options)
  const isCustomValue = useMemo(() => {
    if (!value) return false;
    return !filteredOptions.some((opt) => opt.value === value);
  }, [value, filteredOptions]);

  // Combine options with custom value if it exists
  const allOptions = useMemo(() => {
    const baseOptions = [...filteredOptions];
    if (isCustomValue && value) {
      // Add custom value as an option if it's not already in the list
      if (!baseOptions.some((opt) => opt.value === value)) {
        baseOptions.push({ value, label: value });
      }
    }
    return baseOptions;
  }, [filteredOptions, isCustomValue, value]);

  // Initialize custom input if value is custom
  // This useEffect must be called before any conditional returns
  useEffect(() => {
    if (isCustomValue && value && !showCustomInput) {
      setCustomValue(value);
      setShowCustomInput(true);
    }
  }, [isCustomValue, value, showCustomInput]);

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "__other__") {
      setShowCustomInput(true);
      setCustomValue(value && isCustomValue ? value : "");
    } else {
      onChange(selectedValue);
      setShowCustomInput(false);
    }
  };

  const handleAddCustom = () => {
    const trimmedValue = customValue.trim();
    if (trimmedValue) {
      onChange(trimmedValue);
      onAddNew?.(trimmedValue);
      setShowCustomInput(false);
      setCustomValue("");
    }
  };

  const handleCancelCustom = () => {
    setShowCustomInput(false);
    // Reset custom input value
    setCustomValue("");
    // If we're canceling a new entry (not an existing custom value), don't change the form value
    // The form will keep its previous value
  };

  // Determine if we should show custom input
  const shouldShowCustomInput = showCustomInput || (isCustomValue && value);

  // Always return the same structure to avoid hooks issues
  return (
    <div className={className}>
      {shouldShowCustomInput ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={customInputPlaceholder}
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
              className="flex-1"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleAddCustom}
              disabled={!customValue.trim() || disabled}
              title="Simpan"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={handleCancelCustom}
              disabled={disabled}
              title="Batal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isCustomValue && value && (
            <p className="text-xs text-muted-foreground">
              Opsi kustom: <span className="font-medium">{value}</span>
            </p>
          )}
        </div>
      ) : (
        <Select onValueChange={handleSelectChange} value={value || ""} disabled={disabled}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder}>
              {isCustomValue && value ? value : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {allOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value="__other__" className="text-primary font-medium">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {otherOptionLabel}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
// # END OF Select With Other Component 