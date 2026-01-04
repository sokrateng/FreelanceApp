import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/projects
 * @desc    Get all projects for authenticated user
 * @access  Private
 */
router.get('/', authenticate, ProjectController.getAllProjects);

/**
 * @route   GET /api/projects/stats
 * @desc    Get project statistics
 * @access  Private
 */
router.get('/stats', authenticate, ProjectController.getProjectStats);

/**
 * @route   GET /api/projects/:id
 * @desc    Get a single project by ID
 * @access  Private
 */
router.get('/:id', authenticate, ProjectController.getProjectById);

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 * @access  Private
 */
router.post('/', authenticate, ProjectController.createProject);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update a project
 * @access  Private
 */
router.put('/:id', authenticate, ProjectController.updateProject);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project
 * @access  Private
 */
router.delete('/:id', authenticate, ProjectController.deleteProject);

export default router;
