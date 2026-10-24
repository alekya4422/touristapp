import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticateJWT, authRateLimiter } from '../middleware/auth';

const router = Router();

router.post('/register', authRateLimiter(20), authController.register);
router.post('/login', authRateLimiter(20), authController.login);
router.get('/me', authenticateJWT, authController.me);

export default router;
