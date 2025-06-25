// # START OF Inventory Search Component - Search functionality for drug inventory
// Purpose: Provide search functionality with debounced input
// Props: value, onChange, placeholder, className
// Returns: Search input with icon and clear button
// Dependencies: Input, Button, useDebounce hook

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface InventorySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Custom debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const InventorySearch: React.FC<InventorySearchProps> = ({
  value,
  onChange,
  placeholder = "Cari nama obat, produsen, kategori...",
  className,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  // Update parent when debounced value changes
  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  // Update local value when prop changes (for external updates)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <InputGroup className="w-full">
        <InputGroupText>
          <Icon icon="heroicons:magnifying-glass" className="h-4 w-4 text-default-500" />
        </InputGroupText>
        <Input
          type="text"
          placeholder={placeholder}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          className="pl-0 pr-8"
        />
        {localValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-default-100"
          >
            <Icon icon="heroicons:x-mark" className="h-4 w-4" />
            <span className="sr-only">Hapus pencarian</span>
          </Button>
        )}
      </InputGroup>
      
      {/* Search suggestions or recent searches could be added here */}
      {localValue && debouncedValue !== localValue && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Icon 
            icon="heroicons:arrow-path" 
            className="h-4 w-4 text-default-400 animate-spin" 
          />
        </div>
      )}
    </div>
  );
};

export default InventorySearch;

// # END OF Inventory Search Component 