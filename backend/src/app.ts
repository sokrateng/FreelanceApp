import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import config from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Routes
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import timeEntryRoutes from './routes/timeEntry.routes';

const app: Application = express();

// Security middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({
  strict: false, // Allow arrays and primitives
  limit: '10mb',
})); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

// Debug middleware - log incoming requests
app.use((req: Request, res: Response, next) => {
  if (req.path.startsWith('/api/auth')) {
    console.log(`\n📥 ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Compression middleware
app.use(compression());

// Rate limiting
app.use('/api/', apiLimiter);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-entries', timeEntryRoutes);

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
