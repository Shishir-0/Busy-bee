import { createApp } from './app.js';
import { env } from './config/env.js';
import { initDatabase, closeDatabase } from './config/database.js';

async function bootstrap() {
  console.log('====================================================');
  console.log('  THE NEGOTIATOR: Proof-First Procurement AI Server');
  console.log('  Hackathon: CHAOS | Team: Busy-bee');
  console.log('====================================================');

  // Initialize persistence (MongoDB Atlas or In-Memory fallback)
  await initDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[Server] Authoritative Backend running on http://localhost:${env.PORT}`);
    console.log(`[Server] Environment: ${env.NODE_ENV}`);
    console.log(`[Server] Health Check: http://localhost:${env.PORT}/api/health`);
    console.log(`[Server] Agent Security: AGENT_BACKEND_TOKEN active`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(async () => {
      await closeDatabase();
      console.log('[Server] Process exited cleanly.');
      process.exit(0);
    });

    // Force exit after 5s timeout if lingering handles exist
    setTimeout(() => {
      console.error('[Server] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
