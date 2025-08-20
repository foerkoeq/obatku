// src/features/inventory/inventory.service.ts
import {
  MedicineStatus,
  CreateMedicineDto,
  UpdateMedicineDto,
  CreateMedicineStockDto,
  UpdateMedicineStockDto,
  MedicineQueryParams
} from './inventory.types';
import { InventoryRepository } from './inventory.repository';

export class InventoryService {
  constructor(private readonly inventoryRepository: InventoryRepository) {}

  // Medicine Service Methods
  async getAllMedicines(query: MedicineQueryParams) {
    return await this.inventoryRepository.findMedicines(query);
  }

  async getMedicineById(id: string) {
    const medicine = await this.inventoryRepository.findMedicineById(id);
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    return medicine;
  }

  async createMedicine(data: CreateMedicineDto, userId: string) {
    return await this.inventoryRepository.createMedicine(data, userId);
  }

  async updateMedicine(id: string, data: UpdateMedicineDto, _userId: string) {
    // Validate medicine exists
    await this.getMedicineById(id);
    
    return await this.inventoryRepository.updateMedicine(id, data);
  }

  async deleteMedicine(id: string) {
    // Validate medicine exists
    await this.getMedicineById(id);
    
    return await this.inventoryRepository.deleteMedicine(id);
  }

  async updateMedicineStatus(id: string, status: MedicineStatus, _userId: string) {
    // Validate medicine exists
    await this.getMedicineById(id);
    
    return await this.inventoryRepository.updateMedicine(id, { status });
  }

  // Stock Service Methods
  async getAllMedicineStocks(query: any) {
    return await this.inventoryRepository.findMedicineStocks(query);
  }

  async getMedicineStockById(id: string) {
    const stock = await this.inventoryRepository.findMedicineStockById(id);
    if (!stock) {
      throw new Error('Medicine stock not found');
    }
    return stock;
  }

  async createMedicineStock(data: CreateMedicineStockDto, _userId: string) {
    return await this.inventoryRepository.createMedicineStock(data);
  }

  async updateMedicineStock(id: string, data: UpdateMedicineStockDto, _userId: string) {
    // Validate stock exists
    await this.getMedicineStockById(id);
    
    return await this.inventoryRepository.updateMedicineStock(id, data);
  }

  async adjustStock(id: string, quantity: number, _reason: string, _userId: string, _notes?: string) {
    const stock = await this.getMedicineStockById(id);
    const newQuantity = Number(stock.currentStock) + quantity;
    
    return await this.inventoryRepository.adjustStock(id, newQuantity);
  }

  async reserveStock(id: string, quantity: number, _userId: string) {
    const stock = await this.getMedicineStockById(id);
    const newQuantity = Number(stock.currentStock) - quantity;
    
    return await this.inventoryRepository.adjustStock(id, newQuantity);
  }

  async releaseReservedStock(id: string, quantity: number, _userId: string) {
    const stock = await this.getMedicineStockById(id);
    const newQuantity = Number(stock.currentStock) + quantity;
    
    return await this.inventoryRepository.adjustStock(id, newQuantity);
  }

  async deleteStock(id: string) {
    // Validate stock exists
    await this.getMedicineStockById(id);
    
    return await this.inventoryRepository.deleteMedicineStock(id);
  }

  // Mock methods for other features
  async getStockMovements(query: any) {
    return {
      movements: [],
      page: query.page || 1,
      limit: query.limit || 20,
      total: 0,
      totalPages: 0
    };
  }

  async getStockMovementsByStockId(_stockId: string, query: any) {
    return {
      movements: [],
      page: query.page || 1,
      limit: query.limit || 20,
      total: 0,
      totalPages: 0
    };
  }

  async generateStockAlerts() {
    // Mock implementation
  }

  async getStockAlerts(_readFilter?: boolean) {
    return [];
  }

  async markAlertAsRead(_id: string, _userId: string) {
    // Mock implementation
  }

  async getUnreadAlertsCount() {
    return 0;
  }

  async getInventoryStatistics() {
    return await this.inventoryRepository.getInventoryStatistics();
  }

  async getLowStockItems(_limit: number) {
    return await this.inventoryRepository.getLowStockItems();
  }

  async getExpiringSoonItems(days: number, _limit: number) {
    return await this.inventoryRepository.getExpiringSoonItems(days);
  }

  async getStockValueByCategory() {
    return await this.inventoryRepository.getStockValueByCategory();
  }

  async bulkUpdateMedicineStatus(ids: string[], status: MedicineStatus, _userId: string) {
    const updated = await this.inventoryRepository.bulkUpdateMedicineStatus(ids, status);
    return {
      updated,
      errors: []
    };
  }
}
