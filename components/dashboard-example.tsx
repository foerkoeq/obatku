// # START OF Dashboard Example - Example implementation of dashboard widgets
// Purpose: Demonstrate how to use all dashboard widgets for different user roles
// Props/Params: UserRole for role-based widget display
// Returns: JSX element showing complete dashboard layout
// Dependencies: All dashboard widgets, mock data, utility functions

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  StockWidget,
  TransactionWidget,
  ExpiringDrugsWidget,
  SubmissionWidget,
  UserWidget,
  QuickActionsWidget
} from "./blocks";
import {
  mockStockData,
  mockTransactionData,
  mockExpiringDrugsData,
  mockSubmissionData,
  mockUserData,
  mockQuickActions
} from "@/lib/data/dashboard-demo";

interface DashboardExampleProps {
  userRole: 'admin' | 'ppl' | 'dinas' | 'popt';
  className?: string;
}

const DashboardExample = ({ 
  userRole, 
  className 
}: DashboardExampleProps) => {
  const [loading] = useState(false);

  // Handle action clicks
  const handleActionClick = (actionType: string) => {
    console.log(`Action clicked: ${actionType}`);
    // Implement navigation or modal logic here
  };

  // Render widgets based on user role
  const renderWidgetsByRole = () => {
    switch (userRole) {
      case 'admin':
        return (
          <>
            {/* Row 1 - Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StockWidget
                data={mockStockData}
                variant="total"
                loading={loading}
                onActionClick={() => handleActionClick('stock-detail')}
              />
              <TransactionWidget
                data={mockTransactionData}
                variant="daily"
                loading={loading}
                onActionClick={() => handleActionClick('transaction-detail')}
              />
              <ExpiringDrugsWidget
                data={mockExpiringDrugsData}
                variant="expiring-soon"
                loading={loading}
                onActionClick={() => handleActionClick('expiring-detail')}
              />
              <UserWidget
                data={mockUserData}
                variant="total"
                loading={loading}
                onActionClick={() => handleActionClick('user-management')}
              />
            </div>

            {/* Row 2 - Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StockWidget
                data={mockStockData}
                variant="low-stock"
                loading={loading}
                onActionClick={() => handleActionClick('low-stock-alert')}
              />
              <TransactionWidget
                data={mockTransactionData}
                variant="monthly"
                loading={loading}
                onActionClick={() => handleActionClick('monthly-report')}
              />
              <ExpiringDrugsWidget
                data={mockExpiringDrugsData}
                variant="urgent"
                loading={loading}
                onActionClick={() => handleActionClick('urgent-action')}
              />
              <UserWidget
                data={mockUserData}
                variant="active"
                loading={loading}
                onActionClick={() => handleActionClick('active-users')}
              />
            </div>

            {/* Row 3 - Value & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <StockWidget
                  data={mockStockData}
                  variant="value"
                  loading={loading}
                  onActionClick={() => handleActionClick('stock-report')}
                />
                <TransactionWidget
                  data={mockTransactionData}
                  variant="value"
                  loading={loading}
                  onActionClick={() => handleActionClick('transaction-report')}
                />
              </div>
              <QuickActionsWidget
                actions={mockQuickActions}
                userRole={userRole}
                loading={loading}
                onActionClick={(action) => handleActionClick(action.id)}
              />
            </div>
          </>
        );

      case 'ppl':
        return (
          <>
            {/* Row 1 - PPL Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <SubmissionWidget
                data={mockSubmissionData}
                variant="total"
                loading={loading}
                onActionClick={() => handleActionClick('submission-list')}
              />
              <SubmissionWidget
                data={mockSubmissionData}
                variant="pending"
                loading={loading}
                onActionClick={() => handleActionClick('pending-submissions')}
              />
              <TransactionWidget
                data={mockTransactionData}
                variant="monthly"
                loading={loading}
                onActionClick={() => handleActionClick('transaction-history')}
              />
            </div>

            {/* Row 2 - Progress & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <SubmissionWidget
                  data={mockSubmissionData}
                  variant="approved"
                  loading={loading}
                  onActionClick={() => handleActionClick('approved-submissions')}
                />
                <SubmissionWidget
                  data={mockSubmissionData}
                  variant="rejected"
                  loading={loading}
                  onActionClick={() => handleActionClick('rejected-submissions')}
                />
              </div>
              <QuickActionsWidget
                actions={mockQuickActions}
                userRole={userRole}
                loading={loading}
                onActionClick={(action) => handleActionClick(action.id)}
              />
            </div>
          </>
        );

      case 'dinas':
      case 'popt':
        return (
          <>
            {/* Row 1 - Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <StockWidget
                data={mockStockData}
                variant="total"
                loading={loading}
                onActionClick={() => handleActionClick('stock-detail')}
              />
              <StockWidget
                data={mockStockData}
                variant="low-stock"
                loading={loading}
                onActionClick={() => handleActionClick('low-stock-alert')}
              />
              <TransactionWidget
                data={mockTransactionData}
                variant="daily"
                loading={loading}
                onActionClick={() => handleActionClick('daily-transactions')}
              />
              <TransactionWidget
                data={mockTransactionData}
                variant="monthly"
                loading={loading}
                onActionClick={() => handleActionClick('monthly-transactions')}
              />
            </div>

            {/* Row 2 - Alerts & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <ExpiringDrugsWidget
                  data={mockExpiringDrugsData}
                  variant="expiring-soon"
                  loading={loading}
                  onActionClick={() => handleActionClick('expiring-drugs')}
                />
                <ExpiringDrugsWidget
                  data={mockExpiringDrugsData}
                  variant="urgent"
                  loading={loading}
                  onActionClick={() => handleActionClick('urgent-expiring')}
                />
              </div>
              <QuickActionsWidget
                actions={mockQuickActions}
                userRole={userRole}
                loading={loading}
                onActionClick={(action) => handleActionClick(action.id)}
              />
            </div>
          </>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-default-500">Role tidak dikenali</p>
          </div>
        );
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-default-900">
            Dashboard {userRole.toUpperCase()}
          </h1>
          <p className="text-sm text-default-600 mt-1">
            Selamat datang di sistem manajemen obat pertanian
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-default-500">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Widgets */}
      {renderWidgetsByRole()}
    </div>
  );
};

export { DashboardExample };

// # END OF Dashboard Example 