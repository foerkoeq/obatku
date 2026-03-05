// # START OF TrxStatusBadge - Status badge for new transaction statuses
// Purpose: Display transaction status with color, icon, and label
// Props: status, size, className
// Returns: Styled badge with icon
// Dependencies: Badge, Icon, transaction-list types

"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { TrxStatus, TRX_STATUS_CONFIG } from "@/lib/types/transaction-list";

interface TrxStatusBadgeProps {
  status: TrxStatus;
  size?: "sm" | "md";
  className?: string;
}

const TrxStatusBadge: React.FC<TrxStatusBadgeProps> = ({
  status,
  size = "md",
  className,
}) => {
  const config = TRX_STATUS_CONFIG[status];

  return (
    <Badge
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border whitespace-nowrap",
        config.bgColor,
        config.color,
        config.borderColor,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <Icon icon={config.icon} className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5", "flex-shrink-0")} />
      {config.label}
    </Badge>
  );
};

export default TrxStatusBadge;

// # END OF TrxStatusBadge
