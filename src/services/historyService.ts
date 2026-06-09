/**
 * Interview History service for InterviewForge.
 *
 * Persists session summaries to VS Code's globalState so they survive
 * extension restarts. Only the last {@link MAX_SESSIONS} entries are kept.
 */

import * as vscode from 'vscode';

// ────────────────────────────────────────────────────────────
// Public types
// ────────────────────────────────────────────────────────────

/** A single completed interview session stored in history. */
export interface HistoryEntry {
  /** Unique ID — millisecond timestamp of when the session was saved. */
  id:             string;
  /** ISO 8601 date string of the session. */
  date:           string;
  /** Bare file name that was loaded (e.g. "app.ts"). */
  fileName:       string;
  /** Average score across all questions answered (one decimal place). */
  averageScore:   number;
  /** Number of questions that were answered (may be < 5 if abandoned). */
  totalQuestions: number;
}

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const STORAGE_KEY   = 'interviewforge.history';
const MAX_SESSIONS  = 10;

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

/**
 * Returns all stored history entries (newest first).
 * Returns an empty array if nothing has been stored yet.
 */
export function getHistory(context: vscode.ExtensionContext): HistoryEntry[] {
  return context.globalState.get<HistoryEntry[]>(STORAGE_KEY, []);
}

/**
 * Prepends a new entry to history, trimming the list to {@link MAX_SESSIONS}.
 *
 * @param context - Extension context that owns the globalState store.
 * @param entry   - Session data (id is generated automatically).
 */
export async function saveSession(
  context: vscode.ExtensionContext,
  entry: Omit<HistoryEntry, 'id'>
): Promise<void> {
  const existing = getHistory(context);

  const newEntry: HistoryEntry = {
    id: Date.now().toString(),
    ...entry,
  };

  const updated = [newEntry, ...existing].slice(0, MAX_SESSIONS);
  await context.globalState.update(STORAGE_KEY, updated);
}

/**
 * Removes all history entries permanently.
 */
export async function clearHistory(context: vscode.ExtensionContext): Promise<void> {
  await context.globalState.update(STORAGE_KEY, []);
}
