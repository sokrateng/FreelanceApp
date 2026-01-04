import pool from '../config/database';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';

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
  created_at: Date;
  updated_at: Date;
}

export interface CreateProjectData {
  user_id: string;
  client_ids?: string[];  // Array of client IDs (at least one required for non-admin)
  name: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  deadline?: string;
  notes?: string;
}

export interface UpdateProjectData {
  client_ids?: string[];  // Array of client IDs
  name?: string;
  description?: string;
  status?: ProjectStatus;
  budget?: number;
  deadline?: string;
  notes?: string;
}

export interface ProjectQueryOptions {
  user_id: string;
  user_role?: 'admin' | 'user';
  user_client_ids?: string[];
  client_id?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ProjectModel {
  /**
   * Find project by ID
   */
  static async findById(id: string, user_id: string, user_role?: 'admin' | 'user'): Promise<Project | null> {
    let result;
    
    if (user_role === 'admin') {
      // Admin users can see all their projects
      result = await pool.query<any>(
        `SELECT *, TO_CHAR(deadline, 'YYYY-MM-DD') as deadline FROM projects WHERE id = $1`,
        [id]
      );
    } else {
      // Non-admin users can only see projects for their assigned clients
      // First get the user's assigned client IDs
      const clientResult = await pool.query<{ client_id: string }>(
        'SELECT client_id FROM user_clients WHERE user_id = $1',
        [user_id]
      );
      
      const user_client_ids = clientResult.rows.map(row => row.client_id);
      
      if (user_client_ids.length === 0) {
        // User has no assigned clients, can't see any projects
        return null;
      }
      
      // Check if project exists and is linked to one of the user's assigned clients
      result = await pool.query<any>(
        `SELECT *, TO_CHAR(deadline, 'YYYY-MM-DD') as deadline 
         FROM projects 
         WHERE id = $1 AND id IN (SELECT project_id FROM project_clients WHERE client_id = ANY($2))`,
        [id, user_client_ids]
      );
    }
    
    const project = result.rows[0] || null;
    if (!project) return null;

    return project;
  }

  /**
   * Helper method to format date as YYYY-MM-DD string without timezone issues
   */
  private static formatDateOnly(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Find all projects for a user with pagination and filtering
   */
  static async findAll(options: ProjectQueryOptions): Promise<{
    projects: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { user_id, client_id, status, search, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let query = `SELECT *, TO_CHAR(deadline, 'YYYY-MM-DD') as deadline FROM projects WHERE user_id = $1`;
    let countQuery = 'SELECT COUNT(*) FROM projects WHERE user_id = $1';
    const params: any[] = [user_id];
    let paramIndex = 2;

    // Add client filter
    if (client_id) {
      query += ` AND client_id = $${paramIndex}`;
      countQuery += ` AND client_id = $${paramIndex}`;
      params.push(client_id);
      paramIndex++;
    }

    // Add status filter
    if (status) {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      countQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute queries
    const [projectsResult, countResult] = await Promise.all([
      pool.query<Project>(query, params),
      pool.query<{ count: string }>(countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    // PostgreSQL TO_CHAR already formatted the deadline correctly
    const projects = projectsResult.rows;

    return {
      projects,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create a new project
   */
  static async create(data: CreateProjectData): Promise<Project> {
    const {
      user_id,
      client_ids = [],
      name,
      description = null,
      status = 'planning',
      budget = null,
      deadline = null,
      notes = null,
    } = data;

    // For backward compatibility, use first client_id if single client provided
    const client_id = client_ids.length > 0 ? client_ids[0] : null;

    const result = await pool.query<Project>(
      `INSERT INTO projects (user_id, client_id, name, description, status, budget, deadline, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, client_id, name, description, status, budget, TO_CHAR(deadline, 'YYYY-MM-DD') as deadline, notes, created_at, updated_at`,
      [user_id, client_id, name, description, status, budget, deadline, notes]
    );

    const project = result.rows[0];

    // Create project-client associations
    if (client_ids.length > 0) {
      await this.setClientIds(project.id, client_ids);
    }

    return project;
  }

  /**
   * Update a project
   */
  static async update(
    id: string,
    user_id: string,
    data: UpdateProjectData
  ): Promise<Project | null> {
    const { client_ids, ...otherData } = data;
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Build dynamic update query (exclude client_ids from main update)
    Object.entries(otherData).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0 && client_ids === undefined) {
      return this.findById(id, user_id);
    }

    values.push(id, user_id);

    const query = `
      UPDATE projects
      SET ${fields.length > 0 ? fields.join(', ') : 'client_id = client_id'}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING id, user_id, client_id, name, description, status, budget, TO_CHAR(deadline, 'YYYY-MM-DD') as deadline, notes, created_at, updated_at
    `;

    const result = await pool.query<Project>(query, values);
    const project = result.rows[0] || null;

    if (!project) return null;

    // Update client associations if provided
    if (client_ids !== undefined) {
      // For backward compatibility, update client_id to first client
      if (client_ids.length > 0) {
        await pool.query(
          'UPDATE projects SET client_id = $1 WHERE id = $2',
          [client_ids[0], id]
        );
      } else {
        await pool.query(
          'UPDATE projects SET client_id = NULL WHERE id = $1',
          [id]
        );
      }
      await this.setClientIds(id, client_ids);
    }

    return project;
  }

  /**
   * Delete a project
   */
  static async delete(id: string, user_id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Count projects by status for a user
   */
  static async countByStatus(user_id: string): Promise<{
    planning: number;
    active: number;
    on_hold: number;
    completed: number;
    cancelled: number;
    total: number;
  }> {
    const result = await pool.query<{
      status: string;
      count: string;
    }>(
      `SELECT status, COUNT(*) as count
       FROM projects
       WHERE user_id = $1
       GROUP BY status`,
      [user_id]
    );

    const counts = {
      planning: 0,
      active: 0,
      on_hold: 0,
      completed: 0,
      cancelled: 0,
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

  /**
   * Get client IDs for a project
   */
  static async getClientIds(project_id: string): Promise<string[]> {
    const result = await pool.query<{ client_id: string }>(
      'SELECT client_id FROM project_clients WHERE project_id = $1',
      [project_id]
    );
    return result.rows.map((row) => row.client_id);
  }

  /**
   * Set client IDs for a project (replaces all existing associations)
   */
  static async setClientIds(project_id: string, client_ids: string[]): Promise<void> {
    await pool.query('DELETE FROM project_clients WHERE project_id = $1', [project_id]);

    if (client_ids.length > 0) {
      const values = client_ids.map((cid, index) => `($1, $${index + 2})`).join(', ');
      const query = `INSERT INTO project_clients (project_id, client_id) VALUES ${values}`;
      await pool.query(query, [project_id, ...client_ids]);
    }
  }

  /**
   * Find all projects filtered by user's client assignments (non-admin users)
   * Admin users see all projects, regular users only see projects for their assigned clients
   */
  static async findAllByUserAccess(options: ProjectQueryOptions & {
    user_role: 'admin' | 'user';
    user_client_ids: string[];
  }): Promise<{
    projects: Project[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { user_id, user_role, user_client_ids, status, search, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let query: string;
    let countQuery: string;
    const params: any[] = [];
    let paramIndex = 1;

    // For admin users: show all their projects
    if (user_role === 'admin') {
      query = `SELECT *, TO_CHAR(deadline, 'YYYY-MM-DD') as deadline FROM projects WHERE user_id = $1`;
      countQuery = 'SELECT COUNT(*) FROM projects WHERE user_id = $1';
      params.push(user_id);
      paramIndex = 2;
    } 
    // For non-admin users: filter by their assigned clients through project_clients
    else if (user_client_ids.length > 0) {
      query = `SELECT *, TO_CHAR(deadline, 'YYYY-MM-DD') as deadline FROM projects WHERE id IN (SELECT project_id FROM project_clients WHERE client_id = ANY($1))`;
      countQuery = 'SELECT COUNT(*) FROM projects WHERE id IN (SELECT project_id FROM project_clients WHERE client_id = ANY($1))';
      params.push(user_client_ids);
      paramIndex = 2;
    } else {
      // Non-admin user with no client assignments sees no projects
      return {
        projects: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Add status filter
    if (status) {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      countQuery += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute queries
    const [projectsResult, countResult] = await Promise.all([
      pool.query<Project>(query, params),
      pool.query<{ count: string }>(countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      projects: projectsResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
