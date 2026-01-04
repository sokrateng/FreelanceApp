import {
  ClientModel,
  CreateClientData,
  UpdateClientData,
  ClientQueryOptions,
} from '../models/Client';
import { AppError } from '../middleware/errorHandler';

export class ClientService {
  /**
   * Get all clients for a user with pagination and filtering
   */
  static async getAllClients(options: ClientQueryOptions & {
    user_role?: 'admin' | 'user';
  }) {
    // If user_role is provided, use access-based filtering
    if (options.user_role) {
      return await ClientModel.findAllByUserAccess({
        user_id: options.user_id,
        user_role: options.user_role,
        status: options.status,
        search: options.search,
        page: options.page,
        limit: options.limit,
      });
    }
    return await ClientModel.findAll(options);
  }

  /**
   * Get a single client by ID
   */
  static async getClientById(id: string, user_id: string) {
    const client = await ClientModel.findById(id, user_id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    return client;
  }

  /**
   * Create a new client
   */
  static async createClient(data: CreateClientData) {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new AppError('Client name is required', 400);
    }

    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new AppError('Invalid email format', 400);
      }
    }

    return await ClientModel.create(data);
  }

  /**
   * Update a client
   */
  static async updateClient(
    id: string,
    user_id: string,
    data: UpdateClientData
  ) {
    // Check if client exists
    const existingClient = await ClientModel.findById(id, user_id);
    if (!existingClient) {
      throw new AppError('Client not found', 404);
    }

    // Validate name if provided
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw new AppError('Client name cannot be empty', 400);
    }

    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new AppError('Invalid email format', 400);
      }
    }

    const updatedClient = await ClientModel.update(id, user_id, data);
    if (!updatedClient) {
      throw new AppError('Failed to update client', 500);
    }

    return updatedClient;
  }

  /**
   * Delete a client
   */
  static async deleteClient(id: string, user_id: string) {
    // Check if client exists
    const existingClient = await ClientModel.findById(id, user_id);
    if (!existingClient) {
      throw new AppError('Client not found', 404);
    }

    const deleted = await ClientModel.delete(id, user_id);
    if (!deleted) {
      throw new AppError('Failed to delete client', 500);
    }

    return { message: 'Client deleted successfully' };
  }

  /**
   * Get client statistics
   */
  static async getClientStats(user_id: string) {
    return await ClientModel.countByStatus(user_id);
  }
}
