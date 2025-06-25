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

  return (
    <Badge
      color={config.color}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 text-xs font-medium",
        config.bgColor,
        config.textColor,
        className
      )}
    >
      <Icon 
        icon={config.icon} 
        className="w-3 h-3" 
      />
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">
        {status === 'normal' ? 'OK' : 
         status === 'low' ? 'Low' : 
         status === 'expired' ? 'Exp' : 'Near'}
      </span>
    </Badge>
  );
};

export default StatusIndicator;

// # END OF Status Indicator Component 