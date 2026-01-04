import apiClient from './client';
import { LoginCredentials, RegisterData, AuthResponse, ApiResponse, User } from '../types';

export interface UserWithInviteStatus extends User {
  is_pending?: boolean;
  invite_token_expiry?: Date | null;
}

export const authApi = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data!;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data.data!;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ token: string; refreshToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>(
      '/auth/refresh-token',
      { refreshToken }
    );
    return response.data.data!;
  },

  // Logout (client-side only)
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // Invite user (admin only)
  inviteUser: async (data: {
    email: string;
    first_name: string;
    last_name: string;
    role?: 'admin' | 'user';
    client_ids?: string[];
  }): Promise<{ message: string; user: User }> => {
    const response = await apiClient.post<ApiResponse<{ message: string; user: User }>>(
      '/auth/invite',
      data
    );
    return response.data.data!;
  },

  // Get user client IDs
  getUserClients: async (userId: string): Promise<{ client_ids: string[] }> => {
    const response = await apiClient.get<ApiResponse<{ client_ids: string[] }>>(
      `/auth/${userId}/clients`
    );
    return response.data.data!;
  },

  // Update user client assignments (admin only)
  updateUserClients: async (userId: string, client_ids: string[]): Promise<{ message: string }> => {
    const response = await apiClient.put<ApiResponse<{ message: string }>>(
      `/auth/${userId}/clients`,
      { client_ids }
    );
    return response.data.data!;
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<UserWithInviteStatus[]> => {
    const response = await apiClient.get<ApiResponse<UserWithInviteStatus[]>>('/auth/users');
    return response.data.data!;
  },

  // Resend invitation (admin only)
  resendInvite: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      `/auth/users/${userId}/resend-invite`
    );
    return response.data.data!;
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(
      `/auth/${userId}`
    );
    return response.data.data!;
  },

  // Accept invitation
  acceptInvitation: async (data: {
    token: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/accept-invitation',
      data
    );
    return response.data.data!;
  },
};
