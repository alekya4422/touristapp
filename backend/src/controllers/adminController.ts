import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export const adminController = {
  // Summary counts and metrics
  async getMetrics(req: AuthRequest, res: Response) {
    try {
      const planners = await db.planners.listAll();
      const allCards = await db.trips.listAllForAdmin();
      const users = await db.users.listAll();
      const subscriptions = await db.subscriptions.listAll();

      const totalPlanners = planners.length;
      const activeCards = allCards.filter(c => c.is_published && c.admin_status === 'approved').length;
      const pendingApprovals = planners.filter(p => p.user_status === 'pending').length + allCards.filter(c => c.admin_status === 'pending').length;
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active' && s.plan_id !== 'free').length;

      return res.json({
        metrics: {
          totalPlanners,
          activeCards,
          pendingApprovals,
          activeSubscriptions,
          totalUsers: users.length
        }
      });
    } catch (err: any) {
      console.error('[admin.getMetrics error]', err);
      return res.status(500).json({ error: 'Failed to retrieve admin metrics.' });
    }
  },

  // Planners with their associated cards, filterable and searchable
  async getPlannersWithCards(req: AuthRequest, res: Response) {
    try {
      const { search, status, verified } = req.query;
      let planners = await db.planners.listAll();
      const allCards = await db.trips.listAllForAdmin();

      if (search && String(search).trim()) {
        const q = String(search).trim().toLowerCase();
        planners = planners.filter(p =>
          (p.full_name || '').toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.contact_email.toLowerCase().includes(q) ||
          p.languages.toLowerCase().includes(q)
        );
      }

      if (status && String(status).trim() !== 'all') {
        planners = planners.filter(p => p.user_status === String(status));
      }

      if (verified !== undefined && verified !== 'all') {
        const isVer = verified === 'true';
        planners = planners.filter(p => Boolean(p.verified) === isVer);
      }

      // Group cards under each planner
      const result = planners.map(p => {
        const plannerCards = allCards.filter(c => c.planner_id === p.id);
        return {
          ...p,
          cards_count: plannerCards.length,
          cards: plannerCards
        };
      });

      return res.json({
        total: result.length,
        planners: result
      });
    } catch (err: any) {
      console.error('[admin.getPlannersWithCards error]', err);
      return res.status(500).json({ error: 'Failed to retrieve planners.' });
    }
  },

  // Update planner status (approve / suspend / activate)
  async updatePlannerStatus(req: AuthRequest, res: Response) {
    try {
      const plannerId = Number(req.params.id);
      const { status, verified } = req.body;

      const profile = await db.planners.findById(plannerId);
      if (!profile) {
        return res.status(404).json({ error: 'Planner not found.' });
      }

      if (status) {
        await db.planners.updateStatus(plannerId, status);
      }

      if (verified !== undefined) {
        await db.planners.update(plannerId, { verified: Boolean(verified) });
      }

      const updated = await db.planners.findById(plannerId);
      return res.json({
        message: 'Planner status updated successfully.',
        planner: updated
      });
    } catch (err: any) {
      console.error('[admin.updatePlannerStatus error]', err);
      return res.status(500).json({ error: 'Failed to update planner status.' });
    }
  },

  // List all trip cards for moderation
  async getCards(req: AuthRequest, res: Response) {
    try {
      const { search, status } = req.query;
      let cards = await db.trips.listAllForAdmin();

      if (search && String(search).trim()) {
        const q = String(search).trim().toLowerCase();
        cards = cards.filter(c =>
          c.title.toLowerCase().includes(q) ||
          c.origin.toLowerCase().includes(q) ||
          c.destination.toLowerCase().includes(q) ||
          (c.planner_name || '').toLowerCase().includes(q)
        );
      }

      if (status && String(status).trim() !== 'all') {
        cards = cards.filter(c => c.admin_status === String(status));
      }

      return res.json({
        total: cards.length,
        cards
      });
    } catch (err: any) {
      console.error('[admin.getCards error]', err);
      return res.status(500).json({ error: 'Failed to retrieve cards.' });
    }
  },

  // Moderate card (approve, flag, pending)
  async moderateCard(req: AuthRequest, res: Response) {
    try {
      const cardId = Number(req.params.id);
      const { admin_status, featured } = req.body;

      const card = await db.trips.findById(cardId);
      if (!card) {
        return res.status(404).json({ error: 'Trip card not found.' });
      }

      if (admin_status) {
        await db.trips.updateAdminStatus(cardId, admin_status);
      }

      if (featured !== undefined) {
        card.featured = Boolean(featured);
      }

      return res.json({
        message: 'Trip card moderated successfully.'
      });
    } catch (err: any) {
      console.error('[admin.moderateCard error]', err);
      return res.status(500).json({ error: 'Failed to moderate card.' });
    }
  },

  // Remove inappropriate card
  async deleteCard(req: AuthRequest, res: Response) {
    try {
      const cardId = Number(req.params.id);
      const success = await db.trips.delete(cardId);
      if (!success) {
        return res.status(404).json({ error: 'Trip card not found.' });
      }
      return res.json({ message: 'Trip card removed by admin.' });
    } catch (err: any) {
      console.error('[admin.deleteCard error]', err);
      return res.status(500).json({ error: 'Failed to delete card.' });
    }
  },

  // List all system users
  async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await db.users.listAll();
      return res.json({ users });
    } catch (err: any) {
      console.error('[admin.getUsers error]', err);
      return res.status(500).json({ error: 'Failed to retrieve users.' });
    }
  },

  // List all subscriptions
  async getSubscriptions(req: AuthRequest, res: Response) {
    try {
      const subscriptions = await db.subscriptions.listAll();
      return res.json({ subscriptions });
    } catch (err: any) {
      console.error('[admin.getSubscriptions error]', err);
      return res.status(500).json({ error: 'Failed to retrieve subscriptions.' });
    }
  }
};
