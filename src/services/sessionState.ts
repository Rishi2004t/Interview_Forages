import * as vscode from 'vscode';
import { ActiveFileContent } from './codeReader';
import { GroqAnalysisResult } from './backendClient';

export interface InterviewSession {
  questions: string[];
  currentIndex: number;
  scores: number[];
  isComplete: boolean;
  // Final completion details
  finalScore?: number;
}

export class SessionManager {
  private static _instance: SessionManager;

  private _fileContent?: ActiveFileContent;
  private _analysis?: GroqAnalysisResult;
  private _interview?: InterviewSession;

  private constructor() {}

  public static getInstance(): SessionManager {
    if (!SessionManager._instance) {
      SessionManager._instance = new SessionManager();
    }
    return SessionManager._instance;
  }

  // --- File Content ---
  public get fileContent(): ActiveFileContent | undefined {
    return this._fileContent;
  }
  public set fileContent(value: ActiveFileContent | undefined) {
    this._fileContent = value;
  }

  // --- Analysis ---
  public get analysis(): GroqAnalysisResult | undefined {
    return this._analysis;
  }
  public set analysis(value: GroqAnalysisResult | undefined) {
    this._analysis = value;
  }

  // --- Interview ---
  public get interview(): InterviewSession | undefined {
    return this._interview;
  }
  public set interview(value: InterviewSession | undefined) {
    this._interview = value;
  }

  private _onDidResetSession = new vscode.EventEmitter<void>();
  public readonly onDidResetSession = this._onDidResetSession.event;

  // --- Reset ---
  public resetSession(): void {
    this._fileContent = undefined;
    this._analysis = undefined;
    this._interview = undefined;
    this._onDidResetSession.fire();
  }
}
