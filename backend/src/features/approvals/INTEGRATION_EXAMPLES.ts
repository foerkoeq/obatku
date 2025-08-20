// ============================================================================
// APPROVAL MODULE INTEGRATION EXAMPLE
// File: backend/src/app.ts (or wherever you setup your Express app)
// ============================================================================

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createApprovalsModule } from './index';

const app = express();
const prisma = new PrismaClient();

// Initialize approval module
const approvalsModule = createApprovalsModule(prisma);

// Apply approval routes
app.use('/api/approvals', approvalsModule.routes);

// ============================================================================
// APPROVAL MODULE HEALTH CHECK INTEGRATION
// ============================================================================

app.get('/api/health', async (_req, res) => {
  try {
    const healthStatus = {
      app: 'obatku-backend',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      modules: {
        approvals: approvalsModule.getHealthStatus(),
        // ... other modules
      }
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(500).json({
      app: 'obatku-backend',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ============================================================================
// APPROVAL NOTIFICATION INTEGRATION EXAMPLE
// ============================================================================

// Example: Send notifications when approval actions occur
import { EventEmitter } from 'events';

// Define notification types
interface NotificationData {
  to: string;
  type: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Mock notification function (implement with your preferred notification service)
const sendNotification = async (data: NotificationData): Promise<void> => {
  // Implementation would go here
  // Example: Send email, SMS, or push notification
  console.log(`Sending notification to ${data.to}: ${data.subject}`);
  
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
};

const notificationEmitter = new EventEmitter();

// Listen for approval events
notificationEmitter.on('approval:approved', async (data) => {
  const { submissionId, approvedItems } = data;
  
  try {
    // Send notification to PPL (submitter)
    await sendNotification({
      to: data.submitterEmail,
      type: 'approval_approved',
      subject: 'Pengajuan Obat Disetujui',
      template: 'approval-approved',
      data: {
        submissionNumber: data.submissionNumber,
        approvedItems: approvedItems,
        approverName: data.approverName,
        estimatedDelivery: data.estimatedDeliveryDate
      }
    });
    
    // Send notification to warehouse for preparation
    await sendNotification({
      to: 'warehouse@dinas.go.id',
      type: 'prepare_distribution',
      subject: 'Persiapan Distribusi Obat',
      template: 'prepare-distribution',
      data: {
        submissionId,
        approvedItems,
        farmerGroup: data.farmerGroup,
        district: data.district
      }
    });
    
    console.log(`Notifications sent for approved submission: ${submissionId}`);
  } catch (error) {
    console.error('Failed to send approval notifications:', error);
  }
});

notificationEmitter.on('approval:rejected', async (data) => {
  const { submissionId, rejectionReason, submitterEmail } = data;
  
  try {
    await sendNotification({
      to: submitterEmail,
      type: 'approval_rejected',
      subject: 'Pengajuan Obat Ditolak',
      template: 'approval-rejected',
      data: {
        submissionNumber: data.submissionNumber,
        rejectionReason,
        resubmissionGuidelines: 'https://docs.obatku.go.id/resubmission'
      }
    });
    
    console.log(`Rejection notification sent for submission: ${submissionId}`);
  } catch (error) {
    console.error('Failed to send rejection notification:', error);
  }
});

// ============================================================================
// MIDDLEWARE INTEGRATION EXAMPLE
// ============================================================================

// Define user interface
interface User {
  id: string;
  role: 'ADMIN' | 'PPL' | 'DINAS' | 'POPT';
  name: string;
  nip: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: string[];
  [key: string]: any;
}

// Define request interface
interface AuthRequest extends express.Request {
  user?: User;
}

// Mock JWT verification function (implement with your JWT library)
const verifyJWT = (token: string): User => {
  // Implementation would go here
  // Example: Verify JWT token and return user data
  console.log(`Verifying JWT token: ${token.substring(0, 20)}...`);
  
  // Mock return - replace with actual JWT verification
  return {
    id: 'mock-user-id',
    role: 'DINAS',
    name: 'Mock User',
    nip: '123456789',
    phone: '08123456789',
    status: 'ACTIVE',
    permissions: ['approve_submissions', 'view_approvals']
  };
};

// Custom middleware for approval module
const approvalMiddleware = {
  // Authentication middleware
  authenticate: (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }
    
    try {
      // Verify JWT token and attach user to request
      const user = verifyJWT(token);
      req.user = user;
      next();
      return; // Explicit return for clarity
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }
  },
  
  // Role-based authorization for approval operations
  requireDinasRole: (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }
    
    const allowedRoles = ['DINAS', 'ADMIN', 'PPL']; // Use uppercase to match UserRole enum
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions for approval operations',
        requiredRoles: 'dinas, admin, supervisor'
      });
    }
    
    next();
    return; // Explicit return for clarity
  },
  
  // Rate limiting for bulk operations
  rateLimitBulkOperations: (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
    // Implement rate limiting logic
    // Example: max 5 bulk operations per minute per user
    next();
    return; // Explicit return for clarity
  },
  
  // Request logging for audit trail
  auditLog: (req: AuthRequest, _res: express.Response, next: express.NextFunction) => {
    const auditData = {
      userId: req.user?.id,
      action: `${req.method} ${req.path}`,
      body: req.method !== 'GET' ? req.body : undefined,
      query: req.query,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };
    
    // Log to audit system
    console.log('Approval Audit:', auditData);
    
    next();
    return; // Explicit return for clarity
  }
};

// Apply middlewares to approval routes
app.use('/api/approvals', [
  approvalMiddleware.authenticate,
  approvalMiddleware.requireDinasRole,
  approvalMiddleware.auditLog
]);

// Apply specific middleware to bulk operations
app.use('/api/approvals/bulk', approvalMiddleware.rateLimitBulkOperations);

// ============================================================================
// DATABASE INTEGRATION EXAMPLE
// ============================================================================

// Example Prisma schema additions for approval workflow
/*
// Add to schema.prisma

model submissions {
  id                    String   @id @default(uuid())
  submission_number     String   @unique
  district              String
  village               String
  farmer_group          String
  group_leader          String
  commodity             String
  total_area            Decimal
  affected_area         Decimal
  pest_types            Json     // ["ulat grayak", "wereng"]
  letter_number         String
  letter_date           DateTime
  letter_file_url       String
  status                submission_status @default(pending)
  priority              submission_priority @default(medium)
  submitter_id          String
  reviewer_id           String?
  reviewed_at           DateTime?
  reviewer_notes        String?
  distributor_id        String?
  distributed_at        DateTime?
  completion_notes      String?
  created_at            DateTime @default(now())
  updated_at            DateTime @updatedAt

  submitter             users    @relation("SubmissionSubmitter", fields: [submitter_id], references: [id])
  reviewer              users?   @relation("SubmissionReviewer", fields: [reviewer_id], references: [id])
  distributor           users?   @relation("SubmissionDistributor", fields: [distributor_id], references: [id])
  
  submission_items      submission_items[]
  transactions          transactions[]

  @@index([status])
  @@index([priority])
  @@index([district])
  @@index([submitter_id])
  @@index([reviewer_id])
  @@index([created_at])
}

model submission_items {
  id                    String   @id @default(uuid())
  submission_id         String
  medicine_id           String
  requested_quantity    Decimal
  approved_quantity     Decimal  @default(0)
  distributed_quantity  Decimal  @default(0)
  unit                  String
  notes                 String?
  created_at            DateTime @default(now())

  submission            submissions @relation(fields: [submission_id], references: [id], onDelete: Cascade)
  medicine              medicines   @relation(fields: [medicine_id], references: [id])

  @@index([submission_id])
  @@index([medicine_id])
}

enum submission_status {
  pending
  under_review
  approved
  partially_approved
  rejected
  distributed
  completed
  cancelled
  expired
}

enum submission_priority {
  low
  medium
  high
  urgent
}
*/

// ============================================================================
// FRONTEND INTEGRATION EXAMPLES
// ============================================================================

// Example API client for frontend
// Note: This class is for demonstration purposes
// Uncomment and use when implementing frontend integration
/*
class ApprovalAPI {
  private baseURL = '/api/approvals';
  
  async getApprovalQueue(params: {
    status?: string;
    priority?: string;
    district?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    const response = await fetch(`${this.baseURL}?${query}`);
    return response.json();
  }
  
  async getRecommendations(submissionId: string, options?: {
    includeAlternatives?: boolean;
    maxAlternatives?: number;
    riskTolerance?: string;
  }) {
    const query = options ? '?' + new URLSearchParams(options as Record<string, string>).toString() : '';
    const response = await fetch(`${this.baseURL}/recommendations/${submissionId}${query}`);
    return response.json();
  }
  
  async processApproval(submissionId: string, approvalData: {
    action: 'approve' | 'reject' | 'partial_approve' | 'request_revision';
    notes?: string;
    approvedItems?: Array<{
      submissionItemId: string;
      approvedQuantity: number;
      selectedMedicineId?: string;
      notes?: string;
    }>;
    rejectionReason?: string;
    requestedRevisions?: string[];
  }) {
    const response = await fetch(`${this.baseURL}/${submissionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalData)
    });
    return response.json();
  }
  
  async getStatistics(params?: {
    startDate?: string;
    endDate?: string;
    district?: string;
  }) {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const response = await fetch(`${this.baseURL}/statistics${query}`);
    return response.json();
  }
}

// React Hook example for approval queue
/*
import { useState, useEffect } from 'react';

export const useApprovalQueue = (filters = {}) => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const api = new ApprovalAPI();
  
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const result = await api.getApprovalQueue(filters);
        
        if (result.success) {
          setQueue(result.data.approvals);
        } else {
          setError(result.errors?.[0] || 'Failed to load approval queue');
        }
      } catch (err) {
        setError('Network error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQueue();
  }, [JSON.stringify(filters)]);
  
  return { queue, loading, error, refetch: () => fetchQueue() };
};
*/

// ============================================================================
// WEBSOCKET INTEGRATION FOR REAL-TIME UPDATES
// ============================================================================

// Note: Uncomment and install socket.io if you need real-time features
// npm install socket.io @types/socket.io

/*
import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';

const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Define socket types
interface SocketData {
  userRole: string;
  district: string;
}

interface ApprovalUpdateData {
  submissionId: string;
  action: string;
  district: string;
}

interface ApprovalProcessData {
  submissionId: string;
  action: string;
  approverId: string;
}

// Real-time approval updates
io.on('connection', (socket: any) => {
  console.log('Client connected for approval updates');
  
  // Join room based on user role/district
  socket.on('join:approvals', (data: SocketData) => {
    const { userRole, district } = data;
    
    if (userRole === 'dinas') {
      socket.join(`approvals:${district}`);
      socket.join('approvals:all');
    }
  });
  
  // Broadcast approval updates
  socket.on('approval:update', (data: ApprovalUpdateData) => {
    const { submissionId, action, district } = data;
    
    // Broadcast to relevant rooms
    io.to(`approvals:${district}`).emit('approval:updated', {
      submissionId,
      action,
      timestamp: new Date(),
      ...data
    });
  });
});

// Integrate with approval service to send real-time updates
const originalProcessApproval = approvalsModule.service.processApproval;
approvalsModule.service.processApproval = async function(approvalData: ApprovalProcessData, approverId: string) {
  const result = await originalProcessApproval.call(this, approvalData, approverId);
  
  if (result.success) {
    // Emit real-time update
    io.to('approvals:all').emit('approval:processed', {
      submissionId: approvalData.submissionId,
      action: approvalData.action,
      approverId,
      timestamp: new Date()
    });
  }
  
  return result;
};
*/

// ============================================================================
// MONITORING AND ALERTING INTEGRATION
// ============================================================================

// Metrics collection
const approvalMetrics = {
  totalProcessed: 0,
  averageProcessingTime: 0,
  successRate: 0,
  errorRate: 0
};

// Middleware to collect metrics
app.use('/api/approvals', (_req: express.Request, res: express.Response, next: express.NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const processingTime = Date.now() - startTime;
    
    // Update metrics
    approvalMetrics.totalProcessed++;
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      approvalMetrics.successRate = (approvalMetrics.successRate + 1) / approvalMetrics.totalProcessed;
    } else {
      approvalMetrics.errorRate = (approvalMetrics.errorRate + 1) / approvalMetrics.totalProcessed;
    }
    
    // Log slow requests
    if (processingTime > 5000) {
      console.warn(`Slow approval request: ${_req.method} ${_req.path} took ${processingTime}ms`);
    }
  });
  
  next();
});

// Health check endpoint with detailed status
app.get('/api/approvals/health/detailed', async (_req: express.Request, res: express.Response) => {
  try {
    const dbStatus = await prisma.$queryRaw`SELECT 1`;
    const queueSize = await prisma.submission.count({
      where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } }
    });
    
    res.status(200).json({
      status: 'healthy',
      database: dbStatus ? 'connected' : 'disconnected',
      queueSize,
      metrics: approvalMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default app;
