// # START OF Transaction Search Component - Search functionality for transactions
// Purpose: Provide search functionality with debounced input and filters
// Props: value, onChange, placeholder, className, advancedFilters
// Returns: Search input with advanced filter options
// Dependencies: Input, Button, useDebounce hook

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupText } from "@/components/ui/input-group";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

interface TransactionSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showAdvanced?: boolean;
  onAdvancedSearch?: (filters: SearchFilters) => void;
}

interface SearchFilters {
  letterNumber?: string;
  bppOfficer?: string;
  farmerGroup?: string;
  commodity?: string;
  district?: string;
}

const TransactionSearch: React.FC<TransactionSearchProps> = ({
  value,
  onChange,
  placeholder = "Cari nomor surat, petugas BPP, kelompok tani...",
  className,
  showAdvanced = false,
  onAdvancedSearch,
}) => {
  const [searchValue, setSearchValue] = useState(value);
  const [showAdvancedPopover, setShowAdvancedPopover] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<SearchFilters>({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onChange]);

  const handleClear = () => {
    setSearchValue("");
    onChange("");
  };

  const handleAdvancedFilter = (key: keyof SearchFilters, value: string) => {
    const updated = { ...advancedFilters, [key]: value };
    setAdvancedFilters(updated);
    onAdvancedSearch?.(updated);
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({});
    onAdvancedSearch?.({});
  };

  const hasActiveFilters = Object.values(advancedFilters).some(value => value && value.trim() !== '');
  const activeFilterCount = Object.values(advancedFilters).filter(value => value && value.trim() !== '').length;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Search */}
      <div className="flex gap-2">
        <div className="flex-1">
          <InputGroup>
            <InputGroupText>
              <Icon icon="heroicons:magnifying-glass" className="h-4 w-4 text-default-400" />
            </InputGroupText>
            <Input
              placeholder={placeholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-10"
            />
            {searchValue && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-6 w-6 p-0 hover:bg-default-100"
                >
                  <Icon icon="heroicons:x-mark" className="h-3 w-3" />
                  <span className="sr-only">Clear search</span>
                </Button>
              </div>
            )}
          </InputGroup>
        </div>

        {showAdvanced && (
          <Popover open={showAdvancedPopover} onOpenChange={setShowAdvancedPopover}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className={cn(
                  "relative",
                  hasActiveFilters && "border-primary bg-primary/5"
                )}
              >
                <Icon icon="heroicons:adjustments-horizontal" className="h-4 w-4 mr-2" />
                Filter Lanjut
                {hasActiveFilters && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-primary text-primary-foreground"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm">Filter Pencarian Lanjut</h4>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAdvancedFilters}
                      className="h-auto p-1 text-xs text-red-600 hover:text-red-700"
                    >
                      Reset
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-default-700 mb-1 block">
                      Nomor Surat
                    </label>
                    <Input
                      placeholder="Cari nomor surat..."
                      value={advancedFilters.letterNumber || ''}
                      onChange={(e) => handleAdvancedFilter('letterNumber', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-default-700 mb-1 block">
                      Petugas BPP
                    </label>
                    <Input
                      placeholder="Cari nama petugas..."
                      value={advancedFilters.bppOfficer || ''}
                      onChange={(e) => handleAdvancedFilter('bppOfficer', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-default-700 mb-1 block">
                      Kelompok Tani
                    </label>
                    <Input
                      placeholder="Cari kelompok tani..."
                      value={advancedFilters.farmerGroup || ''}
                      onChange={(e) => handleAdvancedFilter('farmerGroup', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-default-700 mb-1 block">
                      Komoditas
                    </label>
                    <Input
                      placeholder="Cari komoditas..."
                      value={advancedFilters.commodity || ''}
                      onChange={(e) => handleAdvancedFilter('commodity', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-default-700 mb-1 block">
                      Kabupaten
                    </label>
                    <Input
                      placeholder="Cari kabupaten..."
                      value={advancedFilters.district || ''}
                      onChange={(e) => handleAdvancedFilter('district', e.target.value)}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedPopover(false)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(advancedFilters).map(([key, value]) => {
            if (!value || value.trim() === '') return null;
            
            const labels: Record<string, string> = {
              letterNumber: 'No. Surat',
              bppOfficer: 'Petugas BPP',
              farmerGroup: 'Kelompok Tani',
              commodity: 'Komoditas',
              district: 'Kabupaten'
            };

            return (
              <Badge 
                key={key} 
                className="text-xs flex items-center gap-1 bg-secondary text-secondary-foreground"
              >
                {labels[key]}: {value}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAdvancedFilter(key as keyof SearchFilters, '')}
                  className="h-3 w-3 p-0 hover:bg-transparent"
                >
                  <Icon icon="heroicons:x-mark" className="h-2 w-2" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionSearch;

// # END OF Transaction Search Component 