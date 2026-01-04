import {
  ProjectModel,
  CreateProjectData,
  UpdateProjectData,
  ProjectQueryOptions,
} from '../models/Project';
import { AppError } from '../middleware/errorHandler';

export class ProjectService {
  /**
   * Get all projects for a user with pagination and filtering
   */
  static async getAllProjects(options: ProjectQueryOptions) {
    // If user_role and user_client_ids are provided, use access-based filtering
    if (options.user_role && options.user_client_ids) {
      return await ProjectModel.findAllByUserAccess({
        user_id: options.user_id,
        user_role: options.user_role,
        user_client_ids: options.user_client_ids,
        client_id: options.client_id,
        status: options.status,
        search: options.search,
        page: options.page,
        limit: options.limit,
      });
    }
    return await ProjectModel.findAll(options);
  }

  /**
   * Get a single project by ID
   */
  static async getProjectById(id: string, user_id: string, user_role?: 'admin' | 'user') {
    const project = await ProjectModel.findById(id, user_id, user_role);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    return project;
  }

  /**
   * Create a new project
   */
  static async createProject(data: CreateProjectData) {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new AppError('Project name is required', 400);
    }

    // Validate that at least one client is provided
    if (!data.client_ids || data.client_ids.length === 0) {
      throw new AppError('At least one client must be assigned to the project', 400);
    }

    // Validate budget if provided
    if (data.budget !== undefined && data.budget < 0) {
      throw new AppError('Budget cannot be negative', 400);
    }

    return await ProjectModel.create(data);
  }

  /**
   * Update a project
   */
  static async updateProject(
    id: string,
    user_id: string,
    data: UpdateProjectData
  ) {
    // Check if project exists
    const existingProject = await ProjectModel.findById(id, user_id);
    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }

    // Validate name if provided
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new AppError('Project name cannot be empty', 400);
    }

    // Validate budget if provided
    if (data.budget !== undefined && data.budget < 0) {
      throw new AppError('Budget cannot be negative', 400);
    }

    const updatedProject = await ProjectModel.update(id, user_id, data);
    if (!updatedProject) {
      throw new AppError('Failed to update project', 500);
    }

    return updatedProject;
  }

  /**
   * Delete a project
   */
  static async deleteProject(id: string, user_id: string) {
    // Check if project exists
    const existingProject = await ProjectModel.findById(id, user_id);
    if (!existingProject) {
      throw new AppError('Project not found', 404);
    }

    const deleted = await ProjectModel.delete(id, user_id);
    if (!deleted) {
      throw new AppError('Failed to delete project', 500);
    }

    return { message: 'Project deleted successfully' };
  }

  /**
   * Get project statistics
   */
  static async getProjectStats(user_id: string) {
    return await ProjectModel.countByStatus(user_id);
  }
}
