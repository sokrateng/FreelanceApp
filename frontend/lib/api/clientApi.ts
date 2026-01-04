import apiClient from './client';
import { ApiResponse, Client, CreateClientData, UpdateClientData, ClientListResponse, ClientStats } from '../types';

export const clientApi = {
  // Get all clients with pagination
  getAll: async (params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ClientListResponse> => {
    const response = await apiClient.get<ApiResponse<ClientListResponse>>('/clients', { params });
    return response.data.data!;
  },

  // Get client by ID
  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data!;
  },

  // Create new client
  create: async (data: CreateClientData): Promise<Client> => {
    const response = await apiClient.post<ApiResponse<Client>>('/clients', data);
    return response.data.data!;
  },

  // Update client
  update: async (id: string, data: UpdateClientData): Promise<Client> => {
    const response = await apiClient.put<ApiResponse<Client>>(`/clients/${id}`, data);
    return response.data.data!;
  },

  // Delete client
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },

  // Get client statistics
  getStats: async (): Promise<ClientStats> => {
    const response = await apiClient.get<ApiResponse<ClientStats>>('/clients/stats');
    return response.data.data!;
  },
};
