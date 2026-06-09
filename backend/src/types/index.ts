/**
 * Shared API types for InterviewForge backend.
 *
 * Import from here in controllers and services to keep
 * request/response shapes consistent across the codebase.
 */

// ── Generic API envelope ─────────────────────────────────────

/** Standard JSON response wrapper used by all endpoints. */
export interface ApiResponse<T = unknown> {
  success:   boolean;
  data?:     T;
  error?:    string;
  timestamp: string;
}

/** Constructs a successful ApiResponse. */
export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, timestamp: new Date().toISOString() };
}

/** Constructs an error ApiResponse. */
export function fail(error: string): ApiResponse<never> {
  return { success: false, error, timestamp: new Date().toISOString() };
}

// ── Health ────────────────────────────────────────────────────

export interface HealthData {
  status:    'ok';
  service:   string;
  version:   string;
  uptime:    number;
  timestamp: string;
}

// ── Environment ───────────────────────────────────────────────

export interface AppConfig {
  port:       number;
  groqApiKey: string;
  nodeEnv:    'development' | 'production' | 'test';
}

// ── Groq Analysis & Interview ─────────────────────────────────

export interface GroqAnalysisResult {
  summary:               string;
  timeComplexity:        string;
  spaceComplexity:       string;
  alternativeApproaches: string[];
  interviewQuestions:    string[];
}

export interface EvaluationResult {
  score:            number;
  feedback:         string;
  followUpQuestion: string;
}
