"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// Import all dashboard widgets
import {
  StockWidget,
  TransactionWidget,
  ExpiringDrugsWidget,
  SubmissionWidget,
  UserWidget,
  QuickActionsWidget
} from "@/components/blocks";

// Import mock data
import {
  mockStockData,
  mockTransactionData,
  mockExpiringDrugsData,
  mockSubmissionData,
  mockUserData,
  mockQuickActions
} from "@/lib/data/dashboard-demo";

// Type for user roles
type UserRole = 'admin' | 'ppl' | 'dinas' | 'popt';

// Mock user - in real implementation, get from auth context/session
const MOCK_USER = {
  role: 'admin' as UserRole,
  name: 'Admin User',
  district: 'Kabupaten Sragen'
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading] = useState(false);
  const userRole = MOCK_USER.role;

  // Handle action clicks - navigate to appropriate pages
  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'stock-detail':
      case 'low-stock-alert':
      case 'stock-report':
        router.push('/inventory');
        break;
      case 'transaction-detail':
      case 'daily-transactions':
      case 'monthly-transactions':
      case 'transaction-report':
      case 'transaction-history':
        router.push('/transactions/list');
        break;
      case 'expiring-detail':
      case 'expiring-drugs':
      case 'urgent-expiring':
      case 'urgent-action':
        router.push('/inventory?filter=expiring');
        break;
      case 'submission-list':
      case 'pending-submissions':
      case 'approved-submissions':
      case 'rejected-submissions':
        router.push('/transactions/list');
        break;
      case 'user-management':
      case 'active-users':
        router.push('/users');
        break;
      default:
        console.log(`Navigation not implemented for: ${actionType}`);
    }
  };

  // Handle quick action clicks
  const handleQuickActionClick = (action: any) => {
    if (action.href) {
      router.push(action.href);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Selamat datang, {MOCK_USER.name} - {MOCK_USER.district}
          </p>
        </div>
      </div>

      {/* Dashboard Content - Admin View */}
      {userRole === 'admin' && (
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
              onActionClick={() => handleActionClick('monthly-transactions')}
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
              onActionClick={handleQuickActionClick}
            />
          </div>
        </>
      )}
    </div>
  );
}
