import { TimeEntryModel, CreateTimeEntryData, UpdateTimeEntryData, TimeEntryStats } from '../models/TimeEntry';

export class TimeEntryService {
  // Get all time entries for a user
  static async getAllTimeEntries(
    userId: string,
    options: {
      task_id?: string;
      project_id?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    return await TimeEntryModel.getAll(userId, options);
  }

  // Get time entry by ID
  static async getTimeEntryById(id: string, userId: string) {
    const timeEntry = await TimeEntryModel.getById(id, userId);

    if (!timeEntry) {
      throw new Error('Time entry not found');
    }

    return timeEntry;
  }

  // Create new time entry
  static async createTimeEntry(
    userId: string,
    data: CreateTimeEntryData
  ) {
    // Validate hours
    if (data.hours <= 0) {
      throw new Error('Hours must be greater than 0');
    }

    if (data.hours > 24) {
      throw new Error('Hours cannot exceed 24 for a single entry');
    }

    // Validate date
    if (data.date) {
      const entryDate = new Date(data.date);
      entryDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (entryDate > today) {
        throw new Error('Date cannot be in the future');
      }
    }

    return await TimeEntryModel.create(userId, data);
  }

  // Update time entry
  static async updateTimeEntry(
    id: string,
    userId: string,
    data: UpdateTimeEntryData
  ) {
    const timeEntry = await TimeEntryModel.getById(id, userId);

    if (!timeEntry) {
      throw new Error('Time entry not found');
    }

    // Validate hours if provided
    if (data.hours !== undefined) {
      if (data.hours <= 0) {
        throw new Error('Hours must be greater than 0');
      }

      if (data.hours > 24) {
        throw new Error('Hours cannot exceed 24 for a single entry');
      }
    }

    // Validate date if provided
    if (data.date) {
      const entryDate = new Date(data.date);
      entryDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (entryDate > today) {
        throw new Error('Date cannot be in the future');
      }
    }

    return await TimeEntryModel.update(id, userId, data);
  }

  // Delete time entry
  static async deleteTimeEntry(id: string, userId: string) {
    const timeEntry = await TimeEntryModel.getById(id, userId);

    if (!timeEntry) {
      throw new Error('Time entry not found');
    }

    return await TimeEntryModel.delete(id, userId);
  }

  // Get time entry statistics
  static async getTimeEntryStats(userId: string): Promise<TimeEntryStats> {
    return await TimeEntryModel.getStats(userId);
  }
}
