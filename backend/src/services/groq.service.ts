/**
 * Groq AI Service
 *
 * Handles communication with the Groq API for code analysis and mock interviews.
 * Uses native Node.js fetch (available in Node 18+).
 */

import { GroqAnalysisResult, EvaluationResult } from '../types';

const GROQ_API_URL   = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL  = 'llama-3.3-70b-versatile';
const MAX_CODE_CHARS = 8000;

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** Helper to ensure we don't blow up token limits. */
function trimCode(code: string, max = MAX_CODE_CHARS): string {
  if (code.length <= max) return code;
  return code.slice(0, max) + '\n\n// ... [truncated — file exceeds limit]';
}

/** Core HTTP fetch wrapper for Groq. */
async function postGroq<T>(messages: ChatMessage[]): Promise<T> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in .env');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json() as any;
  const content = json?.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error('Groq returned an empty response.');
  }

  // Strip possible markdown fences
  const cleaned = content.replace(/^```(?:json)?\s*/im, '').replace(/\s*```\s*$/im, '').trim();
  return JSON.parse(cleaned) as T;
}

// ── Public API ──────────────────────────────────────────────────────────────

export async function analyzeCode(code: string): Promise<GroqAnalysisResult> {
  return postGroq<GroqAnalysisResult>([
    {
      role: 'system',
      content: `You are an expert code analyst and interview coach.
Always respond with a single valid JSON object.
{
  "summary": "<2-3 sentence technical summary>",
  "timeComplexity": "<Big O time complexity with brief justification>",
  "spaceComplexity": "<Big O space complexity with brief justification>",
  "alternativeApproaches": ["<approach 1>", "<approach 2>"],
  "interviewQuestions": ["<question 1>?", "<question 2>?"]
}
Rules:
- alternativeApproaches: 2-4 concrete alternatives.
- interviewQuestions: 4-6 precise questions.
- Respond with JSON ONLY.`,
    },
    {
      role: 'user',
      content: `Analyze the following code:\n\n\`\`\`\n${trimCode(code)}\n\`\`\``,
    },
  ]);
}

export async function generateQuestions(code: string): Promise<string[]> {
  const parsed = await postGroq<{ questions: string[] }>([
    {
      role: 'system',
      content: `You are a senior software engineer conducting a technical interview.
Analyze the provided code and generate exactly 5 technical interview questions.
Return ONLY valid JSON: { "questions": ["q1", "q2", "q3", "q4", "q5"] }`,
    },
    {
      role: 'user',
      content: `Generate 5 interview questions for this code:\n\n\`\`\`\n${trimCode(code, 4000)}\n\`\`\``,
    },
  ]);
  return parsed.questions.slice(0, 5);
}

export async function evaluateAnswer(code: string, question: string, answer: string): Promise<EvaluationResult> {
  const parsed = await postGroq<EvaluationResult>([
    {
      role: 'system',
      content: `You are a senior software engineer evaluating a technical interview answer.
Be rigorous but fair. Return ONLY valid JSON:
{
  "score": <integer 0-10>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "followUpQuestion": "<one targeted follow-up question>"
}
Scoring guide:
9-10 = Excellent, 7-8 = Good, 5-6 = Partial, 3-4 = Basic, 0-2 = Incorrect`,
    },
    {
      role: 'user',
      content: `Code context:\n\`\`\`\n${trimCode(code, 4000)}\n\`\`\`\n\nInterview question: ${question}\nCandidate's answer: ${answer || '(no answer provided)'}\n\nEvaluate this answer.`,
    },
  ]);
  
  return {
    score: Math.min(10, Math.max(0, Math.round(parsed.score ?? 0))),
    feedback: parsed.feedback || 'No feedback provided.',
    followUpQuestion: parsed.followUpQuestion || 'Can you elaborate?',
  };
}
