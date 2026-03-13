import { Router } from 'express';
import { ctfController } from '../controllers/ctfController.js';
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
        } catch { }
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});

router.get('/', authenticate, ctfController.getEvents);
router.post('/', authenticate, requireAdmin, upload.single('banner'), ctfController.createEvent);
router.put('/:id', authenticate, requireAdmin, upload.single('banner'), ctfController.updateEvent);
router.delete('/:id', authenticate, requireAdmin, ctfController.deleteEvent);
router.post('/upload', authenticate, requireAdmin, upload.single('banner'), ctfController.uploadBanner);

// Registration
router.post('/:id/register', authenticate, ctfController.registerEvent);
router.get('/:id/registration-status', authenticate, ctfController.getRegistrationStatus);

export default router;
