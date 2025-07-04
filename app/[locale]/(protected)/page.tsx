// # START OF Main Dashboard Page - Complete dashboard with role-based widgets
// Purpose: Display comprehensive dashboard with widgets based on user role
// Features: Role-based widget display, responsive layout, interactive actions
// Returns: Complete dashboard interface with all widgets
// Dependencies: Dashboard widgets, mock data, navigation

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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
  role: 'admin' as UserRole, // Change this to test different roles: 'admin', 'ppl', 'dinas', 'popt'
  name: 'Admin User',
  district: 'Kabupaten Sragen'
};

const DashboardPage = () => {
  const router = useRouter();
  const [loading] = useState(false);
  const userRole = MOCK_USER.role;

  // Handle action clicks - navigate to appropriate pages
  const handleActionClick = (actionType: string) => {
    console.log(`Action clicked: ${actionType}`);
    
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
    console.log(`Quick action clicked: ${action.title}`);
    if (action.href) {
      router.push(action.href);
    }
  };

  // Render widgets based on user role
  const renderDashboardContent = () => {
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
                onActionClick={handleQuickActionClick}
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
                onActionClick={handleQuickActionClick}
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
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <p className="text-xs text-default-400 mt-1">
            {MOCK_USER.name} • {MOCK_USER.district}
          </p>
        </div>
      </div>

      {/* Role indicator for development */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
        <p className="text-xs text-primary-700">
          <strong>Mode Development:</strong> Saat ini menampilkan dashboard untuk role "{userRole}". 
          Ubah MOCK_USER.role di kode untuk melihat dashboard role lain.
        </p>
      </div>

      {/* Dashboard Content */}
      {renderDashboardContent()}
    </div>
  );
};

export default DashboardPage;

// # END OF Main Dashboard Page
