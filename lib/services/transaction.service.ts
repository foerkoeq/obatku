import { api } from '../api/client';
import { API_ENDPOINTS } from './api';

/**
 * Transaction Service
 * Provides frontend API wrappers for transaction-related endpoints used by the UI
 */

export const transactionService = {
  // Submit a new transaction (submission) with optional file and items
  async submit(submission: any, file?: File) {
    // If file provided upload first and attach returned file id/url
    try {
      let payload = { ...submission };

      if (file) {
        // Use api.upload which accepts a File
        const uploadResp = await api.upload(`${API_ENDPOINTS.TRANSACTIONS.BASE}/upload`, file, { withCredentials: true });
        if (!uploadResp.success) throw uploadResp;
        payload.letterFile = uploadResp.data; // attach whatever server returns
      }

      const resp = await api.post(`${API_ENDPOINTS.TRANSACTIONS.BASE}`, payload, { withCredentials: true });
      return resp;
    } catch (err) {
      throw err;
    }
  },

  // Approve a transaction
  async approve(id: string, body: any) {
    return api.post(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}/approve`, body);
  },

  // Process (issue) a transaction
  async process(id: string, body: any) {
    return api.post(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}/process`, body);
  },

  // Complete a transaction
  async complete(id: string, body: any) {
    return api.post(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}/complete`, body);
  },

  // List transactions with querystring built by caller
  async list(queryString = '') {
    return api.get(`${API_ENDPOINTS.TRANSACTIONS.BASE}${queryString}`);
  },

  // Get transaction detail
  async get(id: string) {
    return api.get(`${API_ENDPOINTS.TRANSACTIONS.BASE}/${id}`);
  },

  // Export (PDF/Excel) - server should return a file url or blob
  async export(format: 'pdf' | 'excel', params: any = {}) {
    const qs = new URLSearchParams({ format, ...params }).toString();
    return api.get(`${API_ENDPOINTS.REPORTS?.TRANSACTIONS || '/reports/transactions'}?${qs}`);
  }
};

export default transactionService;
