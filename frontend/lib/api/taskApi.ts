import apiClient from './client';
import { ApiResponse, Task, CreateTaskData, UpdateTaskData, TaskListResponse, TaskStats } from '../types';

export const taskApi = {
  // Get all tasks with pagination
  getAll: async (params?: {
    project_id?: string;
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<TaskListResponse> => {
    const response = await apiClient.get<ApiResponse<TaskListResponse>>('/tasks', { params });
    return response.data.data!;
  },

  // Get task by ID
  getById: async (id: string): Promise<Task> => {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    return response.data.data!;
  },

  // Create new task
  create: async (data: CreateTaskData): Promise<Task> => {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', data);
    return response.data.data!;
  },

  // Update task
  update: async (id: string, data: UpdateTaskData): Promise<Task> => {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data);
    return response.data.data!;
  },

  // Delete task
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },

  // Get task statistics
  getStats: async (project_id?: string): Promise<TaskStats> => {
    const response = await apiClient.get<ApiResponse<TaskStats>>('/tasks/stats', {
      params: project_id ? { project_id } : undefined
    });
    return response.data.data!;
  },
};
