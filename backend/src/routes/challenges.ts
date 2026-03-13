import { Router } from 'express';
import { challengeController } from '../controllers/challengeController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const router = Router();

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadDir = './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch {}
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.get('/', authenticate, challengeController.getChallenges);
router.get('/categories', authenticate, challengeController.getCategories);
router.get('/:id', authenticate, challengeController.getChallengeById);
router.post('/', authenticate, requireAdmin, challengeController.createChallenge);
router.put('/:id', authenticate, requireAdmin, challengeController.updateChallenge);
router.delete('/:id', authenticate, requireAdmin, challengeController.deleteChallenge);
router.post('/upload', authenticate, requireAdmin, upload.single('file'), challengeController.uploadAttachment);
router.post('/submit', authenticate, challengeController.submitFlag);

export default router;
