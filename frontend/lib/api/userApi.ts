import api from './client';

export interface ProfileData {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChangePasswordData {
  newPassword: string;
}

/**
 * User API methods for profile management
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: ProfileData): Promise<UserProfile> => {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    const response = await api.put('/auth/change-password', {
      newPassword: data.newPassword,
    });
    return response.data.data;
  },
};
