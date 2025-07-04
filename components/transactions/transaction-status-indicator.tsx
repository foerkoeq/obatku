// # START OF Transaction Status Indicator Component - Visual status indicator for transactions
// Purpose: Display transaction status with appropriate colors and icons
// Props: status, priority, showText, className
// Returns: Badge with status color and icon
// Dependencies: Badge, Icon

"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@iconify/react";
import { HydrationSafe } from "@/components/ui/hydration-safe";
import { cn } from "@/lib/utils";
import { TransactionStatus, Priority } from "@/lib/types/transaction";

interface TransactionStatusIndicatorProps {
  status: TransactionStatus;
  priority?: Priority;
  showText?: boolean;
  className?: string;
}

const TransactionStatusIndicator: React.FC<TransactionStatusIndicatorProps> = ({
  status,
  priority,
  showText = true,
  className,
}) => {
  const getStatusConfig = (status: TransactionStatus) => {
    switch (status) {
      case 'draft':
        return {
          icon: 'heroicons:document-text',
          text: 'Draft',
          color: 'text-default-600 bg-default-100',
        };
      case 'submitted':
        return {
          icon: 'heroicons:paper-airplane',
          text: 'Diajukan',
          color: 'text-blue-600 bg-blue-100',
        };
      case 'under_review':
        return {
          icon: 'heroicons:eye',
          text: 'Dalam Review',
          color: 'text-amber-600 bg-amber-100',
        };
      case 'approved':
        return {
          icon: 'heroicons:check-circle',
          text: 'Disetujui',
          color: 'text-green-600 bg-green-100',
        };
      case 'partially_approved':
        return {
          icon: 'heroicons:check-circle',
          text: 'Sebagian Disetujui',
          color: 'text-green-600 bg-green-100',
        };
      case 'rejected':
        return {
          icon: 'heroicons:x-circle',
          text: 'Ditolak',
          color: 'text-red-600 bg-red-100',
        };
      case 'ready_distribution':
        return {
          icon: 'heroicons:truck',
          text: 'Siap Distribusi',
          color: 'text-purple-600 bg-purple-100',
        };
      case 'distributing':
        return {
          icon: 'heroicons:arrow-right-circle',
          text: 'Sedang Distribusi',
          color: 'text-indigo-600 bg-indigo-100',
        };
      case 'completed':
        return {
          icon: 'heroicons:check-badge',
          text: 'Selesai',
          color: 'text-emerald-600 bg-emerald-100',
        };
      case 'cancelled':
        return {
          icon: 'heroicons:no-symbol',
          text: 'Dibatalkan',
          color: 'text-gray-600 bg-gray-100',
        };
      case 'expired':
        return {
          icon: 'heroicons:clock-x',
          text: 'Kadaluarsa',
          color: 'text-red-600 bg-red-100',
        };
      default:
        return {
          icon: 'heroicons:question-mark-circle',
          text: 'Unknown',
          color: 'text-default-600 bg-default-100',
        };
    }
  };

  const getPriorityConfig = (priority: Priority) => {
    switch (priority) {
      case 'urgent':
        return {
          icon: 'heroicons:exclamation-triangle',
          text: 'Mendesak',
          color: 'text-red-600 border-red-600',
        };
      case 'high':
        return {
          icon: 'heroicons:arrow-up',
          text: 'Tinggi',
          color: 'text-orange-600 border-orange-600',
        };
      case 'medium':
        return {
          icon: 'heroicons:minus',
          text: 'Sedang',
          color: 'text-amber-600 border-amber-600',
        };
      case 'low':
        return {
          icon: 'heroicons:arrow-down',
          text: 'Rendah',
          color: 'text-green-600 border-green-600',
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusConfig(status);
  const priorityConfig = priority ? getPriorityConfig(priority) : null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge 
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 text-xs font-medium border-0",
          statusConfig.color
        )}
      >
        <HydrationSafe fallback={<div className="h-3 w-3 bg-current opacity-50 rounded-sm" />}>
          <Icon icon={statusConfig.icon} className="h-3 w-3 flex-shrink-0" />
        </HydrationSafe>
        {showText && statusConfig.text}
      </Badge>

      {priorityConfig && (
        <Badge 
          className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 text-xs border bg-transparent",
            priorityConfig.color
          )}
        >
          <HydrationSafe fallback={<div className="h-3 w-3 bg-current opacity-50 rounded-sm" />}>
            <Icon icon={priorityConfig.icon} className="h-3 w-3 flex-shrink-0" />
          </HydrationSafe>
          {showText && (
            <span className="hidden sm:inline">{priorityConfig.text}</span>
          )}
        </Badge>
      )}
    </div>
  );
};

// Helper function to get status group for filtering
export const getStatusGroup = (status: TransactionStatus): string => {
  switch (status) {
    case 'draft':
    case 'submitted':
    case 'under_review':
      return 'pending';
    case 'approved':
    case 'partially_approved':
    case 'ready_distribution':
    case 'distributing':
      return 'approved';
    case 'completed':
      return 'completed';
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return 'rejected';
    default:
      return 'unknown';
  }
};

// Helper function to check if status needs action
export const statusNeedsAction = (status: TransactionStatus, userRole: string): boolean => {
  switch (userRole) {
    case 'dinas':
      return ['submitted', 'under_review'].includes(status);
    case 'popt':
    case 'staff':
      return ['approved', 'ready_distribution'].includes(status);
    case 'ppl':
      return status === 'draft';
    default:
      return false;
  }
};

export default TransactionStatusIndicator;

// # END OF Transaction Status Indicator Component 