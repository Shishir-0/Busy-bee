import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiRouter } from './routes/apiRoutes.js';
import { internalRouter } from './routes/internalRoutes.js';

export function createApp(): express.Application {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows flexible integration for hackathon dev
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // 2. CORS Handling
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in hackathon development mode for teammates
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-agent-token'],
    })
  );

  // 3. Body Parsing with reasonable size limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Request ID Correlation
  app.use(requestIdMiddleware);

  // 5. Mount API Routes
  app.use('/api/internal', internalRouter);
  app.use('/api', apiRouter);

  // 6. 404 Handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Route ${req.method} ${req.originalUrl} not found.`,
        requestId: req.id || 'unknown',
      },
    });
  });

  // 7. Centralized Error Handler
  app.use(errorHandler);

  return app;
}
