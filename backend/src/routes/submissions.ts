import { Router } from 'express';
import { submissionController } from '../controllers/submissionController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/history', authenticate, submissionController.getHistory);
router.get('/solves', authenticate, submissionController.getSolves);
router.get('/all', authenticate, requireAdmin, submissionController.getAllSubmissions);

export default router;
