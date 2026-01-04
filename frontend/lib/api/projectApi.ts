import apiClient from './client';
import { ApiResponse, Project, CreateProjectData, UpdateProjectData, ProjectListResponse, ProjectStats } from '../types';

export const projectApi = {
  // Get all projects with pagination
  getAll: async (params?: {
    client_id?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ProjectListResponse> => {
    const response = await apiClient.get<ApiResponse<ProjectListResponse>>('/projects', { params });
    return response.data.data!;
  },

  // Get project by ID
  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data!;
  },

  // Create new project
  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>('/projects', data);
    return response.data.data!;
  },

  // Update project
  update: async (id: string, data: UpdateProjectData): Promise<Project> => {
    const response = await apiClient.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data!;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  // Get project statistics
  getStats: async (): Promise<ProjectStats> => {
    const response = await apiClient.get<ApiResponse<ProjectStats>>('/projects/stats');
    return response.data.data!;
  },
};
