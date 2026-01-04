import { Response } from 'express';
import { ProjectService } from '../services/projectService';
import { AuthRequest } from '../types';

export class ProjectController {
  /**
   * Get all projects
   * GET /api/projects
   */
  static async getAllProjects(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const { client_id, status, search, page, limit } = req.query;

      console.log('📊 GET /api/projects - User:', user.id, 'Role:', user.role);

      // Get user's assigned client IDs (for non-admin users)
      const { ClientModel } = await import('../models/Client');
      const user_client_ids = user.role === 'admin'
        ? []
        : await ClientModel.getClientIdsByUser(user.id);

      console.log('🔗 User client IDs:', user_client_ids);

      const result = await ProjectService.getAllProjects({
        user_id: user.id,
        user_role: user.role as 'admin' | 'user',
        user_client_ids,
        client_id: client_id as string,
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      console.log('📦 Projects result:', { count: result.projects.length, total: result.total });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch projects',
      });
    }
  }

  /**
   * Get a single project by ID
   * GET /api/projects/:id
   */
  static async getProjectById(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { id } = req.params;

      const project = await ProjectService.getProjectById(id, user_id);

      res.status(200).json({
        success: true,
        data: project,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch project',
      });
    }
  }

  /**
   * Create a new project
   * POST /api/projects
   */
  static async createProject(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;

      // Only admin users can create projects
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Only admin users can create projects',
        });
      }

      // Clean up empty strings to null
      const projectData = {
        ...req.body,
        user_id: user.id,
        client_ids: req.body.client_ids || [],
        description: req.body.description || null,
        budget: req.body.budget || null,
        deadline: req.body.deadline || null,
        notes: req.body.notes || null,
      };

      const project = await ProjectService.createProject(projectData);

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to create project',
      });
    }
  }

  /**
   * Update a project
   * PUT /api/projects/:id
   */
  static async updateProject(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { id } = req.params;

      // Clean up empty strings to null
      const updateData = {
        client_id: req.body.client_id !== undefined ? req.body.client_id || null : undefined,
        description: req.body.description !== undefined ? req.body.description || null : undefined,
        budget: req.body.budget !== undefined ? req.body.budget || null : undefined,
        deadline: req.body.deadline !== undefined ? req.body.deadline || null : undefined,
        notes: req.body.notes !== undefined ? req.body.notes || null : undefined,
        name: req.body.name,
        status: req.body.status,
      };

      const project = await ProjectService.updateProject(id, user_id, updateData);

      res.status(200).json({
        success: true,
        data: project,
        message: 'Project updated successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to update project',
      });
    }
  }

  /**
   * Delete a project
   * DELETE /api/projects/:id
   */
  static async deleteProject(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { id } = req.params;

      const result = await ProjectService.deleteProject(id, user_id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to delete project',
      });
    }
  }

  /**
   * Get project statistics
   * GET /api/projects/stats
   */
  static async getProjectStats(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;

      const stats = await ProjectService.getProjectStats(user_id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch project statistics',
      });
    }
  }
}
