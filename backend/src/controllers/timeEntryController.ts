import { Request, Response } from 'express';
import { TimeEntryService } from '../services/timeEntryService';

// Extended Request interface with user from auth middleware
interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export class TimeEntryController {
  // Get all time entries
  static async getAllTimeEntries(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { task_id, project_id, start_date, end_date, page, limit } = req.query;

      const options: any = {};
      if (task_id) options.task_id = task_id as string;
      if (project_id) options.project_id = project_id as string;
      if (start_date) options.start_date = start_date as string;
      if (end_date) options.end_date = end_date as string;
      if (page) options.page = parseInt(page as string);
      if (limit) options.limit = parseInt(limit as string);

      const result = await TimeEntryService.getAllTimeEntries(userId, options);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get time entries',
      });
    }
  }

  // Get time entry by ID
  static async getTimeEntryById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const timeEntry = await TimeEntryService.getTimeEntryById(id, userId);

      res.json({
        success: true,
        data: timeEntry,
      });
    } catch (error: any) {
      if (error.message === 'Time entry not found') {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to get time entry',
        });
      }
    }
  }

  // Create new time entry
  static async createTimeEntry(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { task_id, project_id, description, hours, date, billable } = req.body;

      // Validate required fields
      if (!hours || typeof hours !== 'number') {
        return res.status(400).json({
          success: false,
          error: 'Hours is required and must be a number',
        });
      }

      if (hours <= 0 || hours > 24) {
        return res.status(400).json({
          success: false,
          error: 'Hours must be between 0 and 24',
        });
      }

      const timeEntry = await TimeEntryService.createTimeEntry(userId, {
        task_id,
        project_id,
        description,
        hours,
        date,
        billable,
      });

      res.status(201).json({
        success: true,
        data: timeEntry,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create time entry',
      });
    }
  }

  // Update time entry
  static async updateTimeEntry(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { task_id, project_id, description, hours, date, billable } = req.body;

      const timeEntry = await TimeEntryService.updateTimeEntry(id, userId, {
        task_id,
        project_id,
        description,
        hours,
        date,
        billable,
      });

      res.json({
        success: true,
        data: timeEntry,
      });
    } catch (error: any) {
      if (error.message === 'Time entry not found') {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to update time entry',
        });
      }
    }
  }

  // Delete time entry
  static async deleteTimeEntry(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      await TimeEntryService.deleteTimeEntry(id, userId);

      res.json({
        success: true,
        message: 'Time entry deleted successfully',
      });
    } catch (error: any) {
      if (error.message === 'Time entry not found') {
        res.status(404).json({
          success: false,
          error: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || 'Failed to delete time entry',
        });
      }
    }
  }

  // Get time entry statistics
  static async getTimeEntryStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      console.log('📊 Getting time entry stats for user:', userId);

      const stats = await TimeEntryService.getTimeEntryStats(userId);
      console.log('✅ Time entry stats:', stats);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('❌ Error getting time entry stats:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get time entry statistics',
      });
    }
  }
}
