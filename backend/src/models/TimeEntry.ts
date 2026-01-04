import { pool } from '../config/database';

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

export class TimeEntryModel {
  // Get all time entries with pagination and filters
  static async getAll(
    userId: string,
    options: {
      task_id?: string;
      project_id?: string;
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<TimeEntryListResponse> {
    const {
      task_id,
      project_id,
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = options;

    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = ['user_id = $1'];
    const params: any[] = [userId];
    let paramIndex = 2;

    if (task_id) {
      conditions.push(`task_id = $${paramIndex++}`);
      params.push(task_id);
    }

    if (project_id) {
      conditions.push(`project_id = $${paramIndex++}`);
      params.push(project_id);
    }

    if (start_date) {
      conditions.push(`date >= $${paramIndex++}`);
      params.push(start_date);
    }

    if (end_date) {
      conditions.push(`date <= $${paramIndex++}`);
      params.push(end_date);
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM time_entries WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Get time entries
    const dataResult = await pool.query<TimeEntry>(
      `SELECT * FROM time_entries
       WHERE ${whereClause}
       ORDER BY date DESC, created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    return {
      timeEntries: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get time entry by ID
  static async getById(id: string, userId: string): Promise<TimeEntry | null> {
    const result = await pool.query<TimeEntry>(
      'SELECT * FROM time_entries WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  // Create new time entry
  static async create(
    userId: string,
    data: CreateTimeEntryData
  ): Promise<TimeEntry> {
    const { task_id, project_id, description, hours, date, billable = true } = data;

    const result = await pool.query<TimeEntry>(
      `INSERT INTO time_entries (user_id, task_id, project_id, description, hours, date, billable)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [userId, task_id || null, project_id || null, description || null, hours, date || new Date().toISOString().split('T')[0], billable]
    );

    return result.rows[0];
  }

  // Update time entry
  static async update(
    id: string,
    userId: string,
    data: UpdateTimeEntryData
  ): Promise<TimeEntry | null> {
    const { task_id, project_id, description, hours, date, billable } = data;

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (task_id !== undefined) {
      updates.push(`task_id = $${paramIndex++}`);
      params.push(task_id || null);
    }

    if (project_id !== undefined) {
      updates.push(`project_id = $${paramIndex++}`);
      params.push(project_id || null);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }

    if (hours !== undefined) {
      updates.push(`hours = $${paramIndex++}`);
      params.push(hours);
    }

    if (date !== undefined) {
      updates.push(`date = $${paramIndex++}`);
      params.push(date);
    }

    if (billable !== undefined) {
      updates.push(`billable = $${paramIndex++}`);
      params.push(billable);
    }

    if (updates.length === 0) return null;

    params.push(id, userId);

    const result = await pool.query<TimeEntry>(
      `UPDATE time_entries
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex++}
       RETURNING *`,
      params
    );

    return result.rows[0] || null;
  }

  // Delete time entry
  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM time_entries WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return (result.rowCount || 0) > 0;
  }

  // Get time entry statistics
  static async getStats(userId: string): Promise<TimeEntryStats> {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const [todayResult, weekResult, monthResult, totalResult, billableResult] =
      await Promise.all([
        pool.query('SELECT COALESCE(SUM(hours), 0) as hours FROM time_entries WHERE user_id = $1 AND date = $2', [userId, today]),
        pool.query('SELECT COALESCE(SUM(hours), 0) as hours FROM time_entries WHERE user_id = $1 AND date >= $2', [userId, weekAgo]),
        pool.query('SELECT COALESCE(SUM(hours), 0) as hours FROM time_entries WHERE user_id = $1 AND date >= $2', [userId, monthAgo]),
        pool.query('SELECT COALESCE(SUM(hours), 0) as hours FROM time_entries WHERE user_id = $1', [userId]),
        pool.query('SELECT COALESCE(SUM(hours), 0) as hours FROM time_entries WHERE user_id = $1 AND billable = true', [userId]),
      ]);

    return {
      today: parseFloat(todayResult.rows[0].hours),
      week: parseFloat(weekResult.rows[0].hours),
      month: parseFloat(monthResult.rows[0].hours),
      total: parseFloat(totalResult.rows[0].hours),
      billable: parseFloat(billableResult.rows[0].hours),
    };
  }
}
