import { Router } from 'express';
import { plannerController } from '../controllers/plannerController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Planners only
router.use(authenticateJWT, requireRole('planner'));

router.get('/profile', plannerController.getProfile);
router.put('/profile', plannerController.updateProfile);

router.get('/cards', plannerController.getMyCards);
router.post('/cards', plannerController.createCard);
router.put('/cards/:id', plannerController.updateCard);
router.patch('/cards/:id/publish', plannerController.togglePublish);
router.delete('/cards/:id', plannerController.deleteCard);

router.get('/inquiries', plannerController.getInquiries);

export default router;
