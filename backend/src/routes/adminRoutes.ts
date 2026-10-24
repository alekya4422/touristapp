import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Admins only
router.use(authenticateJWT, requireRole('admin'));

router.get('/metrics', adminController.getMetrics);
router.get('/planners', adminController.getPlannersWithCards);
router.patch('/planners/:id/status', adminController.updatePlannerStatus);

router.get('/cards', adminController.getCards);
router.patch('/cards/:id/moderate', adminController.moderateCard);
router.delete('/cards/:id', adminController.deleteCard);

router.get('/users', adminController.getUsers);
router.get('/subscriptions', adminController.getSubscriptions);

export default router;
