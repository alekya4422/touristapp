import { Router } from 'express';
import { tripController } from '../controllers/tripController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

// Public traveler search
router.get('/search', tripController.search);
router.get('/:id', tripController.getById);

// Direct traveler contact inquiry
router.post('/:id/contact', optionalAuth, tripController.contactPlanner);

export default router;
