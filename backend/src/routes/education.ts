import { Router } from 'express';
import { educationController } from '../controllers/educationController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const router = Router();

// --- Public/User routes ---
router.get('/paths', authenticate, educationController.getPaths);
router.get('/paths/:pathId/modules', authenticate, educationController.getPathModules);
router.get('/academy/modules', authenticate, educationController.getAcademyModules);

// --- Admin Paths ---
router.post('/paths', authenticate, requireAdmin, educationController.createPath);
router.delete('/paths/:id', authenticate, requireAdmin, educationController.deletePath);

// --- Admin Path Modules ---
router.post('/path-modules', authenticate, requireAdmin, educationController.createPathModule);
router.put('/path-modules/:id', authenticate, requireAdmin, educationController.updatePathModule);
router.delete('/path-modules/:id', authenticate, requireAdmin, educationController.deletePathModule);

// --- Admin Path Questions ---
router.post('/path-questions', authenticate, requireAdmin, educationController.createPathQuestion);
router.put('/path-questions/:id', authenticate, requireAdmin, educationController.updatePathQuestion);
router.delete('/path-questions/:id', authenticate, requireAdmin, educationController.deletePathQuestion);

// --- Admin Academy ---
router.post('/academy/modules', authenticate, requireAdmin, educationController.createAcademyModule);
router.put('/academy/modules/:id', authenticate, requireAdmin, educationController.updateAcademyModule);
router.delete('/academy/modules/:id', authenticate, requireAdmin, educationController.deleteAcademyModule);

// --- Admin Questions ---
router.post('/academy/questions', authenticate, requireAdmin, educationController.createAcademyQuestion);

// --- Shared Assets ---
router.post('/upload', authenticate, requireAdmin, upload.single('image'), educationController.uploadImage);

export default router;
