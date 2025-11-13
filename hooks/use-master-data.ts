// # START OF Master Data Hooks - Custom hooks for master data management
// Purpose: Provide reusable hooks for fetching and managing master data
// Dependencies: React hooks, master data service
// Returns: Master data state and operations

"use client";

import { useState, useEffect, useCallback } from 'react';
import { masterDataService, FarmerGroup, Commodity, PestType } from '@/lib/services/master-data.service';
import { toast } from 'sonner';

// # START OF useFarmerGroups Hook - Hook for farmer groups management
// Purpose: Manage farmer groups data with CRUD operations
// Returns: Farmer groups state and operations
// Dependencies: masterDataService

export const useFarmerGroups = (params?: {
  district?: string;
  village?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const [farmerGroups, setFarmerGroups] = useState<FarmerGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchFarmerGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await masterDataService.getFarmerGroups(params);
      if (response.success) {
        setFarmerGroups(response.data.items || response.data);
        setTotal(response.data.total || response.data.length);
      } else {
        throw new Error(response.message || 'Failed to fetch farmer groups');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch farmer groups';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createFarmerGroup = useCallback(async (data: any) => {
    try {
      const response = await masterDataService.createFarmerGroup(data);
      if (response.success) {
        toast.success('Kelompok tani berhasil ditambahkan');
        await fetchFarmerGroups(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create farmer group');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create farmer group';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchFarmerGroups]);

  const updateFarmerGroup = useCallback(async (id: string, data: any) => {
    try {
      const response = await masterDataService.updateFarmerGroup(id, data);
      if (response.success) {
        toast.success('Kelompok tani berhasil diperbarui');
        await fetchFarmerGroups(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update farmer group');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update farmer group';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchFarmerGroups]);

  const deleteFarmerGroup = useCallback(async (id: string) => {
    try {
      const response = await masterDataService.deleteFarmerGroup(id);
      if (response.success) {
        toast.success('Kelompok tani berhasil dihapus');
        await fetchFarmerGroups(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete farmer group');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete farmer group';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchFarmerGroups]);

  useEffect(() => {
    fetchFarmerGroups();
  }, [fetchFarmerGroups]);

  return {
    farmerGroups,
    loading,
    error,
    total,
    refetch: fetchFarmerGroups,
    createFarmerGroup,
    updateFarmerGroup,
    deleteFarmerGroup,
  };
};

// # END OF useFarmerGroups Hook

// # START OF useCommodities Hook - Hook for commodities management
// Purpose: Manage commodities data with CRUD operations
// Returns: Commodities state and operations
// Dependencies: masterDataService

export const useCommodities = (params?: {
  category?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchCommodities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await masterDataService.getCommodities(params);
      if (response.success) {
        setCommodities(response.data.items || response.data);
        setTotal(response.data.total || response.data.length);
      } else {
        throw new Error(response.message || 'Failed to fetch commodities');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch commodities';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createCommodity = useCallback(async (data: any) => {
    try {
      const response = await masterDataService.createCommodity(data);
      if (response.success) {
        toast.success('Komoditas berhasil ditambahkan');
        await fetchCommodities(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create commodity');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create commodity';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCommodities]);

  const updateCommodity = useCallback(async (id: string, data: any) => {
    try {
      const response = await masterDataService.updateCommodity(id, data);
      if (response.success) {
        toast.success('Komoditas berhasil diperbarui');
        await fetchCommodities(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update commodity');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update commodity';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCommodities]);

  const deleteCommodity = useCallback(async (id: string) => {
    try {
      const response = await masterDataService.deleteCommodity(id);
      if (response.success) {
        toast.success('Komoditas berhasil dihapus');
        await fetchCommodities(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete commodity');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete commodity';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchCommodities]);

  useEffect(() => {
    fetchCommodities();
  }, [fetchCommodities]);

  return {
    commodities,
    loading,
    error,
    total,
    refetch: fetchCommodities,
    createCommodity,
    updateCommodity,
    deleteCommodity,
  };
};

// # END OF useCommodities Hook

// # START OF usePestTypes Hook - Hook for pest types management
// Purpose: Manage pest types data with CRUD operations
// Returns: Pest types state and operations
// Dependencies: masterDataService

export const usePestTypes = (params?: {
  category?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const [pestTypes, setPestTypes] = useState<PestType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchPestTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await masterDataService.getPestTypes(params);
      if (response.success) {
        setPestTypes(response.data.items || response.data);
        setTotal(response.data.total || response.data.length);
      } else {
        throw new Error(response.message || 'Failed to fetch pest types');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pest types';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  const createPestType = useCallback(async (data: any) => {
    try {
      const response = await masterDataService.createPestType(data);
      if (response.success) {
        toast.success('Jenis OPT berhasil ditambahkan');
        await fetchPestTypes(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create pest type');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create pest type';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchPestTypes]);

  const updatePestType = useCallback(async (id: string, data: any) => {
    try {
      const response = await masterDataService.updatePestType(id, data);
      if (response.success) {
        toast.success('Jenis OPT berhasil diperbarui');
        await fetchPestTypes(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update pest type');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update pest type';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchPestTypes]);

  const deletePestType = useCallback(async (id: string) => {
    try {
      const response = await masterDataService.deletePestType(id);
      if (response.success) {
        toast.success('Jenis OPT berhasil dihapus');
        await fetchPestTypes(); // Refresh the list
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to delete pest type');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete pest type';
      toast.error(errorMessage);
      throw err;
    }
  }, [fetchPestTypes]);

  useEffect(() => {
    fetchPestTypes();
  }, [fetchPestTypes]);

  return {
    pestTypes,
    loading,
    error,
    total,
    refetch: fetchPestTypes,
    createPestType,
    updatePestType,
    deletePestType,
  };
};

// # END OF usePestTypes Hook

// # START OF useDistricts Hook - Hook for districts management
// Purpose: Manage districts data
// Returns: Districts state and operations
// Dependencies: masterDataService

export const useDistricts = () => {
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDistricts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await masterDataService.getDistricts();
      if (response.success) {
        setDistricts(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch districts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch districts';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  return {
    districts,
    loading,
    error,
    refetch: fetchDistricts,
  };
};

// # END OF useDistricts Hook

// # START OF useVillages Hook - Hook for villages management
// Purpose: Manage villages data based on district
// Returns: Villages state and operations
// Dependencies: masterDataService

export const useVillages = (district?: string) => {
  const [villages, setVillages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVillages = useCallback(async () => {
    if (!district) {
      setVillages([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await masterDataService.getVillages(district);
      if (response.success) {
        setVillages(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch villages');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch villages';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [district]);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  return {
    villages,
    loading,
    error,
    refetch: fetchVillages,
  };
};

// # END OF useVillages Hook

// # END OF Master Data Hooks
