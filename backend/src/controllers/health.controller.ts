/**
 * Health controller.
 *
 * Handles HTTP concerns (request parsing, response status codes).
 * All business logic lives in the service layer.
 */

import { Request, Response } from 'express';
import { getHealthStatus } from '../services/health.service';
import { ok } from '../types';

/**
 * GET /health
 *
 * Returns the current service health and uptime.
 * Always responds with HTTP 200 if the process is alive.
 */
export function healthCheck(req: Request, res: Response): void {
  const data = getHealthStatus();
  res.status(200).json(ok(data));
}
