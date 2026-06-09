import * as vscode from 'vscode';
import { InterviewPanel } from '../panels/InterviewPanel';

/**
 * Registers the `interviewforge.openPanel` command.
 * Opens (or reveals) the main InterviewForge WebviewPanel.
 */
export function registerOpenPanelCommand(context: vscode.ExtensionContext): void {
  const disposable = vscode.commands.registerCommand(
    'interviewforge.openPanel',
    () => {
      InterviewPanel.createOrShow(context);
    }
  );

  context.subscriptions.push(disposable);
}
