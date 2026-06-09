/**
 * Health service.
 *
 * Encapsulates the logic for building the health-check payload.
 * Keeping business logic out of controllers makes both easier to test.
 */

import { HealthData } from '../types';

const SERVICE_NAME = 'InterviewForge API';
const VERSION      = '0.0.1';

/**
 * Returns a snapshot of the service's current health state.
 */
export function getHealthStatus(): HealthData {
  return {
    status:    'ok',
    service:   SERVICE_NAME,
    version:   VERSION,
    uptime:    Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
