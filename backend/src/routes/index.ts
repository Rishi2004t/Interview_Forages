/**
 * Root router — aggregates all feature routers.
 *
 * Add new route modules here as the API grows.
 * Each module should be mounted on its own prefix (e.g. /analysis, /interview).
 */

import { Router } from 'express';
import { healthRouter } from './health.route';
import { analysisRouter } from './analysis.route';
import { interviewRouter } from './interview.route';

export const rootRouter = Router();

// ── Registered routes ─────────────────────────────────────────
rootRouter.use('/health', healthRouter);
rootRouter.use('/analysis', analysisRouter);
rootRouter.use('/interview', interviewRouter);
