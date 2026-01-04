import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const router = useRouter();
  const { user, isAuthenticated, login, logout: logoutStore } = useAuthStore();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await authApi.login(credentials);
      login(response.user, response.token, response.refreshToken);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      login(response.user, response.token, response.refreshToken);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout API errors
    } finally {
      logoutStore();
      router.push('/login');
    }
  };

  return {
    user,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};
