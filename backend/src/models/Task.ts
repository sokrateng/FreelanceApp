import pool from '../config/database';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

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
  created_at: Date;
  updated_at: Date;
}

export interface CreateTaskData {
  user_id: string;
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

export interface TaskQueryOptions {
  user_id: string;
  project_id?: string;
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class TaskModel {
  /**
   * Find task by ID
   */
  static async findById(id: string, user_id: string): Promise<Task | null> {
    const result = await pool.query<Task>(
      'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all tasks for a user with pagination and filtering
   */
  static async findAll(options: TaskQueryOptions): Promise<{
    tasks: Task[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { user_id, project_id, status, priority, search, page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM tasks WHERE user_id = $1';
    const params: any[] = [user_id];
    let paramIndex = 2;

    // Add project filter
    if (project_id) {
      query += ` AND project_id = $${paramIndex}`;
      countQuery += ` AND project_id = $${paramIndex}`;
      params.push(project_id);
      paramIndex++;
    }

    // Add status filter
    if (status) {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Add priority filter
    if (priority) {
      query += ` AND priority = $${paramIndex}`;
      countQuery += ` AND priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      countQuery += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting and pagination
    query += ` ORDER BY position ASC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute queries
    const [tasksResult, countResult] = await Promise.all([
      pool.query<Task>(query, params),
      pool.query<{ count: string }>(countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      tasks: tasksResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create a new task
   */
  static async create(data: CreateTaskData): Promise<Task> {
    const {
      user_id,
      project_id = null,
      title,
      description = null,
      status = 'todo',
      priority = 'medium',
      due_date = null,
      estimated_hours = null,
      actual_hours = null,
    } = data;

    // Get next position
    const positionResult = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM tasks WHERE user_id = $1',
      [user_id]
    );
    const position = parseInt(positionResult.rows[0].next_pos, 10);

    const result = await pool.query<Task>(
      `INSERT INTO tasks (user_id, project_id, title, description, status, priority, due_date, estimated_hours, actual_hours, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [user_id, project_id, title, description, status, priority, due_date, estimated_hours, actual_hours, position]
    );

    return result.rows[0];
  }

  /**
   * Update a task
   */
  static async update(
    id: string,
    user_id: string,
    data: UpdateTaskData
  ): Promise<Task | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.findById(id, user_id);
    }

    values.push(id, user_id);

    const query = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query<Task>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a task
   */
  static async delete(id: string, user_id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Count tasks by status for a user
   */
  static async countByStatus(user_id: string, project_id?: string): Promise<{
    todo: number;
    in_progress: number;
    review: number;
    done: number;
    total: number;
  }> {
    let query = `SELECT status, COUNT(*) as count
       FROM tasks
       WHERE user_id = $1`;
    const params = [user_id];

    if (project_id) {
      query += ' AND project_id = $2';
      params.push(project_id);
    }

    query += ' GROUP BY status';

    const result = await pool.query<{
      status: string;
      count: string;
    }>(query, params);

    const counts = {
      todo: 0,
      in_progress: 0,
      review: 0,
      done: 0,
      total: 0,
    };

    result.rows.forEach((row) => {
      const count = parseInt(row.count, 10);
      if (row.status in counts) {
        counts[row.status as keyof typeof counts] = count;
      }
      counts.total += count;
    });

    return counts;
  }
}
