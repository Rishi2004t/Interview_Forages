import * as vscode from 'vscode';
import { getWebviewContent } from '../utils/webviewContent';
import { getActiveFileInfo, getActiveFileContent, ActiveFileContent } from '../services/codeReader';
import { analyzeCode, generateQuestions, evaluateAnswer, BackendError } from '../services/backendClient';
import { getHistory, saveSession, clearHistory } from '../services/historyService';

// ── Typed inbound message ────────────────────────────────────
interface WebviewMessage {
  command: string;
  payload?: { answer?: string };
}

// ── In-memory interview session ──────────────────────────────
interface InterviewSession {
  questions:    string[];
  currentIndex: number;
  code:         string;
  fileName:     string;   // saved to history on completion
  scores:       number[]; // collected after each evaluation
}

/**
 * Provides the InterviewForge sidebar webview in the Activity Bar.
 */
export class InterviewSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewId = 'interviewforge.sidebarView';

  private _view?: vscode.WebviewView;
  private _lastLoadedContent?: ActiveFileContent;
  private _interview?: InterviewSession;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  // ──────────────────────────────────────────────
  // WebviewViewProvider
  // ──────────────────────────────────────────────

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _ctx: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = { enableScripts: true, localResourceRoots: [] };
    webviewView.webview.html    = getWebviewContent(webviewView.webview, this._context);

    webviewView.webview.onDidReceiveMessage(
      (msg: WebviewMessage) => this._handleMessage(msg),
      undefined,
      this._context.subscriptions
    );

    vscode.window.onDidChangeActiveTextEditor(
      () => this._pushFileInfo(),
      undefined,
      this._context.subscriptions
    );
  }

  // ──────────────────────────────────────────────
  // Outbound helpers
  // ──────────────────────────────────────────────

  private _send(command: string, payload?: unknown): void {
    this._view?.webview.postMessage({ command, payload });
  }

  private _pushFileInfo(): void {
    if (!this._view) { return; }
    const info = getActiveFileInfo();
    info ? this._send('fileInfo', info) : this._send('noEditor');
  }

  private _pushHistory(): void {
    this._send('historyUpdated', getHistory(this._context));
  }

  // ──────────────────────────────────────────────
  // Message router
  // ──────────────────────────────────────────────

  private _handleMessage(msg: WebviewMessage): void {
    switch (msg.command) {
      case 'ready':
        this._pushFileInfo();
        this._pushHistory();          // send persisted history on boot
        break;

      case 'loadCode': {
        const content = getActiveFileContent();
        if (content) {
          this._lastLoadedContent = content;
          this._send('codeLoaded', content);
        } else {
          this._send('noEditor');
        }
        break;
      }

      case 'explainCode':
        this._runGroqAnalysis();
        break;

      case 'startInterview':
        this._startInterview();
        break;

      case 'submitAnswer':
        this._submitAnswer(msg.payload?.answer ?? '');
        break;

      case 'clearHistory':
        this._clearHistory();
        break;

      case 'openPanel':
        vscode.commands.executeCommand('interviewforge.openPanel');
        break;

      default:
        console.warn(`[InterviewForge Sidebar] Unknown command: ${msg.command}`);
    }
  }

  // ──────────────────────────────────────────────
  // Groq Code Analysis
  // ──────────────────────────────────────────────

  private async _runGroqAnalysis(): Promise<void> {
    if (!this._lastLoadedContent) {
      this._send('analysisError', { message: 'No code loaded. Click "Load Current Code" first.' });
      return;
    }
    try {
      const result = await analyzeCode(this._lastLoadedContent.code);
      this._send('analysisReady', result);
    } catch (err) {
      const e = err as BackendError;
      this._send('analysisError', { message: e?.message ?? 'An unexpected error occurred.' });
    }
  }

  // ──────────────────────────────────────────────
  // Mock Interview
  // ──────────────────────────────────────────────

  private async _startInterview(): Promise<void> {
    if (!this._lastLoadedContent) {
      this._send('interviewError', { message: 'No code loaded. Click "Load Current Code" first.' });
      return;
    }
    try {
      const questions = await generateQuestions(this._lastLoadedContent.code);
      this._interview = {
        questions,
        currentIndex: 0,
        code:         this._lastLoadedContent.code,
        fileName:     this._lastLoadedContent.fileName,
        scores:       [],
      };
      this._send('questionReady', { question: questions[0], index: 0, total: questions.length });
    } catch (err) {
      const e = err as BackendError;
      this._send('interviewError', { message: e?.message ?? 'Failed to generate questions.' });
    }
  }

  private async _submitAnswer(answer: string): Promise<void> {
    const session = this._interview;
    if (!session) {
      this._send('interviewError', { message: 'No active interview session.' });
      return;
    }

    const currentIdx = session.currentIndex;
    const question   = session.questions[currentIdx];
    const isComplete = currentIdx >= session.questions.length - 1;
    const nextIdx    = currentIdx + 1;

    try {
      const result = await evaluateAnswer(session.code, question, answer);

      // Track score
      session.scores.push(result.score);
      session.currentIndex = nextIdx;

      // Persist to history when all questions are answered
      if (isComplete) {
        const avg = session.scores.reduce((a, b) => a + b, 0) / session.scores.length;
        await saveSession(this._context, {
          date:           new Date().toISOString(),
          fileName:       session.fileName,
          averageScore:   Math.round(avg * 10) / 10,
          totalQuestions: session.scores.length,
        });
        this._pushHistory();   // push updated history to webview
      }

      this._send('evaluationReady', {
        score:             result.score,
        feedback:          result.feedback,
        followUpQuestion:  result.followUpQuestion,
        questionIndex:     currentIdx,
        total:             session.questions.length,
        isComplete,
        nextQuestion:      isComplete ? undefined : session.questions[nextIdx],
        nextQuestionIndex: nextIdx,
      });
    } catch (err) {
      const e = err as BackendError;
      this._send('interviewError', { message: e?.message ?? 'Failed to evaluate your answer.' });
    }
  }

  // ──────────────────────────────────────────────
  // History management
  // ──────────────────────────────────────────────

  private async _clearHistory(): Promise<void> {
    await clearHistory(this._context);
    this._pushHistory();
  }
}
