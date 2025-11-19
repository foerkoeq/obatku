// # START OF Status Indicator Component - Visual status display for drug inventory
// Purpose: Display stock status with appropriate colors and icons
// Props: status (StockStatus), className (optional)
// Returns: Badge component with status styling
// Dependencies: Badge UI component, Lucide icons, inventory types

"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { StockStatus } from "@/lib/types/inventory";

interface StatusIndicatorProps {
  status: StockStatus;
  className?: string;
}

const statusConfig = {
  normal: {
    label: "Stok Normal",
    color: "success" as const,
    icon: "heroicons:check-circle",
    bgColor: "bg-success/10",
    textColor: "text-success",
  },
  low: {
    label: "Stok Menipis",
    color: "warning" as const,
    icon: "heroicons:exclamation-triangle",
    bgColor: "bg-warning/10",
    textColor: "text-warning",
  },
  expired: {
    label: "Kadaluarsa",
    color: "destructive" as const,
    icon: "heroicons:x-circle",
    bgColor: "bg-destructive/10",
    textColor: "text-destructive",
  },
  near_expiry: {
    label: "Mendekati Kadaluarsa",
    color: "warning" as const,
    icon: "heroicons:clock",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  },
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  className 
}) => {
  const config = statusConfig[status];

  // Compact labels for table
  const compactLabels = {
    normal: 'Normal',
    low: 'Menipis',
    expired: 'Exp',
    near_expiry: 'Hampir',
  };

  return (
    <Badge
      color={config.color}
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <Icon 
        icon={config.icon} 
        className="w-2.5 h-2.5" 
      />
      <span>{compactLabels[status]}</span>
    </Badge>
  );
};

export default StatusIndicator;

// # END OF Status Indicator Component 