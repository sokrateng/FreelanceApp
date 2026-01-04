import { Router } from 'express';
import { ClientController } from '../controllers/clientController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import {
  createClientSchema,
  updateClientSchema,
  clientQuerySchema,
} from '../validators/clientValidator';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/clients/stats - Get client statistics (must be before /:id route)
router.get('/stats', ClientController.getClientStats);

// GET /api/clients - Get all clients with pagination and filtering
router.get(
  '/',
  validateRequest(clientQuerySchema, 'query'),
  ClientController.getAllClients
);

// GET /api/clients/:id - Get a single client
router.get('/:id', ClientController.getClientById);

// POST /api/clients - Create a new client
router.post(
  '/',
  validateRequest(createClientSchema),
  ClientController.createClient
);

// PUT /api/clients/:id - Update a client
router.put(
  '/:id',
  validateRequest(updateClientSchema),
  ClientController.updateClient
);

// DELETE /api/clients/:id - Delete a client
router.delete('/:id', ClientController.deleteClient);

export default router;
