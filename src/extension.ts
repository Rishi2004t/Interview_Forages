import * as vscode from 'vscode';
import { registerOpenPanelCommand } from './commands/openPanel';
import { InterviewSidebarProvider } from './panels/InterviewSidebarProvider';
import { SessionManager } from './services/sessionState';

/**
 * Called when the extension is activated.
 * Registers all commands, providers, and disposables.
 */
export function activate(context: vscode.ExtensionContext): void {
  // ── Activation diagnostics ────────────────────────────────
  console.log('[InterviewForge] ✅ activate() called.');
  console.log('[InterviewForge] Extension path:', context.extensionPath);
  console.log('[InterviewForge] Storage URI:',    context.globalStorageUri?.fsPath);

  // ── Register Activity Bar sidebar webview provider ────────
  const sidebarProvider = new InterviewSidebarProvider(context);
  const sidebarDisposable = vscode.window.registerWebviewViewProvider(
    InterviewSidebarProvider.viewId,   // 'interviewforge.sidebarView'
    sidebarProvider,
    { webviewOptions: { retainContextWhenHidden: true } }
  );
  context.subscriptions.push(sidebarDisposable);
  console.log('[InterviewForge] Sidebar provider registered for view:', InterviewSidebarProvider.viewId);

  // ── Register commands ─────────────────────────────────────
  registerOpenPanelCommand(context);
  console.log('[InterviewForge] Command registered: interviewforge.openPanel');

  const resetSessionDisposable = vscode.commands.registerCommand('interviewforge.resetSession', () => {
    SessionManager.getInstance().resetSession();
  });
  context.subscriptions.push(resetSessionDisposable);
  console.log('[InterviewForge] Command registered: interviewforge.resetSession');

  // ── Startup notification (dev-mode only) ─────────────────
  // Remove or comment out before shipping to production.
  vscode.window.showInformationMessage('InterviewForge activated! 🎯');
}

/**
 * Called when the extension is deactivated.
 */
export function deactivate(): void {
  console.log('[InterviewForge] Extension deactivated.');
}
