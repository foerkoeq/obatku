// src/features/inventory/inventory.controller.ts
import { Request, Response } from 'express';
import { InventoryService } from './inventory.service';
import { ResponseUtil } from '../../shared/utils/response.util';
import {
  createMedicineSchema,
  updateMedicineSchema,
  createMedicineStockSchema,
  updateMedicineStockSchema,
  medicineQuerySchema,
  stockQuerySchema,
  movementQuerySchema,
  uuidSchema,
  bulkDeleteSchema,
  bulkUpdateStatusSchema
} from './inventory.validation';
import { 
  MedicineStatus,
  CreateMedicineDto,
  UpdateMedicineDto,
  CreateMedicineStockDto,
  UpdateMedicineStockDto
} from './inventory.types';

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // Medicine Controller Methods
  getAllMedicines = async (req: Request, res: Response) => {
    try {
      const query = medicineQuerySchema.parse(req.query);
      const result = await this.inventoryService.getAllMedicines(query);

      return ResponseUtil.successPaginated(
        res,
        result.medicines,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1
        },
        'Medicines retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getMedicineById = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const medicine = await this.inventoryService.getMedicineById(id);

      return ResponseUtil.success(res, medicine, 'Medicine retrieved successfully');
    } catch (error: any) {
      if (error.message === 'Medicine not found') {
        return ResponseUtil.notFound(res, 'Medicine not found');
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  createMedicine = async (req: Request, res: Response) => {
    try {
      const validatedData = createMedicineSchema.parse(req.body);
      // Map the validated data to CreateMedicineDto format
      const data: CreateMedicineDto = {
        name: validatedData.name,
        producer: validatedData.producer,
        activeIngredient: validatedData.activeIngredient,
        category: validatedData.category,
        unit: 'pieces', // Default unit, should be provided in request
        description: validatedData.description
      };
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const medicine = await this.inventoryService.createMedicine(data, userId);

      return ResponseUtil.created(res, medicine, 'Medicine created successfully');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return ResponseUtil.duplicateEntry(res, 'Medicine', `${req.body.name} (${req.body.brand})`);
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  updateMedicine = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const data = updateMedicineSchema.parse(req.body) as UpdateMedicineDto;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const medicine = await this.inventoryService.updateMedicine(id, data, userId);

      return ResponseUtil.success(res, medicine, 'Medicine updated successfully');
    } catch (error: any) {
      if (error.message === 'Medicine not found') {
        return ResponseUtil.notFound(res, 'Medicine not found');
      }
      if (error.message.includes('already exists')) {
        return ResponseUtil.duplicateEntry(res, 'Medicine', `${req.body.name} (${req.body.brand})`);
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  deleteMedicine = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);

      await this.inventoryService.deleteMedicine(id);

      return ResponseUtil.deleted(res, 'Medicine deleted successfully');
    } catch (error: any) {
      if (error.message === 'Medicine not found') {
        return ResponseUtil.notFound(res, 'Medicine not found');
      }
      if (error.message.includes('Cannot delete medicine')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  updateMedicineStatus = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const { status } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      if (!Object.values(MedicineStatus).includes(status)) {
        return ResponseUtil.validationError(res, 'Invalid status value');
      }

      const medicine = await this.inventoryService.updateMedicineStatus(id, status, userId);

      return ResponseUtil.success(res, medicine, 'Medicine status updated successfully');
    } catch (error: any) {
      if (error.message === 'Medicine not found') {
        return ResponseUtil.notFound(res, 'Medicine not found');
      }
      if (error.message.includes('Cannot discontinue medicine')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Medicine Stock Controller Methods
  getAllMedicineStocks = async (req: Request, res: Response) => {
    try {
      const query = stockQuerySchema.parse(req.query);
      const result = await this.inventoryService.getAllMedicineStocks(query);

      return ResponseUtil.successPaginated(
        res,
        result.stocks,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1
        },
        'Medicine stocks retrieved successfully',
        200
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getMedicineStockById = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const stock = await this.inventoryService.getMedicineStockById(id);

      return ResponseUtil.success(res, stock, 'Medicine stock retrieved successfully');
    } catch (error: any) {
      if (error.message === 'Medicine stock not found') {
        return ResponseUtil.notFound(res, 'Medicine stock not found');
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  createMedicineStock = async (req: Request, res: Response) => {
    try {
      const validatedData = createMedicineStockSchema.parse(req.body);
      const data: CreateMedicineStockDto = {
        medicineId: validatedData.medicineId,
        batchNumber: validatedData.batchNumber,
        initialStock: validatedData.initialStock,
        entryDate: validatedData.receivedDate, // Map receivedDate to entryDate
        expiryDate: validatedData.expiryDate,
        supplier: validatedData.supplierName,
        notes: validatedData.notes
      };
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const stock = await this.inventoryService.createMedicineStock(data, userId);

      return ResponseUtil.created(res, stock, 'Medicine stock created successfully');
    } catch (error: any) {
      if (error.message === 'Medicine not found') {
        return ResponseUtil.notFound(res, 'Medicine not found');
      }
      if (error.message.includes('already exists')) {
        return ResponseUtil.duplicateEntry(res, 'Batch number', req.body.batchNumber);
      }
      if (error.message.includes('Cannot add stock to inactive medicine')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  updateMedicineStock = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const data = updateMedicineStockSchema.parse(req.body) as UpdateMedicineStockDto;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const stock = await this.inventoryService.updateMedicineStock(id, data, userId);

      return ResponseUtil.success(res, stock, 'Medicine stock updated successfully');
    } catch (error: any) {
      if (error.message === 'Medicine stock not found') {
        return ResponseUtil.notFound(res, 'Medicine stock not found');
      }
      if (error.message.includes('Insufficient stock')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  adjustStock = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const { quantity, reason, notes } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      if (typeof quantity !== 'number' || !reason) {
        return ResponseUtil.validationError(res, 'Quantity and reason are required');
      }

      const stock = await this.inventoryService.adjustStock(id, quantity, reason, userId, notes);

      return ResponseUtil.success(res, stock, 'Stock adjusted successfully');
    } catch (error: any) {
      if (error.message === 'Medicine stock not found') {
        return ResponseUtil.notFound(res, 'Medicine stock not found');
      }
      if (error.message.includes('Insufficient stock')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  reserveStock = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const { quantity } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      if (typeof quantity !== 'number' || quantity <= 0) {
        return ResponseUtil.validationError(res, 'Valid quantity is required');
      }

      const stock = await this.inventoryService.reserveStock(id, quantity, userId);

      return ResponseUtil.success(res, stock, 'Stock reserved successfully');
    } catch (error: any) {
      if (error.message === 'Medicine stock not found') {
        return ResponseUtil.notFound(res, 'Medicine stock not found');
      }
      if (error.message.includes('Insufficient available stock')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  releaseReservedStock = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const { quantity } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      if (typeof quantity !== 'number' || quantity <= 0) {
        return ResponseUtil.validationError(res, 'Valid quantity is required');
      }

      const stock = await this.inventoryService.releaseReservedStock(id, quantity, userId);

      return ResponseUtil.success(res, stock, 'Reserved stock released successfully');
    } catch (error: any) {
      if (error.message === 'Medicine stock not found') {
        return ResponseUtil.notFound(res, 'Medicine stock not found');
      }
      if (error.message.includes('Cannot release more than reserved')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  deleteStock = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);

      await this.inventoryService.deleteStock(id);

      return ResponseUtil.deleted(res, 'Medicine stock deleted successfully');
    } catch (error: any) {
      if (error.message === 'Medicine stock not found') {
        return ResponseUtil.notFound(res, 'Medicine stock not found');
      }
      if (error.message.includes('Cannot delete stock')) {
        return ResponseUtil.businessLogicError(res, error.message);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Stock Movement Controller Methods
  getStockMovements = async (req: Request, res: Response) => {
    try {
      const query = movementQuerySchema.parse(req.query);
      const result = await this.inventoryService.getStockMovements(query);

      return ResponseUtil.successPaginated(
        res,
        result.movements,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1
        },
        'Stock movements retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getStockMovementsByStockId = async (req: Request, res: Response) => {
    try {
      const stockId = uuidSchema.parse(req.params.stockId);
      const query = movementQuerySchema.parse(req.query);
      
      const result = await this.inventoryService.getStockMovementsByStockId(stockId, query);

      return ResponseUtil.successPaginated(
        res,
        result.movements,
        {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrevious: result.page > 1
        },
        'Stock movements retrieved successfully'
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Alert Controller Methods
  generateStockAlerts = async (_req: Request, res: Response) => {
    try {
      await this.inventoryService.generateStockAlerts();
      return ResponseUtil.success(res, null, 'Stock alerts generated successfully');
    } catch (error: any) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getStockAlerts = async (req: Request, res: Response) => {
    try {
      const { isRead } = req.query;
      const readFilter = isRead === 'true' ? true : isRead === 'false' ? false : undefined;
      
      const alerts = await this.inventoryService.getStockAlerts(readFilter);

      return ResponseUtil.success(res, alerts, 'Stock alerts retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  markAlertAsRead = async (req: Request, res: Response) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      await this.inventoryService.markAlertAsRead(id, userId);

      return ResponseUtil.success(res, null, 'Alert marked as read');
    } catch (error: any) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getUnreadAlertsCount = async (_req: Request, res: Response) => {
    try {
      const count = await this.inventoryService.getUnreadAlertsCount();
      return ResponseUtil.success(res, { count }, 'Unread alerts count retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Statistics Controller Methods
  getInventoryStatistics = async (_req: Request, res: Response) => {
    try {
      const stats = await this.inventoryService.getInventoryStatistics();
      return ResponseUtil.success(res, stats, 'Inventory statistics retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getLowStockItems = async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const items = await this.inventoryService.getLowStockItems(limit);
      return ResponseUtil.success(res, items, 'Low stock items retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getExpiringSoonItems = async (req: Request, res: Response) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const limit = parseInt(req.query.limit as string) || 10;
      const items = await this.inventoryService.getExpiringSoonItems(days, limit);
      return ResponseUtil.success(res, items, 'Expiring soon items retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  getStockValueByCategory = async (_req: Request, res: Response) => {
    try {
      const valueByCategory = await this.inventoryService.getStockValueByCategory();
      return ResponseUtil.success(res, valueByCategory, 'Stock value by category retrieved successfully');
    } catch (error: any) {
      return ResponseUtil.internalError(res, error.message);
    }
  };

  // Bulk Operations Controller Methods
  bulkUpdateMedicineStatus = async (req: Request, res: Response) => {
    try {
      const { ids, status } = bulkUpdateStatusSchema.parse(req.body);
      const userId = req.user?.id;

      if (!userId) {
        return ResponseUtil.unauthenticated(res);
      }

      const result = await this.inventoryService.bulkUpdateMedicineStatus(ids, status, userId);

      return ResponseUtil.bulkOperation(
        res,
        [],
        ids.length,
        result.updated,
        result.errors.length,
        result.errors.map((error: any, index: number) => ({ index, error }))
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };

  bulkDeleteMedicines = async (req: Request, res: Response) => {
    try {
      const { ids } = bulkDeleteSchema.parse(req.body);
      const errors: string[] = [];
      let deleted = 0;

      for (const id of ids) {
        try {
          await this.inventoryService.deleteMedicine(id);
          deleted++;
        } catch (error: any) {
          errors.push(`Medicine ${id}: ${error.message}`);
        }
      }

      return ResponseUtil.bulkOperation(
        res,
        [],
        ids.length,
        deleted,
        errors.length,
        errors.map((error: string, index: number) => ({ index, error }))
      );
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return ResponseUtil.validationError(res, error.errors);
      }
      return ResponseUtil.internalError(res, error.message);
    }
  };
}
