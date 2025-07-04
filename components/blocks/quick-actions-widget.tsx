// # START OF Quick Actions Widget - Widget for displaying quick action buttons
// Purpose: Display role-based quick action buttons for common tasks
// Props/Params: QuickAction array and user role information
// Returns: JSX element for quick actions widget
// Dependencies: UI components, icons, utility functions

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { QuickAction, BaseWidgetProps } from "@/lib/types/dashboard";
import Link from "next/link";

interface QuickActionsWidgetProps extends BaseWidgetProps {
  actions: QuickAction[];
  userRole: string;
  maxActions?: number;
  layout?: 'grid' | 'list';
  onActionClick?: (action: QuickAction) => void;
}

const QuickActionsWidget = ({ 
  actions,
  userRole,
  maxActions = 6,
  layout = 'grid',
  className,
  loading = false,
  onActionClick
}: QuickActionsWidgetProps) => {

  // Filter actions based on user role
  const filteredActions = actions.filter(action => 
    !action.role || action.role.includes(userRole)
  ).slice(0, maxActions);

  if (loading) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-default-200 animate-pulse" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-24 bg-default-200 rounded animate-pulse" />
                <div className="h-3 w-32 bg-default-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const handleActionClick = (action: QuickAction) => {
    if (onActionClick) {
      onActionClick(action);
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <Badge className="text-xs">
            {filteredActions.length} actions
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {filteredActions.length === 0 ? (
          <div className="text-center py-8">
            <Icon 
              icon="heroicons:squares-2x2" 
              className="h-12 w-12 text-default-400 mx-auto mb-2" 
            />
            <p className="text-sm text-default-500">
              Tidak ada aksi yang tersedia untuk role Anda
            </p>
          </div>
        ) : (
          <div className={cn(
            layout === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 gap-3" 
              : "space-y-3"
          )}>
            {filteredActions.map((action) => (
              <div key={action.id}>
                {action.href ? (
                  <Link href={action.href} className="block">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full h-auto p-3 justify-start",
                        "hover:bg-default-50 transition-colors duration-200"
                      )}
                      onClick={() => handleActionClick(action)}
                    >
                      <ActionContent action={action} />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full h-auto p-3 justify-start",
                      "hover:bg-default-50 transition-colors duration-200"
                    )}
                    onClick={() => handleActionClick(action)}
                  >
                    <ActionContent action={action} />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Separate component for action content to avoid duplication
const ActionContent = ({ action }: { action: QuickAction }) => (
  <>
    <div className={cn(
      "h-10 w-10 rounded-lg flex items-center justify-center mr-3 flex-shrink-0",
      action.bgColor
    )}>
      <Icon 
        icon={action.icon} 
        className={cn("h-5 w-5", action.color)} 
      />
    </div>
    <div className="text-left flex-1">
      <div className="font-medium text-sm text-default-900">
        {action.title}
      </div>
      <div className="text-xs text-default-600">
        {action.description}
      </div>
    </div>
  </>
);

export { QuickActionsWidget };

// # END OF Quick Actions Widget 