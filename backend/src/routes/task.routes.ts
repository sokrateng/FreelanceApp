import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @access  Private
 */
router.get('/', authenticate, TaskController.getAllTasks);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.get('/stats', authenticate, TaskController.getTaskStats);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', authenticate, TaskController.getTaskById);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post('/', authenticate, TaskController.createTask);

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.put('/:id', authenticate, TaskController.updateTask);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete('/:id', authenticate, TaskController.deleteTask);

export default router;
