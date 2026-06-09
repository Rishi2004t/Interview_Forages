import * as vscode from 'vscode';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

/** Metadata about the currently active editor file. */
export interface ActiveFileInfo {
  fileName: string;
  language: string;
  lineCount: number;
}

/** Full content + metadata of the currently active editor file. */
export interface ActiveFileContent extends ActiveFileInfo {
  code: string;
}

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

/**
 * Returns lightweight metadata (no content) for the active editor.
 * Returns `null` if no editor is open.
 */
export function getActiveFileInfo(): ActiveFileInfo | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const doc = editor.document;
  return {
    fileName: extractFileName(doc.fileName),
    language: doc.languageId,
    lineCount: doc.lineCount,
  };
}

/**
 * Returns full text content + metadata for the active editor.
 * Returns `null` if no editor is open.
 */
export function getActiveFileContent(): ActiveFileContent | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  const doc = editor.document;
  return {
    fileName: extractFileName(doc.fileName),
    language: doc.languageId,
    lineCount: doc.lineCount,
    code: doc.getText(),
  };
}

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

/** Extracts just the filename from an absolute path (cross-platform). */
function extractFileName(filePath: string): string {
  return filePath.split(/[\\/]/).pop() ?? 'Unknown';
}
