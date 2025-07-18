// ================================================
// SUBMISSION MODULE INTEGRATION EXAMPLE
// ================================================

import { PrismaClient } from '@prisma/client';
import { SubmissionService } from './submissions.service';
import { SubmissionRepository } from './submissions.repository';
import { SubmissionController } from './submissions.controller';
import { createSubmissionRoutes } from './submissions.routes';
import { POPTActivityType, SubmissionPriority } from './submissions.types';

// ================================================
// DEPENDENCY INJECTION SETUP
// ================================================

export class SubmissionModuleFactory {
  private prisma: PrismaClient;
  private inventoryService: any;
  private fileService: any;
  private notificationService: any;

  constructor(
    prisma: PrismaClient,
    inventoryService: any,
    fileService: any,
    notificationService: any
  ) {
    this.prisma = prisma;
    this.inventoryService = inventoryService;
    this.fileService = fileService;
    this.notificationService = notificationService;
  }

  createSubmissionModule() {
    // Create repository
    const submissionRepository = new SubmissionRepository(this.prisma);

    // Create service with dependencies
    const submissionService = new SubmissionService(
      submissionRepository,
      this.inventoryService,
      this.fileService,
      this.notificationService
    );

    // Create controller
    const submissionController = new SubmissionController(submissionService);

    // Create routes
    const submissionRoutes = createSubmissionRoutes(submissionController);

    return {
      repository: submissionRepository,
      service: submissionService,
      controller: submissionController,
      routes: submissionRoutes
    };
  }
}

// ================================================
// USAGE EXAMPLE IN MAIN APPLICATION
// ================================================

/*
// In your main.ts or app.ts

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { SubmissionModuleFactory } from './submission-integration';

// Initialize dependencies
const app = express();
const prisma = new PrismaClient();

// Mock services for example (replace with actual implementations)
const inventoryService = {
  getMedicineById: async (id: string) => {
    return await prisma.medicine.findUnique({ where: { id } });
  },
  getTotalStock: async (medicineId: string) => {
    const stocks = await prisma.medicineStock.findMany({
      where: { medicineId },
      select: { currentStock: true }
    });
    return stocks.reduce((total, stock) => total + Number(stock.currentStock), 0);
  },
  allocateStock: async (submissionItemId: string, quantity: number, submissionId: string) => {
    // Implement stock allocation logic
    console.log(`Allocating ${quantity} units for submission ${submissionId}`);
  }
};

const fileService = {
  uploadFile: async (file: Express.Multer.File, path: string) => {
    // Implement file upload logic
    return {
      url: `/uploads/${path}/${file.filename}`,
      filename: file.filename,
      size: file.size
    };
  }
};

const notificationService = {
  notifyNewSubmission: async (submission: any) => {
    // Send notification to DINAS users
    console.log(`New submission created: ${submission.submissionNumber}`);
  },
  notifyStatusUpdate: async (submission: any, previousStatus: any) => {
    // Send notification about status change
    console.log(`Submission ${submission.submissionNumber} status changed from ${previousStatus} to ${submission.status}`);
  }
};

// Create submission module
const submissionFactory = new SubmissionModuleFactory(
  prisma,
  inventoryService,
  fileService,
  notificationService
);

const submissionModule = submissionFactory.createSubmissionModule();

// Register routes
app.use('/api/v1/submissions', submissionModule.routes);

// Example API usage:

// 1. PPL creates submission
POST /api/v1/submissions
Content-Type: multipart/form-data
Authorization: Bearer <ppl-token>

{
  "district": "Bandung",
  "village": "Cibiru",
  "farmerGroup": "Tani Maju",
  "groupLeader": "Budi Santoso",
  "commodity": "Padi",
  "totalArea": 10.5,
  "affectedArea": 5.0,
  "pestTypes": ["wereng coklat", "ulat grayak"],
  "letterNumber": "LTR/POPT/001/2024",
  "letterDate": "2024-01-15",
  "items": [
    {
      "medicineId": "medicine-uuid-1",
      "requestedQuantity": 10,
      "unit": "liter",
      "notes": "Untuk mengatasi serangan wereng"
    }
  ]
}
// File: letterFile (PDF/image)

// 2. POPT creates emergency submission
POST /api/v1/submissions
Content-Type: application/json
Authorization: Bearer <popt-token>

{
  "district": "Sumedang", 
  "village": "Jatinangor",
  "farmerGroup": "Sumber Rejeki",
  "groupLeader": "Andi Pratama",
  "commodity": "Jagung",
  "totalArea": 15.0,
  "affectedArea": 8.0,
  "pestTypes": ["ulat tentara"],
  "activityType": "PEST_CONTROL",
  "urgencyReason": "Serangan hama ulat tentara dalam skala besar terdeteksi di area seluas 8 hektar. Dibutuhkan penanganan segera untuk mencegah penyebaran ke area lain.",
  "requestedBy": "Kepala Dinas Pertanian Sumedang",
  "activityDate": "2024-02-01",
  "items": [
    {
      "medicineId": "medicine-uuid-2",
      "requestedQuantity": 20,
      "unit": "kg"
    }
  ]
}

// 3. DINAS approves submission
PATCH /api/v1/submissions/{id}/approve
Content-Type: application/json
Authorization: Bearer <dinas-token>

{
  "notes": "Disetujui untuk distribusi dengan penyesuaian jumlah sesuai stok tersedia",
  "approvedItems": [
    {
      "submissionItemId": "item-uuid-1",
      "approvedQuantity": 8,
      "notes": "Disesuaikan dengan stok yang tersedia"
    }
  ]
}

// 4. Get user's submissions
GET /api/v1/submissions/my?page=1&limit=20&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <user-token>

// 5. Get submission statistics
GET /api/v1/submissions/stats
Authorization: Bearer <dinas-token>

Response:
{
  "success": true,
  "data": {
    "total": 150,
    "byStatus": {
      "PENDING": 25,
      "APPROVED": 80,
      "REJECTED": 15,
      "COMPLETED": 30
    },
    "byType": {
      "PPL_REGULAR": 100,
      "POPT_EMERGENCY": 30,
      "POPT_SCHEDULED": 20
    },
    "byPriority": {
      "LOW": 20,
      "MEDIUM": 80,
      "HIGH": 40,
      "URGENT": 10
    },
    "pendingReview": 25,
    "overdue": 5,
    "averageProcessingTime": 48
  }
}

*/

// ================================================
// FEATURE FLAGS CONFIGURATION
// ================================================

export const SUBMISSION_FEATURE_FLAGS = {
  ENABLE_POPT_SUBMISSIONS: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_BULK_OPERATIONS: false, // Future feature
  ENABLE_EXPORT_FUNCTIONS: false, // Future feature
  ENABLE_REAL_TIME_NOTIFICATIONS: false, // Future feature
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_SUBMISSION_TEMPLATES: false, // Future feature
  
  // Role-based features
  PPL_CAN_EDIT_APPROVED: false,
  POPT_CAN_APPROVE_OWN: false,
  AUTO_APPROVE_EMERGENCY: false,
  
  // Workflow features
  REQUIRE_LETTER_FOR_PPL: true,
  REQUIRE_URGENCY_FOR_POPT: true,
  ENABLE_MULTI_STAGE_APPROVAL: false, // Future feature
  
  // Performance features
  ENABLE_SUBMISSION_CACHING: true,
  ENABLE_SEARCH_INDEXING: false, // Future feature
  
  // Integration features
  ENABLE_STOCK_INTEGRATION: true,
  ENABLE_QR_CODE_INTEGRATION: false, // Future feature
  ENABLE_EXTERNAL_NOTIFICATIONS: false // Future feature
};

// ================================================
// CONFIGURATION EXAMPLES
// ================================================

export const SUBMISSION_CONFIG = {
  // File upload settings
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    UPLOAD_PATH: 'uploads/submissions/letters'
  },
  
  // Pagination settings
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_SORT: 'createdAt',
    DEFAULT_ORDER: 'desc'
  },
  
  // Business rules
  BUSINESS_RULES: {
    OVERDUE_DAYS: 7,
    AUTO_EXPIRE_DAYS: 30,
    MIN_URGENCY_REASON_LENGTH: 10,
    MAX_SUBMISSION_ITEMS: 20,
    MAX_PEST_TYPES: 10
  },
  
  // Priority mapping
  PRIORITY_MAPPING: {
    [POPTActivityType.EMERGENCY_RESPONSE]: SubmissionPriority.URGENT,
    [POPTActivityType.PEST_CONTROL]: SubmissionPriority.HIGH,
    [POPTActivityType.SURVEILLANCE]: SubmissionPriority.MEDIUM,
    [POPTActivityType.TRAINING_DEMO]: SubmissionPriority.LOW,
    [POPTActivityType.FIELD_INSPECTION]: SubmissionPriority.MEDIUM
  }
};

export default SubmissionModuleFactory;
