import * as http from 'http';

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

export interface GroqAnalysisResult {
  summary: string;
  timeComplexity: string;
  spaceComplexity: string;
  alternativeApproaches: string[];
  interviewQuestions: string[];
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  followUpQuestion: string;
}

export interface BackendError {
  message: string;
}

// ────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:3000';

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────

export async function analyzeCode(code: string): Promise<GroqAnalysisResult> {
  const result = await post<{ data: GroqAnalysisResult }>('/analysis', { code });
  return result.data;
}

export async function generateQuestions(code: string): Promise<string[]> {
  const result = await post<{ data: { questions: string[] } }>('/interview/questions', { code });
  return result.data.questions;
}

export async function evaluateAnswer(code: string, question: string, answer: string): Promise<EvaluationResult> {
  const result = await post<{ data: EvaluationResult }>('/interview/evaluate', { code, question, answer });
  return result.data;
}

// ────────────────────────────────────────────────────────────
// HTTP Transport
// ────────────────────────────────────────────────────────────

function post<T>(path: string, body: unknown): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const serialized = JSON.stringify(body);
    const url = new URL(path, BASE_URL);

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(serialized),
      },
    };

    const req = http.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        try {
          const json = JSON.parse(raw);
          if (res.statusCode && res.statusCode >= 400) {
            reject({ message: json.error || 'Unknown backend error.' } satisfies BackendError);
          } else if (!json.success) {
            reject({ message: json.error || 'Backend returned unsuccessful response.' } satisfies BackendError);
          } else {
            resolve(json as T);
          }
        } catch {
          reject({ message: 'Failed to parse backend response.' } satisfies BackendError);
        }
      });
    });

    req.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ECONNREFUSED') {
        reject({ message: 'InterviewForge backend is not running.' } satisfies BackendError);
      } else {
        reject({ message: `Network error: ${err.message}` } satisfies BackendError);
      }
    });

    req.write(serialized);
    req.end();
  });
}
