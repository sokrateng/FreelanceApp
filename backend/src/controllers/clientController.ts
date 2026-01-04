import { Response } from 'express';
import { ClientService } from '../services/clientService';
import { AuthRequest } from '../types';

export class ClientController {
  /**
   * Get all clients
   * GET /api/clients
   */
  static async getAllClients(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const { status, search, page, limit } = req.query;

      const result = await ClientService.getAllClients({
        user_id: user.id,
        user_role: user.role as 'admin' | 'user',
        status: status as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch clients',
      });
    }
  }

  /**
   * Get a single client by ID
   * GET /api/clients/:id
   */
  static async getClientById(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const user_role = req.user!.role as 'admin' | 'user';
      const { id } = req.params;

      const client = await ClientService.getClientById(id, user_id, user_role);

      res.status(200).json({
        success: true,
        data: client,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch client',
      });
    }
  }

  /**
   * Create a new client
   * POST /api/clients
   */
  static async createClient(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;

      // Only admin users can create clients
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Only admin users can create clients',
        });
      }

      const clientData = { ...req.body, user_id: user.id };

      const client = await ClientService.createClient(clientData);

      res.status(201).json({
        success: true,
        data: client,
        message: 'Client created successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to create client',
      });
    }
  }

  /**
   * Update a client
   * PUT /api/clients/:id
   */
  static async updateClient(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { id } = req.params;
      const updateData = req.body;

      const client = await ClientService.updateClient(id, user_id, updateData);

      res.status(200).json({
        success: true,
        data: client,
        message: 'Client updated successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to update client',
      });
    }
  }

  /**
   * Delete a client
   * DELETE /api/clients/:id
   */
  static async deleteClient(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;
      const { id } = req.params;

      const result = await ClientService.deleteClient(id, user_id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to delete client',
      });
    }
  }

  /**
   * Get client statistics
   * GET /api/clients/stats
   */
  static async getClientStats(req: AuthRequest, res: Response) {
    try {
      const user_id = req.user!.id;

      const stats = await ClientService.getClientStats(user_id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to fetch client statistics',
      });
    }
  }
}
