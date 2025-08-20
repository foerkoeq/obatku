/**
 * Transaction Integration Tests
 * Tests the complete transaction workflow with database
 */

import request from 'supertest';
import { app } from '../../../app';
import { PrismaClient } from '@prisma/client';
import { 
  TransactionType, 
  TransactionSource, 
  TransactionStatus 
} from '../transactions.types';
import { UserRole } from '../../../shared/types';

const prisma = new PrismaClient();

describe('Transaction Integration Tests', () => {
  let authTokenAdmin: string;
  let authTokenPPL: string;
  let authTokenDinas: string;
  let authTokenPOPT: string;
  let testUserId: string;
  let testMedicineId: string;
  let testTransactionId: string;

  beforeAll(async () => {
    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await prisma.$disconnect();
  });

  describe('POST /api/v1/transactions', () => {
    it('should create PPL submission transaction with request letter', async () => {
      const transactionData = {
        type: TransactionType.SUBMISSION_BASED,
        source: TransactionSource.PPL_SUBMISSION,
        targetDistrict: 'Test District',
        targetPIC: 'John Doe',
        requestLetter: 'test-letter.pdf',
        items: [
          {
            medicineId: testMedicineId,
            requestedQuantity: 10
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authTokenPPL}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe(TransactionType.SUBMISSION_BASED);
      expect(response.body.data.source).toBe(TransactionSource.PPL_SUBMISSION);
      expect(response.body.data.status).toBe(TransactionStatus.PENDING);
      expect(response.body.data.transactionNumber).toMatch(/^TRX-\d{4}-\d{2}-\d{2}-\d{3}$/);

      testTransactionId = response.body.data.id;
    });

    it('should create POPT request transaction without request letter', async () => {
      const transactionData = {
        type: TransactionType.DIRECT_REQUEST,
        source: TransactionSource.POPT_REQUEST,
        targetDistrict: 'Test District 2',
        targetPIC: 'Jane Doe',
        items: [
          {
            medicineId: testMedicineId,
            requestedQuantity: 5
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authTokenPOPT}`)
        .send(transactionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.source).toBe(TransactionSource.POPT_REQUEST);
      expect(response.body.data.requestLetter).toBeNull();
    });

    it('should reject PPL submission without request letter', async () => {
      const transactionData = {
        type: TransactionType.SUBMISSION_BASED,
        source: TransactionSource.PPL_SUBMISSION,
        targetDistrict: 'Test District',
        items: [
          {
            medicineId: testMedicineId,
            requestedQuantity: 10
          }
        ]
        // Missing requestLetter
      };

      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authTokenPPL}`)
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Request letter is required');
    });

    it('should reject transaction with insufficient stock', async () => {
      const transactionData = {
        type: TransactionType.DIRECT_REQUEST,
        source: TransactionSource.POPT_REQUEST,
        targetDistrict: 'Test District',
        items: [
          {
            medicineId: testMedicineId,
            requestedQuantity: 10000 // Excessive quantity
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authTokenPOPT}`)
        .send(transactionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Insufficient stock');
    });
  });

  describe('Transaction Approval Workflow', () => {
    it('should approve transaction by Dinas user', async () => {
      const approvalData = {
        approvalNotes: 'Approved for distribution',
        itemAdjustments: [
          {
            transactionItemId: 'will-be-replaced-with-actual-id',
            approvedQuantity: 8
          }
        ]
      };

      // Get transaction items first
      const transactionResponse = await request(app)
        .get(`/api/v1/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authTokenDinas}`)
        .expect(200);

      approvalData.itemAdjustments[0].transactionItemId = 
        transactionResponse.body.data.items[0].id;

      const response = await request(app)
        .post(`/api/v1/transactions/${testTransactionId}/approve`)
        .set('Authorization', `Bearer ${authTokenDinas}`)
        .send(approvalData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(TransactionStatus.APPROVED);
      expect(response.body.data.approvedBy).toBeDefined();
      expect(response.body.data.approvedAt).toBeDefined();
    });

    it('should reject unauthorized approval attempt by PPL', async () => {
      const response = await request(app)
        .post(`/api/v1/transactions/${testTransactionId}/approve`)
        .set('Authorization', `Bearer ${authTokenPPL}`)
        .send({ approvalNotes: 'Trying to approve own request' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should reject transaction with reason', async () => {
      // Create another transaction to reject
      const transactionData = {
        type: TransactionType.DIRECT_REQUEST,
        source: TransactionSource.POPT_REQUEST,
        targetDistrict: 'Test District',
        items: [{ medicineId: testMedicineId, requestedQuantity: 5 }]
      };

      const createResponse = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authTokenPOPT}`)
        .send(transactionData)
        .expect(201);

      const rejectResponse = await request(app)
        .post(`/api/v1/transactions/${createResponse.body.data.id}/reject`)
        .set('Authorization', `Bearer ${authTokenDinas}`)
        .send({ rejectionReason: 'Insufficient justification' })
        .expect(200);

      expect(rejectResponse.body.success).toBe(true);
      expect(rejectResponse.body.data.status).toBe(TransactionStatus.REJECTED);
      expect(rejectResponse.body.data.rejectionReason).toBe('Insufficient justification');
    });
  });

  describe('Transaction Processing Workflow', () => {
    it('should process approved transaction', async () => {
      // Get transaction items for processing
      const transactionResponse = await request(app)
        .get(`/api/v1/transactions/${testTransactionId}`)
        .set('Authorization', `Bearer ${authTokenPOPT}`)
        .expect(200);

      const processData = {
        items: [
          {
            transactionItemId: transactionResponse.body.data.items[0].id,
            processedQuantity: 8,
            qrCodes: ['25071F111B0001', '25071F111B0002'],
            batchNumbers: ['BATCH001'],
            expiryDates: ['2025-12-31T00:00:00.000Z']
          }
        ],
        deliveryNote: 'DN-001',
        notes: 'Processed successfully'
      };

      const response = await request(app)
        .post(`/api/v1/transactions/${testTransactionId}/process`)
        .set('Authorization', `Bearer ${authTokenPOPT}`)
        .send(processData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(TransactionStatus.IN_PROGRESS);
      expect(response.body.data.processedBy).toBeDefined();
      expect(response.body.data.processedAt).toBeDefined();
    });

    it('should complete processed transaction', async () => {
      const completeData = {
        receivingProof: 'receipt-001.pdf',
        completionNotes: 'Successfully delivered and received',
        additionalDocuments: ['photo1.jpg', 'photo2.jpg']
      };

      const response = await request(app)
        .post(`/api/v1/transactions/${testTransactionId}/complete`)
        .set('Authorization', `Bearer ${authTokenPOPT}`)
        .send(completeData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(TransactionStatus.COMPLETED);
      expect(response.body.data.completedBy).toBeDefined();
      expect(response.body.data.completedAt).toBeDefined();
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should get all transactions for admin', async () => {
      const response = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta.pagination).toBeDefined();
    });

    it('should get user transactions for PPL', async () => {
      const response = await request(app)
        .get('/api/v1/transactions/my-transactions')
        .set('Authorization', `Bearer ${authTokenPPL}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should get pending approvals for Dinas', async () => {
      const response = await request(app)
        .get('/api/v1/transactions/pending-approvals')
        .set('Authorization', `Bearer ${authTokenDinas}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter transactions by status', async () => {
      const response = await request(app)
        .get('/api/v1/transactions')
        .query({ status: TransactionStatus.COMPLETED })
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach((transaction: any) => {
        expect(transaction.status).toBe(TransactionStatus.COMPLETED);
      });
    });

    it('should search transactions by district', async () => {
      const response = await request(app)
        .get('/api/v1/transactions')
        .query({ search: 'Test District' })
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Transaction Summary', () => {
    it('should get transaction summary for admin', async () => {
      const response = await request(app)
        .get('/api/v1/transactions/summary')
        .set('Authorization', `Bearer ${authTokenAdmin}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalTransactions');
      expect(response.body.data).toHaveProperty('pendingTransactions');
      expect(response.body.data).toHaveProperty('completedTransactions');
      expect(response.body.data).toHaveProperty('byType');
      expect(response.body.data).toHaveProperty('bySource');
    });

    it('should reject summary request from PPL', async () => {
      const response = await request(app)
        .get('/api/v1/transactions/summary')
        .set('Authorization', `Bearer ${authTokenPPL}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  // Helper functions
  async function setupTestData() {
    // Create test users
    const adminUser = await prisma.user.create({
      data: {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'hashedpassword',
        role: UserRole.ADMIN,
        status: 'active'
      }
    });

    const pplUser = await prisma.user.create({
      data: {
        name: 'Test PPL',
        email: 'ppl@test.com',
        password: 'hashedpassword',
        role: UserRole.PPL,
        status: 'active'
      }
    });

    const dinasUser = await prisma.user.create({
      data: {
        name: 'Test Dinas',
        email: 'dinas@test.com',
        password: 'hashedpassword',
        role: UserRole.DINAS,
        status: 'active'
      }
    });

    const poptUser = await prisma.user.create({
      data: {
        name: 'Test POPT',
        email: 'popt@test.com',
        password: 'hashedpassword',
        role: UserRole.POPT,
        status: 'active'
      }
    });

    // Create test medicine
    const medicine = await prisma.medicine.create({
      data: {
        name: 'Test Medicine',
        category: 'fungicide',
        type: 'liquid',
        activeIngredient: 'Test Ingredient',
        concentration: '50%',
        currentStock: 1000,
        unit: 'liter',
        status: 'active',
        createdBy: adminUser.id
      }
    });

    testUserId = pplUser.id;
    testMedicineId = medicine.id;

    // Generate auth tokens (simplified - in real implementation, use proper JWT)
    authTokenAdmin = generateTestToken(adminUser.id, UserRole.ADMIN);
    authTokenPPL = generateTestToken(pplUser.id, UserRole.PPL);
    authTokenDinas = generateTestToken(dinasUser.id, UserRole.DINAS);
    authTokenPOPT = generateTestToken(poptUser.id, UserRole.POPT);
  }

  async function cleanupTestData() {
    // Clean up in reverse order of dependencies
    await prisma.transactionActivity.deleteMany();
    await prisma.stockMovement.deleteMany();
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.medicine.deleteMany();
    await prisma.user.deleteMany();
  }

  function generateTestToken(userId: string, role: UserRole): string {
    // In real implementation, use proper JWT generation
    return `test-token-${userId}-${role}`;
  }
});
