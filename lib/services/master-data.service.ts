// # START OF Master Data Service - API service for master data management
// Purpose: Provide API wrappers for master data endpoints (farmer groups, commodities, pest types)
// Dependencies: api client, API endpoints
// Returns: Master data API responses

import { api } from '../api/client';
import { API_ENDPOINTS } from './api';

/**
 * Master Data Service
 * Provides frontend API wrappers for master data endpoints
 */

export interface FarmerGroup {
  id: string;
  name: string;
  leader: string;
  district: string;
  village: string;
  memberCount: number;
  establishedDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export interface Commodity {
  id: string;
  name: string;
  category: string;
  description?: string;
  commonPestTypes: string[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface PestType {
  id: string;
  name: string;
  category: string;
  description?: string;
  affectedCommodities: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateFarmerGroupRequest {
  name: string;
  leader: string;
  district: string;
  village: string;
  memberCount: number;
  establishedDate: string;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export interface CreateCommodityRequest {
  name: string;
  category: string;
  description?: string;
  commonPestTypes: string[];
}

export interface CreatePestTypeRequest {
  name: string;
  category: string;
  description?: string;
  affectedCommodities: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export const masterDataService = {
  // Farmer Groups
  async getFarmerGroups(params?: {
    district?: string;
    village?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.district) queryParams.append('district', params.district);
    if (params?.village) queryParams.append('village', params.village);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return api.get(`${API_ENDPOINTS.MASTER_DATA.FARMER_GROUPS}?${queryParams.toString()}`);
  },

  async getFarmerGroup(id: string) {
    return api.get(`${API_ENDPOINTS.MASTER_DATA.FARMER_GROUPS}/${id}`);
  },

  async createFarmerGroup(data: CreateFarmerGroupRequest) {
    return api.post(API_ENDPOINTS.MASTER_DATA.FARMER_GROUPS, data);
  },

  async updateFarmerGroup(id: string, data: Partial<CreateFarmerGroupRequest>) {
    return api.put(`${API_ENDPOINTS.MASTER_DATA.FARMER_GROUPS}/${id}`, data);
  },

  async deleteFarmerGroup(id: string) {
    return api.delete(`${API_ENDPOINTS.MASTER_DATA.FARMER_GROUPS}/${id}`);
  },

  // Commodities
  async getCommodities(params?: {
    category?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return api.get(`${API_ENDPOINTS.MASTER_DATA.COMMODITIES}?${queryParams.toString()}`);
  },

  async getCommodity(id: string) {
    return api.get(`${API_ENDPOINTS.MASTER_DATA.COMMODITIES}/${id}`);
  },

  async createCommodity(data: CreateCommodityRequest) {
    return api.post(API_ENDPOINTS.MASTER_DATA.COMMODITIES, data);
  },

  async updateCommodity(id: string, data: Partial<CreateCommodityRequest>) {
    return api.put(`${API_ENDPOINTS.MASTER_DATA.COMMODITIES}/${id}`, data);
  },

  async deleteCommodity(id: string) {
    return api.delete(`${API_ENDPOINTS.MASTER_DATA.COMMODITIES}/${id}`);
  },

  // Pest Types
  async getPestTypes(params?: {
    category?: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status?: 'ACTIVE' | 'INACTIVE';
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.severity) queryParams.append('severity', params.severity);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    return api.get(`${API_ENDPOINTS.MASTER_DATA.PEST_TYPES}?${queryParams.toString()}`);
  },

  async getPestType(id: string) {
    return api.get(`${API_ENDPOINTS.MASTER_DATA.PEST_TYPES}/${id}`);
  },

  async createPestType(data: CreatePestTypeRequest) {
    return api.post(API_ENDPOINTS.MASTER_DATA.PEST_TYPES, data);
  },

  async updatePestType(id: string, data: Partial<CreatePestTypeRequest>) {
    return api.put(`${API_ENDPOINTS.MASTER_DATA.PEST_TYPES}/${id}`, data);
  },

  async deletePestType(id: string) {
    return api.delete(`${API_ENDPOINTS.MASTER_DATA.PEST_TYPES}/${id}`);
  },

  // Utility methods
  async getCommodityCategories() {
    return api.get(`${API_ENDPOINTS.MASTER_DATA.COMMODITIES}/categories`);
  },

  async getPestTypeCategories() {
    return api.get(`${API_ENDPOINTS.MASTER_DATA.PEST_TYPES}/categories`);
  },

  async getDistricts() {
    return api.get(API_ENDPOINTS.MASTER_DATA.DISTRICTS);
  },

  async getVillages(district?: string) {
    const queryParams = district ? `?district=${encodeURIComponent(district)}` : '';
    return api.get(`${API_ENDPOINTS.MASTER_DATA.VILLAGES}${queryParams}`);
  }
};

export default masterDataService;

// # END OF Master Data Service
