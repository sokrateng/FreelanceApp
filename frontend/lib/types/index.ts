// User types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Client types
export type ClientStatus = 'active' | 'inactive' | 'archived';

// Project types
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

// Task types
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateClientData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status?: ClientStatus;
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status?: ClientStatus;
  notes?: string;
}

export interface ClientListResponse {
  clients: Client[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ClientStats {
  active: number;
  inactive: number;
  archived: number;
  total: number;
}

// Project types
export interface Project {
  id: string;
  user_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  deadline: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  client_ids?: string[];  // Array of client IDs (at least one required)
  name: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  deadline?: string;
  notes?: string;
}

export interface UpdateProjectData {
  client_id?: string;  // Single client ID (primary client)
  client_ids?: string[];  // Array of client IDs (for multi-client projects)
  name?: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  deadline?: string;
  notes?: string;
}

export interface ProjectListResponse {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProjectStats {
  planning: number;
  active: number;
  on_hold: number;
  completed: number;
  cancelled: number;
  total: number;
}

// Task types
export interface Task {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskData {
  project_id?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

export interface UpdateTaskData {
  project_id?: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  position?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TaskStats {
  todo: number;
  in_progress: number;
  review: number;
  done: number;
  total: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Time Entry types
export interface TimeEntry {
  id: string;
  user_id: string;
  task_id: string | null;
  project_id: string | null;
  description: string | null;
  hours: number;
  date: string;
  billable: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeEntryData {
  task_id?: string;
  project_id?: string;
  description?: string;
  hours: number;
  date?: string;
  billable?: boolean;
}

export interface UpdateTimeEntryData {
  task_id?: string;
  project_id?: string;
  description?: string;
  hours?: number;
  date?: string;
  billable?: boolean;
}

export interface TimeEntryListResponse {
  timeEntries: TimeEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TimeEntryStats {
  today: number;
  week: number;
  month: number;
  total: number;
  billable: number;
}
