// # START OF Inventory Stats Cards Component - Clickable statistics cards
// Purpose: Display inventory statistics with clickable filter functionality
// Props: data, filteredData, onFilterClick, activeFilter
// Returns: Grid of clickable stat cards with different colors

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { colorBank, ColorBankKey } from "@/components/ui/color-bank";
import { cn } from "@/lib/utils";
import { DrugInventory } from "@/lib/types/inventory";

interface InventoryStatsCardsProps {
  data: DrugInventory[];
  filteredData: DrugInventory[];
  onFilterClick?: (filterType: 'all' | 'low' | 'expired' | 'filtered' | null) => void;
  activeFilter?: 'all' | 'low' | 'expired' | 'filtered' | null;
}

const InventoryStatsCards: React.FC<InventoryStatsCardsProps> = ({
  data,
  filteredData,
  onFilterClick,
  activeFilter,
}) => {
  const stats = [
    {
      id: 'total' as const,
      label: 'Total Obat',
      value: data.length,
      icon: 'heroicons:cube',
      colorKey: 'blue' as ColorBankKey,
      filterType: 'all' as const,
    },
    {
      id: 'low' as const,
      label: 'Stok Menipis',
      value: data.filter(d => d.status === 'low').length,
      icon: 'heroicons:exclamation-triangle',
      colorKey: 'amber' as ColorBankKey,
      filterType: 'low' as const,
    },
    {
      id: 'expired' as const,
      label: 'Kadaluarsa',
      value: data.filter(d => d.status === 'expired').length,
      icon: 'heroicons:clock',
      colorKey: 'rose' as ColorBankKey,
      filterType: 'expired' as const,
    },
    {
      id: 'filtered' as const,
      label: 'Hasil Filter',
      value: filteredData.length,
      icon: 'heroicons:funnel',
      colorKey: 'emerald' as ColorBankKey,
      filterType: 'filtered' as const,
    },
  ];

  const handleCardClick = (filterType: 'all' | 'low' | 'expired' | 'filtered' | null) => {
    if (onFilterClick) {
      // Toggle filter: if already active, reset to null
      if (activeFilter === filterType) {
        onFilterClick(null);
      } else {
        onFilterClick(filterType);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const colors = colorBank[stat.colorKey];
        const isActive = activeFilter === stat.filterType;
        
        return (
          <Card
            key={stat.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg border-2 relative",
              isActive 
                ? `${colors.bgLight} ${colors.border} shadow-md` 
                : `${colors.bgLight} ${colors.border} hover:shadow-md`
            )}
            onClick={() => handleCardClick(stat.filterType)}
          >
            {/* Badge Filter Aktif - Absolute positioned, tidak mempengaruhi layout */}
            {isActive && (
              <div className={cn(
                "absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-medium",
                "flex items-center gap-0.5 shadow-sm",
                `${colors.bg} text-white`
              )}>
                <Icon icon="heroicons:check-circle" className="w-2.5 h-2.5" />
                <span>Aktif</span>
              </div>
            )}
            
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <div className={cn(
                    "text-2xl font-bold mb-1",
                    isActive ? colors.text : colors.textLight
                  )}>
                    {stat.value}
                  </div>
                  <div className={cn(
                    "text-sm",
                    isActive ? colors.text : "text-default-600"
                  )}>{stat.label}</div>
                </div>
                <div className={cn(
                  "p-2 rounded-lg transition-colors flex-shrink-0",
                  isActive ? `${colors.bg} text-white` : `${colors.bg} text-white opacity-80`
                )}>
                  <Icon icon={stat.icon} className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InventoryStatsCards;

// # END OF Inventory Stats Cards Component

