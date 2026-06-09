/**
 * InterviewForge API — entry point.
 *
 * Boot order:
 *   1. Load .env
 *   2. Validate required environment variables
 *   3. Configure Express middleware
 *   4. Mount routes
 *   5. Start HTTP server
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { rootRouter } from './routes';
import { fail } from './types';

// ── 1. Load environment variables ──────────────────────────────
dotenv.config();

// ── 2. Validate required env vars ─────────────────────────────
const PORT         = parseInt(process.env.PORT ?? '3000', 10);
const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const NODE_ENV     = (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test';

if (!GROQ_API_KEY) {
  console.error('[InterviewForge API] ❌ CRITICAL ERROR: GROQ_API_KEY environment variable is not set.');
  console.error('[InterviewForge API] Exiting. The backend cannot start without a valid API key.');
  process.exit(1);
}

// ── 3. Create Express app ─────────────────────────────────────
const app: Application = express();

// Middleware
// Enable CORS for all origins — required because VS Code webviews
// make requests from isolated origins (vscode-webview://)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger (development only)
if (NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── 4. Mount routes ───────────────────────────────────────────
app.use('/', rootRouter);

// 404 — catch-all for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json(fail('Route not found.'));
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[InterviewForge API] Unhandled error:', err.message);
  res.status(500).json(fail('Internal server error.'));
});

// ── 5. Start server ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎯 InterviewForge API`);
  console.log(`   Environment : ${NODE_ENV}`);
  console.log(`   Port        : ${PORT}`);
  console.log(`   Health      : http://localhost:${PORT}/health`);
  console.log(`   Groq key    : ${GROQ_API_KEY ? '✅ configured' : '⚠️  missing'}\n`);
});

export default app;
