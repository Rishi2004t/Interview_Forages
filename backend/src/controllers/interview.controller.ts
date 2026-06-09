import { Request, Response } from 'express';
import { generateQuestions, evaluateAnswer } from '../services/groq.service';
import { ok, fail } from '../types';

/**
 * POST /interview/questions
 * Body: { code: string }
 */
export async function handleGenerateQuestions(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json(fail('Missing or invalid "code" field in request body.'));
      return;
    }

    const questions = await generateQuestions(code);
    res.json(ok({ questions }));
  } catch (error: any) {
    console.error('[Interview Controller] Error generating questions:', error);
    res.status(500).json(fail(error.message || 'Failed to generate questions.'));
  }
}

/**
 * POST /interview/evaluate
 * Body: { code: string, question: string, answer: string }
 */
export async function handleEvaluateAnswer(req: Request, res: Response): Promise<void> {
  try {
    const { code, question, answer } = req.body;
    
    if (!code || typeof code !== 'string') {
      res.status(400).json(fail('Missing or invalid "code" field.'));
      return;
    }
    if (!question || typeof question !== 'string') {
      res.status(400).json(fail('Missing or invalid "question" field.'));
      return;
    }
    // answer can be an empty string if the user submits blank
    if (typeof answer !== 'string') {
      res.status(400).json(fail('Missing or invalid "answer" field.'));
      return;
    }

    const result = await evaluateAnswer(code, question, answer);
    res.json(ok(result));
  } catch (error: any) {
    console.error('[Interview Controller] Error evaluating answer:', error);
    res.status(500).json(fail(error.message || 'Failed to evaluate answer.'));
  }
}
