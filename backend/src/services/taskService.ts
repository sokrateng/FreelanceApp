import {
  TaskModel,
  CreateTaskData,
  UpdateTaskData,
  TaskQueryOptions,
} from '../models/Task';
import { AppError } from '../middleware/errorHandler';

export class TaskService {
  /**
   * Get all tasks for a user with pagination and filtering
   */
  static async getAllTasks(options: TaskQueryOptions) {
    return await TaskModel.findAll(options);
  }

  /**
   * Get a single task by ID
   */
  static async getTaskById(id: string, user_id: string) {
    const task = await TaskModel.findById(id, user_id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  /**
   * Create a new task
   */
  static async createTask(data: CreateTaskData) {
    // Validate required fields
    if (!data.title || data.title.trim().length === 0) {
      throw new AppError('Task title is required', 400);
    }

    // Project is required
    if (!data.project_id || data.project_id.trim().length === 0) {
      throw new AppError('Project is required', 400);
    }

    // Due date is required
    if (!data.due_date || data.due_date.trim().length === 0) {
      throw new AppError('Due date is required', 400);
    }

    // Validate estimated hours if provided
    if (data.estimated_hours !== undefined && data.estimated_hours < 0) {
      throw new AppError('Estimated hours cannot be negative', 400);
    }

    // Validate actual hours if provided
    if (data.actual_hours !== undefined && data.actual_hours < 0) {
      throw new AppError('Actual hours cannot be negative', 400);
    }

    return await TaskModel.create(data);
  }

  /**
   * Update a task
   */
  static async updateTask(
    id: string,
    user_id: string,
    data: UpdateTaskData
  ) {
    // Check if task exists
    const existingTask = await TaskModel.findById(id, user_id);
    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }

    // Validate title if provided
    if (data.title !== undefined && data.title.trim().length === 0) {
      throw new AppError('Task title cannot be empty', 400);
    }

    // Validate hours if provided
    if (data.estimated_hours !== undefined && data.estimated_hours < 0) {
      throw new AppError('Estimated hours cannot be negative', 400);
    }

    if (data.actual_hours !== undefined && data.actual_hours < 0) {
      throw new AppError('Actual hours cannot be negative', 400);
    }

    const updatedTask = await TaskModel.update(id, user_id, data);
    if (!updatedTask) {
      throw new AppError('Failed to update task', 500);
    }

    return updatedTask;
  }

  /**
   * Delete a task
   */
  static async deleteTask(id: string, user_id: string) {
    // Check if task exists
    const existingTask = await TaskModel.findById(id, user_id);
    if (!existingTask) {
      throw new AppError('Task not found', 404);
    }

    const deleted = await TaskModel.delete(id, user_id);
    if (!deleted) {
      throw new AppError('Failed to delete task', 500);
    }

    return { message: 'Task deleted successfully' };
  }

  /**
   * Get task statistics
   */
  static async getTaskStats(user_id: string, project_id?: string) {
    return await TaskModel.countByStatus(user_id, project_id);
  }
}
