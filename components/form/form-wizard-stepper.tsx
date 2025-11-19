"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface WizardStep {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface FormWizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  allowStepClick?: boolean;
  className?: string;
}

export const FormWizardStepper: React.FC<FormWizardStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  allowStepClick = false,
  className,
}) => {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Progress Bar */}
      <div className="relative">
        <Progress value={progressPercentage} color="primary" size="md" className="h-2" />
        <div className="absolute -top-1 left-0 text-xs text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>
        <div className="absolute -top-1 right-0 text-xs font-medium text-primary">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isUpcoming = currentStep < step.id;

          return (
            <div
              key={step.id}
              onClick={() => {
                if (allowStepClick && onStepClick && (isCompleted || isCurrent)) {
                  onStepClick(step.id);
                }
              }}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-300",
                {
                  "border-primary bg-primary/5 shadow-md": isCurrent,
                  "border-success bg-success/5": isCompleted,
                  "border-default-200 bg-default-50": isUpcoming,
                  "cursor-pointer hover:shadow-lg hover:scale-105": allowStepClick && (isCompleted || isCurrent),
                  "cursor-default": !allowStepClick || isUpcoming,
                }
              )}
            >
              {/* Step Number/Icon */}
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full border-2 mb-3 transition-all duration-300",
                  {
                    "border-primary bg-primary text-primary-foreground shadow-lg": isCurrent,
                    "border-success bg-success text-success-foreground": isCompleted,
                    "border-default-300 bg-default-100 text-muted-foreground": isUpcoming,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" strokeWidth={3} />
                ) : step.icon ? (
                  <div className="w-6 h-6">{step.icon}</div>
                ) : (
                  <span className="text-lg font-bold">{step.id}</span>
                )}
              </div>

              {/* Step Title */}
              <h3
                className={cn("text-sm font-semibold text-center mb-1 transition-colors", {
                  "text-primary": isCurrent,
                  "text-success": isCompleted,
                  "text-muted-foreground": isUpcoming,
                })}
              >
                {step.title}
              </h3>

              {/* Step Description */}
              <p
                className={cn("text-xs text-center transition-colors", {
                  "text-primary/70": isCurrent,
                  "text-success/70": isCompleted,
                  "text-muted-foreground/70": isUpcoming,
                })}
              >
                {step.description}
              </p>

              {/* Current Step Indicator */}
              {isCurrent && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                  Current
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Compact version for mobile
export const FormWizardStepperCompact: React.FC<FormWizardStepperProps> = ({
  steps,
  currentStep,
  className,
}) => {
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;
  const currentStepData = steps.find((s) => s.id === currentStep);

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Current Step Info */}
      <div className="flex items-center gap-4 p-4 rounded-lg border-2 border-primary bg-primary/5">
        <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary bg-primary text-primary-foreground">
          {currentStepData?.icon ? (
            <div className="w-6 h-6">{currentStepData.icon}</div>
          ) : (
            <span className="text-lg font-bold">{currentStep}</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary">{currentStepData?.title}</h3>
          <p className="text-xs text-primary/70">{currentStepData?.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Step</div>
          <div className="text-lg font-bold text-primary">
            {currentStep}/{steps.length}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <Progress value={progressPercentage} color="primary" size="lg" className="h-3" />
        <div className="absolute -bottom-6 right-0 text-xs font-medium text-primary">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>
    </div>
  );
};
