// # START OF Wizard Layout Component - Mobile-first layout for multi-step process wizard
// Purpose: Provide consistent layout structure for all wizard steps with progress tracking
// Features: Progress stepper, mobile-first design, sticky navigation, responsive layout
// Props: steps, currentStep, onStepClick, onExit, children, transaction, isLoading, error
// Dependencies: Progress components, responsive design utilities

"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Transaction } from "@/lib/types/transaction";
import { cn } from "@/lib/utils";

interface WizardStep {
  id: number;
  title: string;
  description: string;
}

interface WizardLayoutProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  onExit: () => void;
  children: ReactNode;
  transaction?: Transaction | null;
  isLoading?: boolean;
  error?: string | null;
}

export const WizardLayout: React.FC<WizardLayoutProps> = ({
  steps,
  currentStep,
  onStepClick,
  onExit,
  children,
  transaction,
  isLoading = false,
  error = null,
}) => {
  const router = useRouter();
  const currentStepData = steps.find(step => step.id === currentStep);
  const progressPercentage = (currentStep / steps.length) * 100;

  // Mobile-first: Stack layout for small screens, side-by-side for larger
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              className="p-2"
            >
              <Icon icon="lucide:arrow-left" className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-gray-100">
                Proses Pengeluaran
              </h1>
              {transaction && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {transaction.letterNumber}
                </p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {currentStep}/{steps.length}
          </Badge>
        </div>
        
        {/* Mobile Progress Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentStepData?.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {currentStepData?.description}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-screen lg:min-h-[calc(100vh-64px)]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-80 lg:flex-shrink-0">
          <div className="flex flex-col w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Proses Pengeluaran
                </h1>
                {transaction && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {transaction.letterNumber}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <Icon icon="lucide:x" className="w-5 h-5" />
              </Button>
            </div>

            {/* Progress Steps */}
            <div className="flex-1 p-6">
              <div className="space-y-4">
                {steps.map((step, index) => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep;
                  const isClickable = step.id <= currentStep;

                  return (
                    <div
                      key={step.id}
                      className={cn(
                        "relative flex items-start cursor-pointer group",
                        !isClickable && "cursor-not-allowed opacity-50"
                      )}
                      onClick={() => isClickable && onStepClick(step.id)}
                    >
                      {/* Connection Line */}
                      {index < steps.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-4 top-8 w-0.5 h-12 transition-colors",
                            isCompleted
                              ? "bg-green-500"
                              : isActive
                              ? "bg-primary"
                              : "bg-gray-200 dark:bg-gray-600"
                          )}
                        />
                      )}

                      {/* Step Circle */}
                      <div
                        className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                          isCompleted
                            ? "bg-green-500 border-green-500 text-white"
                            : isActive
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600"
                        )}
                      >
                        {isCompleted ? (
                          <Icon icon="lucide:check" className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-semibold">{step.id}</span>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="ml-4 pb-4">
                        <h3
                          className={cn(
                            "font-medium transition-colors",
                            isActive
                              ? "text-primary"
                              : isCompleted
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-900 dark:text-gray-100"
                          )}
                        >
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transaction Info */}
            {transaction && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Info Transaksi</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">PPL:</span>
                      <span className="font-medium">{transaction.bppOfficer.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Kelompok:</span>
                      <span className="font-medium">{transaction.farmerGroup.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Komoditas:</span>
                      <span className="font-medium">{transaction.farmingDetails.commodity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Item:</span>
                      <span className="font-medium">
                        {transaction.approval?.approvedDrugs?.reduce((sum, drug) => sum + drug.approvedQuantity, 0) || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:overflow-hidden">
          <div className="h-full lg:overflow-y-auto">
            <div className="p-4 lg:p-8">
              {error ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="p-4 rounded-full bg-red-100 dark:bg-red-900">
                    <Icon icon="lucide:alert-circle" className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-sm">
                    {error}
                  </p>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Memuat...</p>
                </div>
              ) : (
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6 lg:hidden">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                      {currentStepData?.title}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {currentStepData?.description}
                    </p>
                  </div>
                  
                  {children}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// # END OF Wizard Layout Component 