import pool from '../config/database';

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  address: string | null;
  status: 'active' | 'inactive' | 'archived';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClientData {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'archived';
  notes?: string;
}

export interface UpdateClientData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  status?: 'active' | 'inactive' | 'archived';
  notes?: string;
}

export interface ClientQueryOptions {
  user_id: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ClientModel {
  /**
   * Find client by ID
   */
  static async findById(id: string, user_id: string): Promise<Client | null> {
    const result = await pool.query<Client>(
      'SELECT * FROM clients WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    return result.rows[0] || null;
  }

  /**
   * Find all clients for a user with pagination and filtering
   */
  static async findAll(options: ClientQueryOptions): Promise<{
    clients: Client[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { user_id, status, search, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM clients WHERE user_id = $1';
    let countQuery = 'SELECT COUNT(*) FROM clients WHERE user_id = $1';
    const params: any[] = [user_id];
    let paramIndex = 2;

    // Add status filter
    if (status) {
      query += ` AND status = $${paramIndex}`;
      countQuery += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Add search filter
    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`;
      countQuery += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute queries
    const [clientsResult, countResult] = await Promise.all([
      pool.query<Client>(query, params),
      pool.query<{ count: string }>(countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      clients: clientsResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Create a new client
   */
  static async create(data: CreateClientData): Promise<Client> {
    const {
      user_id,
      name,
      email = null,
      phone = null,
      company = null,
      address = null,
      status = 'active',
      notes = null,
    } = data;

    const result = await pool.query<Client>(
      `INSERT INTO clients (user_id, name, email, phone, company, address, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, name, email, phone, company, address, status, notes]
    );

    return result.rows[0];
  }

  /**
   * Update a client
   */
  static async update(
    id: string,
    user_id: string,
    data: UpdateClientData
  ): Promise<Client | null> {
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
      UPDATE clients
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query<Client>(query, values);
    return result.rows[0] || null;
  }

  /**
   * Delete a client
   */
  static async delete(id: string, user_id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM clients WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Count clients by status for a user
   */
  static async countByStatus(user_id: string): Promise<{
    active: number;
    inactive: number;
    archived: number;
    total: number;
  }> {
    const result = await pool.query<{
      status: string;
      count: string;
    }>(
      `SELECT status, COUNT(*) as count
       FROM clients
       WHERE user_id = $1
       GROUP BY status`,
      [user_id]
    );

    const counts = {
      active: 0,
      inactive: 0,
      archived: 0,
      total: 0,
    };

    result.rows.forEach((row) => {
      const count = parseInt(row.count, 10);
      counts[row.status as keyof typeof counts] = count;
      counts.total += count;
    });

    return counts;
  }

  /**
   * Get user IDs for a client
   */
  static async getUserIds(client_id: string): Promise<string[]> {
    const result = await pool.query<{ user_id: string }>(
      'SELECT user_id FROM user_clients WHERE client_id = $1',
      [client_id]
    );
    return result.rows.map((row) => row.user_id);
  }

  /**
   * Set user IDs for a client (replaces all existing associations)
   */
  static async setUserIds(client_id: string, user_ids: string[]): Promise<void> {
    await pool.query('DELETE FROM user_clients WHERE client_id = $1', [client_id]);

    if (user_ids.length > 0) {
      const values = user_ids.map((uid, index) => `($${index + 1}, $${user_ids.length + 1})`).join(', ');
      const query = `INSERT INTO user_clients (user_id, client_id) VALUES ${values}`;
      await pool.query(query, [...user_ids, client_id]);
    }
  }

  /**
   * Get client IDs for a user
   */
  static async getClientIdsByUser(user_id: string): Promise<string[]> {
    const result = await pool.query<{ client_id: string }>(
      'SELECT client_id FROM user_clients WHERE user_id = $1',
      [user_id]
    );
    return result.rows.map((row) => row.client_id);
  }

  /**
   * Find all clients (admin sees all, users see only their assigned clients)
   */
  static async findAllByUserAccess(options: ClientQueryOptions & {
    user_role: 'admin' | 'user';
  }): Promise<{
    clients: Client[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { user_id, user_role, status, search, page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM clients WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) FROM clients WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    // For non-admin users, filter by their assigned clients
    if (user_role !== 'admin') {
      query += ` AND (user_id = $${paramIndex} OR id IN (SELECT client_id FROM user_clients WHERE user_id = $${paramIndex}))`;
      countQuery += ` AND (user_id = $${paramIndex} OR id IN (SELECT client_id FROM user_clients WHERE user_id = $${paramIndex}))`;
      params.push(user_id);
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
      query += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`;
      countQuery += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR company ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    // Execute queries
    const [clientsResult, countResult] = await Promise.all([
      pool.query<Client>(query, params),
      pool.query<{ count: string }>(countQuery, params.slice(0, -2)),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit);

    return {
      clients: clientsResult.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
