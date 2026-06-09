/**
 * Health route.
 *
 * Mounts:
 *   GET /health  →  healthCheck controller
 */

import { Router } from 'express';
import { healthCheck } from '../controllers/health.controller';

export const healthRouter = Router();

healthRouter.get('/', healthCheck);
