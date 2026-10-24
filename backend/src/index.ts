import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initDb, isUsingMySql } from './db';
import authRoutes from './routes/authRoutes';
import tripRoutes from './routes/tripRoutes';
import plannerRoutes from './routes/plannerRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import adminRoutes from './routes/adminRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Security & Middlewares
app.use(cors({
  origin: true, // Allow frontend dev origins
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health & Status check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database_driver: isUsingMySql() ? 'MySQL Server 8.0' : 'In-Memory Synchronized Seed Engine',
    version: '1.0.0'
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 handler for unmatched API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found.` });
});

// Serve frontend static files and client-side routing fallback in production
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(__dirname, '../../dist')
];

let frontendDistPath = '';
for (const cand of possibleDistPaths) {
  if (fs.existsSync(cand) && fs.existsSync(path.join(cand, 'index.html'))) {
    frontendDistPath = cand;
    break;
  }
}

console.log(`[Frontend Static] Resolved directory: ${frontendDistPath || 'NOT FOUND'}`);

if (frontendDistPath) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    const indexHtml = path.join(frontendDistPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
    next();
  });
} else {
  app.get('/', (req: Request, res: Response) => {
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Tourist Trip Planner API</title></head>
        <body style="font-family: sans-serif; padding: 2rem; text-align: center; line-height: 1.6;">
          <h2>🚀 Tourist App Backend API is Running!</h2>
          <p>Health check endpoint: <a href="/api/health">/api/health</a></p>
          <p style="color: #666;">Note: Frontend build was not detected at startup. Run <code>npm run build</code> to bundle the frontend.</p>
        </body>
      </html>
    `);
  });
}

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error occurred.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start Express server and initialize DB connection
async function startServer() {
  await initDb();
  const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : Number(PORT);
  app.listen(portNumber, '0.0.0.0', () => {
    console.log(`=================================================`);
    console.log(`🚀 Tourist Trip Planner API running on port ${portNumber} (0.0.0.0)`);
    console.log(`📡 Health Check: http://0.0.0.0:${portNumber}/api/health`);
    console.log(`💾 DB Engine: ${isUsingMySql() ? 'MySQL Server' : 'In-Memory Seed Mode'}`);
    console.log(`=================================================`);
  });
}

startServer();

export default app;
