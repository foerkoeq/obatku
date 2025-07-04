// # START OF Process Wizard Components Index - Central export for all wizard components
// Purpose: Provide centralized exports for easy importing of wizard components
// Usage: import { WizardLayout, Step1Validation } from '@/components/transactions/process-wizard'
// Dependencies: All wizard step components

// Main wizard layout
export { WizardLayout } from './wizard-layout';

// Individual step components
export { Step1Validation } from './step-1-validation';
export { Step2Photography } from './step-2-photography';
export { Step3DocumentGeneration } from './step-3-document-generation';
export { Step4FileUpload } from './step-4-file-upload';
export { Step5Submission } from './step-5-submission';

// Re-export wizard state type for convenience
export type { WizardState } from '@/app/(dashboard)/transactions/outgoing/process/[id]/page';

// # END OF Process Wizard Components Index 