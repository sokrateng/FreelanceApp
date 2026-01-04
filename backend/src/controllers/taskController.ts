import { Response } from 'express';
import { TaskService } from '../services/taskService';
import { AuthRequest } from '../types';

export class TaskController {
  /**
   * Get all tasks
   * GET /api/tasks
   */
  static async getAllTasks(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { project_id, status, priority, search, page, limit } = req.query;

      const result = await TaskService.getAllTasks({
        user_id,
        project_id: project_id as string,
        status: status as string,
        priority: priority as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch tasks',
      });
    }
  }

  /**
   * Get a single task by ID
   * GET /api/tasks/:id
   */
  static async getTaskById(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { id } = req.params;

      const task = await TaskService.getTaskById(id, user_id);

      res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch task',
      });
    }
  }

  /**
   * Create a new task
   * POST /api/tasks
   */
  static async createTask(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const taskData = { ...req.body, user_id };

      const task = await TaskService.createTask(taskData);

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to create task',
      });
    }
  }

  /**
   * Update a task
   * PUT /api/tasks/:id
   */
  static async updateTask(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { id } = req.params;
      const updateData = req.body;

      const task = await TaskService.updateTask(id, user_id, updateData);

      res.status(200).json({
        success: true,
        data: task,
        message: 'Task updated successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to update task',
      });
    }
  }

  /**
   * Delete a task
   * DELETE /api/tasks/:id
   */
  static async deleteTask(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { id } = req.params;

      const result = await TaskService.deleteTask(id, user_id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to delete task',
      });
    }
  }

  /**
   * Get task statistics
   * GET /api/tasks/stats
   */
  static async getTaskStats(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { project_id } = req.query;

      const stats = await TaskService.getTaskStats(user_id, project_id as string);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch task statistics',
      });
    }
  }
}
