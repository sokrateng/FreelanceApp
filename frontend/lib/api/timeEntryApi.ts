import apiClient from './client';
import { ApiResponse, TimeEntry, CreateTimeEntryData, UpdateTimeEntryData, TimeEntryListResponse, TimeEntryStats } from '../types';

export const timeEntryApi = {
  // Get all time entries with pagination
  getAll: async (params?: {
    task_id?: string;
    project_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  }): Promise<TimeEntryListResponse> => {
    const response = await apiClient.get<ApiResponse<TimeEntryListResponse>>('/time-entries', { params });
    return response.data.data!;
  },

  // Get time entry by ID
  getById: async (id: string): Promise<TimeEntry> => {
    const response = await apiClient.get<ApiResponse<TimeEntry>>(`/time-entries/${id}`);
    return response.data.data!;
  },

  // Create new time entry
  create: async (data: CreateTimeEntryData): Promise<TimeEntry> => {
    const response = await apiClient.post<ApiResponse<TimeEntry>>('/time-entries', data);
    return response.data.data!;
  },

  // Update time entry
  update: async (id: string, data: UpdateTimeEntryData): Promise<TimeEntry> => {
    const response = await apiClient.put<ApiResponse<TimeEntry>>(`/time-entries/${id}`, data);
    return response.data.data!;
  },

  // Delete time entry
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/time-entries/${id}`);
  },

  // Get time entry statistics
  getStats: async (): Promise<TimeEntryStats> => {
    const response = await apiClient.get<ApiResponse<TimeEntryStats>>('/time-entries/stats');
    return response.data.data!;
  },
};
