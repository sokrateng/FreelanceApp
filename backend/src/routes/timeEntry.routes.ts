import { Router } from 'express';
import { TimeEntryController } from '../controllers/timeEntryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all time entries with pagination and filters
router.get('/', TimeEntryController.getAllTimeEntries);

// Get time entry statistics
router.get('/stats', TimeEntryController.getTimeEntryStats);

// Get time entry by ID
router.get('/:id', TimeEntryController.getTimeEntryById);

// Create new time entry
router.post('/', TimeEntryController.createTimeEntry);

// Update time entry
router.put('/:id', TimeEntryController.updateTimeEntry);

// Delete time entry
router.delete('/:id', TimeEntryController.deleteTimeEntry);

export default router;
