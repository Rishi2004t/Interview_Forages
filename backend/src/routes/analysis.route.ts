import { Router } from 'express';
import { handleAnalysis } from '../controllers/analysis.controller';

export const analysisRouter = Router();

analysisRouter.post('/', handleAnalysis);
