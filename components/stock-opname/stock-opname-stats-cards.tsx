// # START OF Stock Opname Stats Cards Component
// Purpose: Display stock opname statistics with clickable filter functionality
// Pattern: Follows inventory-stats-cards.tsx pattern

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/react";
import { colorBank, ColorBankKey } from "@/components/ui/color-bank";
import { cn } from "@/lib/utils";
import { StockOpnameStats } from "@/lib/types/stock-opname";

interface StockOpnameStatsCardsProps {
  stats: StockOpnameStats;
  onFilterClick?: (filterType: 'all' | 'checked' | 'unchecked' | 'discrepancy' | null) => void;
  activeFilter?: 'all' | 'checked' | 'unchecked' | 'discrepancy' | null;
}

const StockOpnameStatsCards: React.FC<StockOpnameStatsCardsProps> = ({
  stats,
  onFilterClick,
  activeFilter,
}) => {
  const cards = [
    {
      id: 'total' as const,
      label: 'Total Item',
      value: stats.totalItems,
      icon: 'heroicons:clipboard-document-list',
      colorKey: 'blue' as ColorBankKey,
      filterType: 'all' as const,
      description: 'Jenis pestisida',
    },
    {
      id: 'checked' as const,
      label: 'Sudah Dicek',
      value: stats.checkedItems,
      icon: 'heroicons:check-badge',
      colorKey: 'emerald' as ColorBankKey,
      filterType: 'checked' as const,
      description: `${stats.completionPercentage}% selesai`,
    },
    {
      id: 'matched' as const,
      label: 'Stok Sesuai',
      value: stats.matchedItems,
      icon: 'heroicons:hand-thumb-up',
      colorKey: 'teal' as ColorBankKey,
      filterType: 'checked' as const,
      description: 'Tidak ada selisih',
    },
    {
      id: 'discrepancy' as const,
      label: 'Ada Selisih',
      value: stats.discrepancyItems,
      icon: 'heroicons:exclamation-triangle',
      colorKey: 'rose' as ColorBankKey,
      filterType: 'discrepancy' as const,
      description: 'Perlu investigasi',
    },
  ];

  const handleCardClick = (filterType: 'all' | 'checked' | 'unchecked' | 'discrepancy' | null) => {
    if (onFilterClick) {
      if (activeFilter === filterType) {
        onFilterClick(null);
      } else {
        onFilterClick(filterType);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const colors = colorBank[card.colorKey];
        const isActive = activeFilter === card.filterType;

        return (
          <Card
            key={card.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg border-2 relative",
              isActive
                ? `${colors.bgLight} ${colors.border} shadow-md`
                : `${colors.bgLight} ${colors.border} hover:shadow-md`
            )}
            onClick={() => handleCardClick(card.filterType)}
          >
            {isActive && (
              <div
                className={cn(
                  "absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-[10px] font-medium",
                  "flex items-center gap-0.5 shadow-sm",
                  `${colors.bg} text-white`
                )}
              >
                <Icon icon="heroicons:check-circle" className="w-2.5 h-2.5" />
                <span>Aktif</span>
              </div>
            )}

            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-2">
                  <div
                    className={cn(
                      "text-2xl font-bold mb-1",
                      isActive ? colors.text : colors.textLight
                    )}
                  >
                    {card.value}
                  </div>
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isActive ? colors.text : "text-default-600"
                    )}
                  >
                    {card.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {card.description}
                  </div>
                </div>
                <div
                  className={cn(
                    "p-2 rounded-lg transition-colors flex-shrink-0",
                    isActive
                      ? `${colors.bg} text-white`
                      : `${colors.bg} text-white opacity-80`
                  )}
                >
                  <Icon icon={card.icon} className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StockOpnameStatsCards;

// # END OF Stock Opname Stats Cards Component
