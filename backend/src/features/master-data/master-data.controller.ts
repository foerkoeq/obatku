// # START OF Master Data Controller - API controller for master data management
// Purpose: Handle HTTP requests for farmer groups, commodities, pest types, and reference data
// Dependencies: Express, master data service, validation middleware
// Returns: HTTP responses for master data operations

import { Request, Response } from 'express';
import { MasterDataService } from './master-data.service';
import { validateMasterData } from './master-data.validation';
import { ApiResponse } from '../../common/types/api-response';

export class MasterDataController {
  constructor(private masterDataService: MasterDataService) {}

  // ================================================
  // FARMER GROUPS
  // ================================================

  async getFarmerGroups(req: Request, res: Response): Promise<void> {
    try {
      const {
        district,
        village,
        status,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      const params = {
        district: district as string,
        village: village as string,
        status: status as 'ACTIVE' | 'INACTIVE',
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await this.masterDataService.getFarmerGroups(params);
      
      const response: ApiResponse = {
        success: true,
        message: 'Farmer groups retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting farmer groups:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve farmer groups',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async getFarmerGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.masterDataService.getFarmerGroup(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Farmer group retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting farmer group:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve farmer group',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async createFarmerGroup(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateMasterData.farmerGroup.safeParse(req.body);
      if (!validation.success) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: validation.error.errors
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.masterDataService.createFarmerGroup(validation.data, req.user?.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Farmer group created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating farmer group:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create farmer group',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async updateFarmerGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = validateMasterData.farmerGroup.partial().safeParse(req.body);
      if (!validation.success) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: validation.error.errors
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.masterDataService.updateFarmerGroup(id, validation.data, req.user?.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Farmer group updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating farmer group:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update farmer group',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async deleteFarmerGroup(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.masterDataService.deleteFarmerGroup(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Farmer group deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error deleting farmer group:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete farmer group',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // ================================================
  // COMMODITIES
  // ================================================

  async getCommodities(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        status,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      const params = {
        category: category as string,
        status: status as 'ACTIVE' | 'INACTIVE',
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await this.masterDataService.getCommodities(params);
      
      const response: ApiResponse = {
        success: true,
        message: 'Commodities retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting commodities:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve commodities',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async getCommodity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.masterDataService.getCommodity(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Commodity retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting commodity:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve commodity',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async createCommodity(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateMasterData.commodity.safeParse(req.body);
      if (!validation.success) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: validation.error.errors
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.masterDataService.createCommodity(validation.data, req.user?.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Commodity created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating commodity:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create commodity',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async updateCommodity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = validateMasterData.commodity.partial().safeParse(req.body);
      if (!validation.success) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: validation.error.errors
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.masterDataService.updateCommodity(id, validation.data, req.user?.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Commodity updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating commodity:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update commodity',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async deleteCommodity(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.masterDataService.deleteCommodity(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Commodity deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error deleting commodity:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete commodity',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // ================================================
  // PEST TYPES
  // ================================================

  async getPestTypes(req: Request, res: Response): Promise<void> {
    try {
      const {
        category,
        severity,
        status,
        search,
        page = '1',
        limit = '50'
      } = req.query;

      const params = {
        category: category as string,
        severity: severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        status: status as 'ACTIVE' | 'INACTIVE',
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await this.masterDataService.getPestTypes(params);
      
      const response: ApiResponse = {
        success: true,
        message: 'Pest types retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting pest types:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve pest types',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async getPestType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await this.masterDataService.getPestType(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Pest type retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting pest type:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve pest type',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async createPestType(req: Request, res: Response): Promise<void> {
    try {
      const validation = validateMasterData.pestType.safeParse(req.body);
      if (!validation.success) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: validation.error.errors
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.masterDataService.createPestType(validation.data, req.user?.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Pest type created successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating pest type:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to create pest type',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async updatePestType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = validateMasterData.pestType.partial().safeParse(req.body);
      if (!validation.success) {
        const response: ApiResponse = {
          success: false,
          message: 'Validation failed',
          error: validation.error.errors
        };
        res.status(400).json(response);
        return;
      }

      const result = await this.masterDataService.updatePestType(id, validation.data, req.user?.id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Pest type updated successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error updating pest type:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to update pest type',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async deletePestType(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.masterDataService.deletePestType(id);
      
      const response: ApiResponse = {
        success: true,
        message: 'Pest type deleted successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error deleting pest type:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to delete pest type',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  // ================================================
  // UTILITY ENDPOINTS
  // ================================================

  async getCommodityCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.masterDataService.getCommodityCategories();
      
      const response: ApiResponse = {
        success: true,
        message: 'Commodity categories retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting commodity categories:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve commodity categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async getPestTypeCategories(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.masterDataService.getPestTypeCategories();
      
      const response: ApiResponse = {
        success: true,
        message: 'Pest type categories retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting pest type categories:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve pest type categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async getDistricts(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.masterDataService.getDistricts();
      
      const response: ApiResponse = {
        success: true,
        message: 'Districts retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting districts:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve districts',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }

  async getVillages(req: Request, res: Response): Promise<void> {
    try {
      const { district } = req.query;
      const result = await this.masterDataService.getVillages(district as string);
      
      const response: ApiResponse = {
        success: true,
        message: 'Villages retrieved successfully',
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error getting villages:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to retrieve villages',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      res.status(500).json(response);
    }
  }
}

// # END OF Master Data Controller
