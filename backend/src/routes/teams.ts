import { Router } from 'express';
import { teamController } from '../controllers/teamController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticate, teamController.createTeam);
router.post('/join', authenticate, teamController.joinTeam);
router.post('/leave', authenticate, teamController.leaveTeam);
router.get('/', authenticate, teamController.getTeams);
router.get('/my', authenticate, teamController.getMyTeam);

export default router;
