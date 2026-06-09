import { Request, Response } from 'express';
import { analyzeCode } from '../services/groq.service';
import { ok, fail } from '../types';

/**
 * POST /analysis
 * Body: { code: string }
 */
export async function handleAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json(fail('Missing or invalid "code" field in request body.'));
      return;
    }

    const result = await analyzeCode(code);
    res.json(ok(result));
  } catch (error: any) {
    console.error('[Analysis Controller] Error:', error);
    res.status(500).json(fail(error.message || 'Failed to analyze code.'));
  }
}
