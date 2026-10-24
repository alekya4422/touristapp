import { Router } from 'express';
import { subscriptionController } from '../controllers/subscriptionController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = Router();

// Public plan directory
router.get('/plans', subscriptionController.getPlans);

// Planner subscription actions
router.get('/current', authenticateJWT, requireRole('planner'), subscriptionController.getCurrentSubscription);
router.post('/checkout', authenticateJWT, requireRole('planner'), subscriptionController.checkout);

export default router;
