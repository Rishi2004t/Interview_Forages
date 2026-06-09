import { Router } from 'express';
import { handleGenerateQuestions, handleEvaluateAnswer } from '../controllers/interview.controller';

export const interviewRouter = Router();

interviewRouter.post('/questions', handleGenerateQuestions);
interviewRouter.post('/evaluate', handleEvaluateAnswer);
