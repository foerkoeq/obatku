// # START OF Filter Sidebar Component - Advanced filtering for inventory data
// Purpose: Provide comprehensive filtering options for drug inventory
// Props: filters, onFiltersChange, categories, suppliers, onReset
// Returns: Collapsible sidebar with filter controls
// Dependencies: Sheet, Button, Select, DatePicker, Input, Checkbox

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@iconify/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { InventoryFilters, DrugCategory, Supplier, StockStatus } from "@/lib/types/inventory";

interface FilterSidebarProps {
  filters: InventoryFilters;
  onFiltersChange: (filters: InventoryFilters) => void;
  categories: DrugCategory[];
  suppliers: Supplier[];
  onReset: () => void;
  className?: string;
}

const statusOptions: { value: StockStatus; label: string }[] = [
  { value: 'normal', label: 'Stok Normal' },
  { value: 'low', label: 'Stok Menipis' },
  { value: 'expired', label: 'Kadaluarsa' },
  { value: 'near_expiry', label: 'Mendekati Kadaluarsa' },
];

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  categories,
  suppliers,
  onReset,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<InventoryFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.category, categoryId]
      : filters.category.filter(id => id !== categoryId);
    updateFilters({ category: updatedCategories });
  };

  const handleSupplierChange = (supplierId: string, checked: boolean) => {
    const updatedSuppliers = checked
      ? [...filters.supplier, supplierId]
      : filters.supplier.filter(id => id !== supplierId);
    updateFilters({ supplier: updatedSuppliers });
  };

  const handleStatusChange = (status: StockStatus, checked: boolean) => {
    const updatedStatus = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    updateFilters({ status: updatedStatus });
  };

  const FilterContent = () => (
    <div className="space-y-6 p-4">
      {/* Reset Button */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-default-900">Filter Data</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="text-xs"
        >
          <Icon icon="heroicons:arrow-path" className="w-3 h-3 mr-1" />
          Reset
        </Button>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Kategori Obat</Label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={filters.category.includes(category.id)}
                onCheckedChange={(checked) => 
                  handleCategoryChange(category.id, checked as boolean)
                }
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Supplier</Label>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="flex items-center space-x-2">
              <Checkbox
                id={`supplier-${supplier.id}`}
                checked={filters.supplier.includes(supplier.id)}
                onCheckedChange={(checked) => 
                  handleSupplierChange(supplier.id, checked as boolean)
                }
              />
              <Label
                htmlFor={`supplier-${supplier.id}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {supplier.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status Stok</Label>
        <div className="space-y-2">
          {statusOptions.map((status) => (
            <div key={status.value} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status.value}`}
                checked={filters.status.includes(status.value)}
                onCheckedChange={(checked) => 
                  handleStatusChange(status.value, checked as boolean)
                }
              />
              <Label
                htmlFor={`status-${status.value}`}
                className="text-sm font-normal cursor-pointer flex-1"
              >
                {status.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Stock Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Rentang Stok</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-default-500">Min</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.stockRange.min || ''}
              onChange={(e) => updateFilters({
                stockRange: {
                  ...filters.stockRange,
                  min: e.target.value ? parseInt(e.target.value) : undefined
                }
              })}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs text-default-500">Max</Label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.stockRange.max || ''}
              onChange={(e) => updateFilters({
                stockRange: {
                  ...filters.stockRange,
                  max: e.target.value ? parseInt(e.target.value) : undefined
                }
              })}
              className="h-8"
            />
          </div>
        </div>
      </div>

      {/* Expiry Date Range Filter */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Rentang Tanggal Kadaluarsa</Label>
        <div className="space-y-2">
          <div>
            <Label className="text-xs text-default-500">Dari Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-8 justify-start text-left font-normal",
                    !filters.expiryRange.start && "text-muted-foreground"
                  )}
                >
                  <Icon icon="heroicons:calendar-days" className="mr-2 h-4 w-4" />
                  {filters.expiryRange.start ? (
                    format(filters.expiryRange.start, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.expiryRange.start}
                  onSelect={(date) => updateFilters({
                    expiryRange: { ...filters.expiryRange, start: date }
                  })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="text-xs text-default-500">Sampai Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-8 justify-start text-left font-normal",
                    !filters.expiryRange.end && "text-muted-foreground"
                  )}
                >
                  <Icon icon="heroicons:calendar-days" className="mr-2 h-4 w-4" />
                  {filters.expiryRange.end ? (
                    format(filters.expiryRange.end, "PPP", { locale: id })
                  ) : (
                    <span>Pilih tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.expiryRange.end}
                  onSelect={(date) => updateFilters({
                    expiryRange: { ...filters.expiryRange, end: date }
                  })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="outline" size="sm">
            <Icon icon="heroicons:funnel" className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filter Data Stok</SheetTitle>
          </SheetHeader>
          <FilterContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Filter Sidebar */}
      <div className={cn("hidden lg:block w-80 border-r bg-background", className)}>
        <FilterContent />
      </div>
    </>
  );
};

export default FilterSidebar;

// # END OF Filter Sidebar Component 