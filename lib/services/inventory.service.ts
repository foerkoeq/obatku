/**
 * Inventory Management Service
 * Handles medicine management, stock operations, categories, and suppliers
 */

import { api, API_ENDPOINTS, ListResponse, SingleResponse, MessageResponse, ApiServiceError, QueryBuilder, PaginationParams, SearchFilterParams } from './api';

// Medicine interfaces
export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  categoryId: string;
  supplier: string;
  supplierId: string;
  description?: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  unit: string;
  barcode?: string;
  sku: string;
  image?: string;
  isActive: boolean;
  requiresPrescription: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicineRequest {
  name: string;
  genericName?: string;
  categoryId: string;
  supplierId: string;
  description?: string;
  activeIngredient: string;
  dosageForm: string;
  strength: string;
  unit: string;
  barcode?: string;
  sku: string;
  image?: string;
  requiresPrescription: boolean;
}

export interface UpdateMedicineRequest {
  name?: string;
  genericName?: string;
  categoryId?: string;
  supplierId?: string;
  description?: string;
  activeIngredient?: string;
  dosageForm?: string;
  strength?: string;
  unit?: string;
  barcode?: string;
  sku?: string;
  image?: string;
  isActive?: boolean;
  requiresPrescription?: boolean;
}

// Stock interfaces
export interface Stock {
  id: string;
  medicineId: string;
  medicine: Medicine;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  expiryDate: string;
  manufacturingDate: string;
  supplier: string;
  supplierId: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockRequest {
  medicineId: string;
  batchNumber: string;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  expiryDate: string;
  manufacturingDate: string;
  supplierId: string;
  location?: string;
}

export interface UpdateStockRequest {
  quantity?: number;
  unitPrice?: number;
  sellingPrice?: number;
  expiryDate?: string;
  location?: string;
  isActive?: boolean;
}

export interface StockAdjustment {
  id: string;
  stockId: string;
  stock: Stock;
  type: 'addition' | 'subtraction' | 'correction';
  quantity: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
  notes?: string;
}

export interface CreateStockAdjustmentRequest {
  stockId: string;
  type: 'addition' | 'subtraction' | 'correction';
  quantity: number;
  reason: string;
  notes?: string;
}

// Category interfaces
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
  isActive?: boolean;
}

// Supplier interfaces
export interface Supplier {
  id: string;
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  code: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  taxId?: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  code?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  taxId?: string;
  isActive?: boolean;
}

// Filter interfaces
export interface MedicineFilters extends SearchFilterParams {
  categoryId?: string;
  supplierId?: string;
  requiresPrescription?: boolean;
  isActive?: boolean;
  lowStock?: boolean;
  expiringSoon?: boolean;
}

export interface StockFilters extends SearchFilterParams {
  medicineId?: string;
  categoryId?: string;
  supplierId?: string;
  batchNumber?: string;
  expiryDateFrom?: string;
  expiryDateTo?: string;
  lowStock?: boolean;
  expiringSoon?: boolean;
}

export interface CategoryFilters extends SearchFilterParams {
  parentId?: string;
  isActive?: boolean;
}

export interface SupplierFilters extends SearchFilterParams {
  isActive?: boolean;
  city?: string;
  state?: string;
}

/**
 * Inventory Management Service Class
 */
class InventoryService {
  // Medicine Management
  /**
   * Get all medicines with pagination and filters
   */
  async getMedicines(
    pagination?: PaginationParams,
    filters?: MedicineFilters
  ): Promise<ListResponse<Medicine>> {
    try {
      const queryBuilder = new QueryBuilder();
      
      if (pagination) {
        queryBuilder.addPagination(pagination.page, pagination.limit);
      }
      
      if (filters) {
        queryBuilder.addSearch(filters.search);
        queryBuilder.addSort(filters.sort, filters.order);
        queryBuilder.addFilter(filters.filter);
        if (filters.categoryId) {
          queryBuilder.addFilter({ categoryId: filters.categoryId });
        }
        if (filters.supplierId) {
          queryBuilder.addFilter({ supplierId: filters.supplierId });
        }
        if (filters.requiresPrescription !== undefined) {
          queryBuilder.addFilter({ requiresPrescription: filters.requiresPrescription });
        }
        if (filters.isActive !== undefined) {
          queryBuilder.addStatus(filters.isActive ? 'active' : 'inactive');
        }
        if (filters.lowStock) {
          queryBuilder.addFilter({ lowStock: true });
        }
        if (filters.expiringSoon) {
          queryBuilder.addFilter({ expiringSoon: true });
        }
      }
      
      const queryString = queryBuilder.build();
      const response = await api.get<Medicine[]>(`${API_ENDPOINTS.INVENTORY.MEDICINES}${queryString}`);
      
      return response as ListResponse<Medicine>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get medicine by ID
   */
  async getMedicineById(medicineId: string): Promise<SingleResponse<Medicine>> {
    try {
      const response = await api.get<Medicine>(`${API_ENDPOINTS.INVENTORY.MEDICINES}/${medicineId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Create new medicine
   */
  async createMedicine(medicineData: CreateMedicineRequest): Promise<SingleResponse<Medicine>> {
    try {
      const response = await api.post<Medicine>(API_ENDPOINTS.INVENTORY.MEDICINES, medicineData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Update medicine
   */
  async updateMedicine(medicineId: string, medicineData: UpdateMedicineRequest): Promise<SingleResponse<Medicine>> {
    try {
      const response = await api.put<Medicine>(`${API_ENDPOINTS.INVENTORY.MEDICINES}/${medicineId}`, medicineData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Delete medicine
   */
  async deleteMedicine(medicineId: string): Promise<MessageResponse> {
    try {
      const response = await api.delete<{ message: string }>(`${API_ENDPOINTS.INVENTORY.MEDICINES}/${medicineId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Upload medicine image
   */
  async uploadMedicineImage(medicineId: string, imageFile: File): Promise<SingleResponse<{ imageUrl: string }>> {
    try {
      const response = await api.upload<{ imageUrl: string }>(
        `${API_ENDPOINTS.INVENTORY.MEDICINES}/${medicineId}/image`,
        imageFile
      );
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  // Stock Management
  /**
   * Get all stock with pagination and filters
   */
  async getStock(
    pagination?: PaginationParams,
    filters?: StockFilters
  ): Promise<ListResponse<Stock>> {
    try {
      const queryBuilder = new QueryBuilder();
      
      if (pagination) {
        queryBuilder.addPagination(pagination.page, pagination.limit);
      }
      
      if (filters) {
        queryBuilder.addSearch(filters.search);
        queryBuilder.addSort(filters.sort, filters.order);
        queryBuilder.addFilter(filters.filter);
        if (filters.medicineId) {
          queryBuilder.addFilter({ medicineId: filters.medicineId });
        }
        if (filters.categoryId) {
          queryBuilder.addFilter({ categoryId: filters.categoryId });
        }
        if (filters.supplierId) {
          queryBuilder.addFilter({ supplierId: filters.supplierId });
        }
        if (filters.batchNumber) {
          queryBuilder.addFilter({ batchNumber: filters.batchNumber });
        }
        if (filters.expiryDateFrom || filters.expiryDateTo) {
          queryBuilder.addDateRange(filters.expiryDateFrom, filters.expiryDateTo);
        }
        if (filters.lowStock) {
          queryBuilder.addFilter({ lowStock: true });
        }
        if (filters.expiringSoon) {
          queryBuilder.addFilter({ expiringSoon: true });
        }
      }
      
      const queryString = queryBuilder.build();
      const response = await api.get<Stock[]>(`${API_ENDPOINTS.INVENTORY.STOCK}${queryString}`);
      
      return response as ListResponse<Stock>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get stock by ID
   */
  async getStockById(stockId: string): Promise<SingleResponse<Stock>> {
    try {
      const response = await api.get<Stock>(`${API_ENDPOINTS.INVENTORY.STOCK}/${stockId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Create new stock
   */
  async createStock(stockData: CreateStockRequest): Promise<SingleResponse<Stock>> {
    try {
      const response = await api.post<Stock>(API_ENDPOINTS.INVENTORY.STOCK, stockData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Update stock
   */
  async updateStock(stockId: string, stockData: UpdateStockRequest): Promise<SingleResponse<Stock>> {
    try {
      const response = await api.put<Stock>(`${API_ENDPOINTS.INVENTORY.STOCK}/${stockId}`, stockData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Delete stock
   */
  async deleteStock(stockId: string): Promise<MessageResponse> {
    try {
      const response = await api.delete<{ message: string }>(`${API_ENDPOINTS.INVENTORY.STOCK}/${stockId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Create stock adjustment
   */
  async createStockAdjustment(adjustmentData: CreateStockAdjustmentRequest): Promise<SingleResponse<StockAdjustment>> {
    try {
      const response = await api.post<StockAdjustment>(
        `${API_ENDPOINTS.INVENTORY.STOCK}/adjustments`,
        adjustmentData
      );
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  // Category Management
  /**
   * Get all categories
   */
  async getCategories(filters?: CategoryFilters): Promise<ListResponse<Category>> {
    try {
      const queryBuilder = new QueryBuilder();
      
      if (filters) {
        queryBuilder.addSearch(filters.search);
        queryBuilder.addSort(filters.sort, filters.order);
        queryBuilder.addFilter(filters.filter);
        if (filters.parentId) {
          queryBuilder.addFilter({ parentId: filters.parentId });
        }
        if (filters.isActive !== undefined) {
          queryBuilder.addStatus(filters.isActive ? 'active' : 'inactive');
        }
      }
      
      const queryString = queryBuilder.build();
      const response = await api.get<Category[]>(`${API_ENDPOINTS.INVENTORY.CATEGORIES}${queryString}`);
      
      return response as ListResponse<Category>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string): Promise<SingleResponse<Category>> {
    try {
      const response = await api.get<Category>(`${API_ENDPOINTS.INVENTORY.CATEGORIES}/${categoryId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Create new category
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<SingleResponse<Category>> {
    try {
      const response = await api.post<Category>(API_ENDPOINTS.INVENTORY.CATEGORIES, categoryData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Update category
   */
  async updateCategory(categoryId: string, categoryData: UpdateCategoryRequest): Promise<SingleResponse<Category>> {
    try {
      const response = await api.put<Category>(`${API_ENDPOINTS.INVENTORY.CATEGORIES}/${categoryId}`, categoryData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(categoryId: string): Promise<MessageResponse> {
    try {
      const response = await api.delete<{ message: string }>(`${API_ENDPOINTS.INVENTORY.CATEGORIES}/${categoryId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  // Supplier Management
  /**
   * Get all suppliers
   */
  async getSuppliers(filters?: SupplierFilters): Promise<ListResponse<Supplier>> {
    try {
      const queryBuilder = new QueryBuilder();
      
      if (filters) {
        queryBuilder.addSearch(filters.search);
        queryBuilder.addSort(filters.sort, filters.order);
        queryBuilder.addFilter(filters.filter);
        if (filters.isActive !== undefined) {
          queryBuilder.addStatus(filters.isActive ? 'active' : 'inactive');
        }
        if (filters.city) {
          queryBuilder.addFilter({ city: filters.city });
        }
        if (filters.state) {
          queryBuilder.addFilter({ state: filters.state });
        }
      }
      
      const queryString = queryBuilder.build();
      const response = await api.get<Supplier[]>(`${API_ENDPOINTS.INVENTORY.SUPPLIERS}${queryString}`);
      
      return response as ListResponse<Supplier>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(supplierId: string): Promise<SingleResponse<Supplier>> {
    try {
      const response = await api.get<Supplier>(`${API_ENDPOINTS.INVENTORY.SUPPLIERS}/${supplierId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Create new supplier
   */
  async createSupplier(supplierData: CreateSupplierRequest): Promise<SingleResponse<Supplier>> {
    try {
      const response = await api.post<Supplier>(API_ENDPOINTS.INVENTORY.SUPPLIERS, supplierData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(supplierId: string, supplierData: UpdateSupplierRequest): Promise<SingleResponse<Supplier>> {
    try {
      const response = await api.put<Supplier>(`${API_ENDPOINTS.INVENTORY.SUPPLIERS}/${supplierId}`, supplierData);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Delete supplier
   */
  async deleteSupplier(supplierId: string): Promise<MessageResponse> {
    try {
      const response = await api.delete<{ message: string }>(`${API_ENDPOINTS.INVENTORY.SUPPLIERS}/${supplierId}`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  // Utility Methods
  /**
   * Get low stock medicines
   */
  async getLowStockMedicines(threshold: number = 10): Promise<ListResponse<Stock>> {
    try {
      const response = await api.get<Stock[]>(`${API_ENDPOINTS.INVENTORY.STOCK}/low-stock?threshold=${threshold}`);
      return response as ListResponse<Stock>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get expiring medicines
   */
  async getExpiringMedicines(days: number = 30): Promise<ListResponse<Stock>> {
    try {
      const response = await api.get<Stock[]>(`${API_ENDPOINTS.INVENTORY.STOCK}/expiring?days=${days}`);
      return response as ListResponse<Stock>;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(): Promise<SingleResponse<{
    totalMedicines: number;
    totalStock: number;
    lowStockCount: number;
    expiringCount: number;
    totalValue: number;
    categoryDistribution: Record<string, number>;
    supplierDistribution: Record<string, number>;
  }>> {
    try {
      const response = await api.get(`${API_ENDPOINTS.INVENTORY.MEDICINES}/stats`);
      return response;
    } catch (error) {
      throw ApiServiceError.fromApiError(error as any);
    }
  }

  /**
   * Export inventory data
   */
  async exportInventory(format: 'excel' | 'csv', filters?: MedicineFilters): Promise<Blob> {
    try {
      const queryBuilder = new QueryBuilder();
      
      if (filters) {
        queryBuilder.addSearch(filters.search);
        queryBuilder.addFilter(filters.filter);
        if (filters.categoryId) {
          queryBuilder.addFilter({ categoryId: filters.categoryId });
        }
        if (filters.supplierId) {
          queryBuilder.addFilter({ supplierId: filters.supplierId });
        }
        if (filters.requiresPrescription !== undefined) {
          queryBuilder.addFilter({ requiresPrescription: filters.requiresPrescription });
        }
        if (filters.isActive !== undefined) {
          queryBuilder.addStatus(filters.isActive ? 'active' : 'inactive');
        }
      }
      
      queryBuilder.addFilter({ format });
      const queryString = queryBuilder.build();
      
      const response = await fetch(`${API_ENDPOINTS.INVENTORY.MEDICINES}/export${queryString}`, {
        headers: {
          'Authorization': `Bearer ${api.getAccessToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      return await response.blob();
    } catch (error) {
      throw new ApiServiceError(
        error instanceof Error ? error.message : 'Export failed',
        500,
        'EXPORT_FAILED'
      );
    }
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();

// Export types
export type {
  Medicine,
  CreateMedicineRequest,
  UpdateMedicineRequest,
  Stock,
  CreateStockRequest,
  UpdateStockRequest,
  StockAdjustment,
  CreateStockAdjustmentRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Supplier,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  MedicineFilters,
  StockFilters,
  CategoryFilters,
  SupplierFilters,
};
