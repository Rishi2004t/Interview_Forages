import * as vscode from 'vscode';
import { getWebviewContent } from '../utils/webviewContent';
import { getActiveFileInfo, getActiveFileContent } from '../services/codeReader';
import { analyzeCode, generateQuestions, evaluateAnswer, BackendError } from '../services/backendClient';
import { getHistory, saveSession, clearHistory } from '../services/historyService';
import { SessionManager } from '../services/sessionState';

// ── Typed inbound message ────────────────────────────────────
interface WebviewMessage {
  command: string;
  payload?: { answer?: string };
}

/**
 * Manages the main InterviewForge editor WebviewPanel (singleton).
 */
export class InterviewPanel {
  public static readonly viewType = 'interviewforge.panel';
  private static instance: InterviewPanel | undefined;

  private readonly _panel:   vscode.WebviewPanel;
  private readonly _context: vscode.ExtensionContext;
  private _disposables: vscode.Disposable[] = [];

  // ──────────────────────────────────────────────
  // Static factory
  // ──────────────────────────────────────────────

  public static createOrShow(context: vscode.ExtensionContext): void {
    const column = vscode.window.activeTextEditor?.viewColumn;

    if (InterviewPanel.instance) {
      InterviewPanel.instance._panel.reveal(column);
      return;
    }

    const panel = vscode.window.createWebviewPanel(
      InterviewPanel.viewType,
      'InterviewForge',
      column ?? vscode.ViewColumn.One,
      { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: [] }
    );

    InterviewPanel.instance = new InterviewPanel(panel, context);
  }

  public static getInstance(): InterviewPanel | undefined {
    return InterviewPanel.instance;
  }

  // ──────────────────────────────────────────────
  // Constructor & lifecycle
  // ──────────────────────────────────────────────

  private constructor(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    this._panel   = panel;
    this._context = context;
    this._update();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.onDidChangeViewState(
      () => { if (this._panel.visible) { this._update(); } },
      null,
      this._disposables
    );
    this._panel.webview.onDidReceiveMessage(
      (msg: WebviewMessage) => this._handleMessage(msg),
      null,
      this._disposables
    );
    vscode.window.onDidChangeActiveTextEditor(
      () => this._handleEditorChange(),
      null,
      this._disposables
    );
    SessionManager.getInstance().onDidResetSession(
      () => this._send('sessionReset'),
      null,
      this._disposables
    );
  }

  // ──────────────────────────────────────────────
  // Helpers
  // ──────────────────────────────────────────────

  private _update(): void {
    this._panel.title        = 'InterviewForge';
    this._panel.webview.html = getWebviewContent(this._panel.webview, this._context);
  }

  private _send(command: string, payload?: unknown): void {
    this._panel.webview.postMessage({ command, payload });
  }

  private _pushFileInfo(): void {
    const info = getActiveFileInfo();
    info ? this._send('fileInfo', info) : this._send('noEditor');
  }

  private _handleEditorChange(): void {
    const session = SessionManager.getInstance();
    const info = getActiveFileInfo();
    
    if (session.fileContent && info) {
      if (session.fileContent.fileName !== info.fileName) {
        this._send('fileChanged', {
          oldFile: session.fileContent.fileName,
          newFile: info.fileName
        });
      }
    }
    
    this._pushFileInfo();
  }

  private _pushHistory(): void {
    this._send('historyUpdated', getHistory(this._context));
  }

  // ──────────────────────────────────────────────
  // Message router
  // ──────────────────────────────────────────────

  private _handleMessage(msg: WebviewMessage): void {
    const sessionManager = SessionManager.getInstance();

    switch (msg.command) {
      case 'ready':
        this._pushFileInfo();
        this._pushHistory();
        break;

      case 'loadCode': {
        const content = getActiveFileContent();
        if (content) {
          sessionManager.fileContent = content;
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

      case 'resetSession':
        vscode.commands.executeCommand('interviewforge.resetSession');
        break;

      case 'resetAndAnalyzeNewFile':
        sessionManager.resetSession();
        this._send('sessionReset');
        const content = getActiveFileContent();
        if (content) {
          sessionManager.fileContent = content;
          this._send('codeLoaded', content);
        } else {
          this._send('noEditor');
        }
        break;

      default:
        console.warn(`[InterviewForge Panel] Unknown command: ${msg.command}`);
    }
  }

  // ──────────────────────────────────────────────
  // Groq Code Analysis
  // ──────────────────────────────────────────────

  private async _runGroqAnalysis(): Promise<void> {
    const sessionManager = SessionManager.getInstance();
    if (!sessionManager.fileContent) {
      this._send('analysisError', { message: 'No code loaded. Click "Load Current Code" first.' });
      return;
    }
    try {
      const result = await analyzeCode(sessionManager.fileContent.code);
      sessionManager.analysis = result;
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
    const sessionManager = SessionManager.getInstance();
    if (!sessionManager.fileContent) {
      this._send('interviewError', { message: 'No code loaded. Click "Load Current Code" first.' });
      return;
    }
    try {
      const questions = await generateQuestions(sessionManager.fileContent.code);
      sessionManager.interview = {
        questions,
        currentIndex: 0,
        scores:       [],
        isComplete:   false,
      };
      this._send('questionReady', { question: questions[0], index: 0, total: questions.length });
    } catch (err) {
      const e = err as BackendError;
      this._send('interviewError', { message: e?.message ?? 'Failed to generate questions.' });
    }
  }

  private async _submitAnswer(answer: string): Promise<void> {
    const sessionManager = SessionManager.getInstance();
    const session = sessionManager.interview;
    if (!session || !sessionManager.fileContent) {
      this._send('interviewError', { message: 'No active interview session.' });
      return;
    }

    const currentIdx = session.currentIndex;
    const question   = session.questions[currentIdx];
    const isComplete = currentIdx >= session.questions.length - 1;
    const nextIdx    = currentIdx + 1;

    try {
      const result = await evaluateAnswer(sessionManager.fileContent.code, question, answer);

      session.scores.push(result.score);
      session.currentIndex = nextIdx;
      session.isComplete = isComplete;

      if (isComplete) {
        const avg = session.scores.reduce((a, b) => a + b, 0) / session.scores.length;
        session.finalScore = avg;
        await saveSession(this._context, {
          date:           new Date().toISOString(),
          fileName:       sessionManager.fileContent.fileName,
          averageScore:   Math.round(avg * 10) / 10,
          totalQuestions: session.scores.length,
        });
        this._pushHistory();
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
  // History
  // ──────────────────────────────────────────────

  private async _clearHistory(): Promise<void> {
    await clearHistory(this._context);
    this._pushHistory();
  }

  // ──────────────────────────────────────────────
  // Dispose
  // ──────────────────────────────────────────────

  public dispose(): void {
    InterviewPanel.instance = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      this._disposables.pop()?.dispose();
    }
  }
}
