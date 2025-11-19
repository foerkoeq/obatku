// # START OF Filter Sidebar Component - Advanced filtering for inventory data
// Purpose: Provide comprehensive filtering options for drug inventory
// Props: filters, onFiltersChange, categories, suppliers, onReset
// Returns: Collapsible sidebar with filter controls
// Dependencies: Sheet, Button, Select, DatePicker, Input, Checkbox, Accordion

"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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

  const updateFilters = useCallback((updates: Partial<InventoryFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  }, [filters, onFiltersChange]);

  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    const updatedCategories = checked
      ? [...filters.category, categoryId]
      : filters.category.filter(id => id !== categoryId);
    updateFilters({ category: updatedCategories });
  }, [filters.category, updateFilters]);

  const handleSupplierChange = useCallback((supplierName: string, checked: boolean) => {
    const updatedSuppliers = checked
      ? [...filters.supplier, supplierName]
      : filters.supplier.filter(name => name !== supplierName);
    updateFilters({ supplier: updatedSuppliers });
  }, [filters.supplier, updateFilters]);

  const handleStatusChange = useCallback((status: StockStatus, checked: boolean) => {
    const updatedStatus = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    updateFilters({ status: updatedStatus });
  }, [filters.status, updateFilters]);

  const FilterContent = () => (
    <div className="space-y-4 p-4">
      {/* Reset Button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-default-900 text-lg">Filter Lanjutan</h3>
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

      <Accordion type="multiple" defaultValue={["category", "status"]} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:tag" className="w-4 h-4" />
              Kategori Obat
              {filters.category.length > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {filters.category.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
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
          </AccordionContent>
        </AccordionItem>

        {/* Supplier Filter */}
        <AccordionItem value="supplier">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:building-office" className="w-4 h-4" />
              Sumber
              {filters.supplier.length > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {filters.supplier.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 max-h-48 overflow-y-auto pt-2">
              {suppliers.map((supplier) => (
                <div key={supplier.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`supplier-${supplier.id}`}
                    checked={filters.supplier.includes(supplier.name)}
                    onCheckedChange={(checked) => 
                      handleSupplierChange(supplier.name, checked as boolean)
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
          </AccordionContent>
        </AccordionItem>

        {/* Status Filter */}
        <AccordionItem value="status">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:chart-bar" className="w-4 h-4" />
              Status Stok
              {filters.status.length > 0 && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {filters.status.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 pt-2">
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
          </AccordionContent>
        </AccordionItem>

        {/* Stock Range Filter */}
        <AccordionItem value="stock">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:cube" className="w-4 h-4" />
              Rentang Stok
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <Label className="text-xs text-default-500 mb-1 block">Min</Label>
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
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-xs text-default-500 mb-1 block">Max</Label>
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
                  className="h-9"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Expiry Date Range Filter */}
        <AccordionItem value="expiry">
          <AccordionTrigger className="text-sm font-medium">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:calendar-days" className="w-4 h-4" />
              Tanggal Kadaluarsa
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs text-default-500 mb-1 block">Dari Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-9 justify-start text-left font-normal",
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
                <Label className="text-xs text-default-500 mb-1 block">Sampai Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-9 justify-start text-left font-normal",
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon icon="heroicons:funnel" className="w-4 h-4" />
          Filter Lanjutan
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Lanjutan</SheetTitle>
        </SheetHeader>
        <FilterContent />
      </SheetContent>
    </Sheet>
  );
};

export default FilterSidebar;

// # END OF Filter Sidebar Component 