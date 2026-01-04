import { Request } from 'express';

// User types
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  is_active: boolean;
  invite_token?: string;
  invite_token_expiry?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

// Extend Express Request to include user
export interface AuthRequest extends Request {
  user?: UserPayload;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Client with associations
export interface ClientWithAssociations {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  status: 'active' | 'inactive' | 'archived';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  // User IDs associated with this client
  user_ids?: string[];
  // Project IDs associated with this client
  project_ids?: string[];
}

// Project with client associations
export interface ProjectWithClients {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  budget: number | null;
  deadline: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
  // Client IDs associated with this project
  client_ids: string[];
  // Client details (optional, populated when needed)
  clients?: Array<{
    id: string;
    name: string;
    email: string | null;
    company: string | null;
  }>;
}
