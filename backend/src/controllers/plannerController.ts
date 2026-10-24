import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export const plannerController = {
  // Get current planner's profile
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      let profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        // Auto-create blank profile if newly registered
        const user = await db.users.findById(req.user.id);
        profile = await db.planners.create({
          user_id: req.user.id,
          bio: 'Dedicated local travel planner.',
          location: 'Visakhapatnam, Andhra Pradesh',
          languages: 'Telugu, Hindi, English',
          experience_years: 1,
          contact_method: 'phone',
          contact_phone: user?.phone || '+91 90000 00000',
          contact_email: user?.email || '',
          verified: false,
          rating: 5.0,
          reviews_count: 0,
          current_plan: 'free'
        });
      }

      return res.json({ profile });
    } catch (err: any) {
      console.error('[planner.getProfile error]', err);
      return res.status(500).json({ error: 'Failed to fetch planner profile.' });
    }
  },

  // Update current planner's profile
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const {
        bio,
        location,
        languages,
        experience_years,
        specialties,
        contact_method,
        contact_phone,
        contact_email,
        whatsapp_number,
        website,
        full_name,
        avatar_url
      } = req.body;

      // Update planner profile fields
      const updatedProfile = await db.planners.update(profile.id, {
        bio,
        location,
        languages,
        experience_years: experience_years !== undefined ? Number(experience_years) : profile.experience_years,
        specialties,
        contact_method,
        contact_phone,
        contact_email,
        whatsapp_number,
        website
      });

      // Update user name/avatar if provided
      if (full_name || avatar_url) {
        const user = await db.users.findById(req.user.id);
        if (user) {
          if (full_name) user.full_name = full_name;
          if (avatar_url) user.avatar_url = avatar_url;
        }
      }

      return res.json({
        message: 'Profile updated successfully',
        profile: updatedProfile
      });
    } catch (err: any) {
      console.error('[planner.updateProfile error]', err);
      return res.status(500).json({ error: 'Failed to update planner profile.' });
    }
  },

  // Get all cards created by this planner
  async getMyCards(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const cards = await db.trips.findByPlannerId(profile.id);
      return res.json({ cards });
    } catch (err: any) {
      console.error('[planner.getMyCards error]', err);
      return res.status(500).json({ error: 'Failed to retrieve trip cards.' });
    }
  },

  // Create a new trip card
  async createCard(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      // Check tier limits if on free plan (e.g. max 2 cards)
      if (profile.current_plan === 'free') {
        const existing = await db.trips.findByPlannerId(profile.id);
        if (existing.length >= 2) {
          return res.status(403).json({
            error: 'You have reached the limit of 2 trip cards on the Starter plan. Please upgrade to Pro for unlimited listings.'
          });
        }
      }

      const {
        title,
        origin,
        destination,
        destination_aliases,
        duration,
        travel_dates,
        price_type = 'fixed',
        price_display,
        price_min = 0,
        price_max = 0,
        itinerary,
        included_services,
        languages,
        contact_phone,
        contact_email,
        contact_whatsapp
      } = req.body;

      if (!title || !origin || !destination || !duration || !itinerary) {
        return res.status(400).json({
          error: 'Title, origin, destination, duration, and itinerary are required.'
        });
      }

      // Auto-expand destination aliases (e.g. if Kasi is specified, include Varanasi; if Varanasi, include Kasi)
      let aliases = destination_aliases || '';
      const destLower = destination.trim().toLowerCase();
      if (destLower.includes('kasi') && !aliases.toLowerCase().includes('varanasi')) {
        aliases = (aliases ? aliases + ', ' : '') + 'Varanasi, Banaras, Kashi';
      } else if (destLower.includes('varanasi') && !aliases.toLowerCase().includes('kasi')) {
        aliases = (aliases ? aliases + ', ' : '') + 'Kasi, Banaras, Kashi';
      }

      const newCard = await db.trips.create({
        planner_id: profile.id,
        title: title.trim(),
        origin: origin.trim(),
        destination: destination.trim(),
        destination_aliases: aliases,
        duration: duration.trim(),
        travel_dates: travel_dates ? travel_dates.trim() : 'Flexible / Weekly departures',
        price_type,
        price_display: price_display || (price_min > 0 ? `₹${price_min.toLocaleString('en-IN')}` : 'Contact for pricing'),
        price_min: Number(price_min) || 0,
        price_max: Number(price_max) || Number(price_min) || 0,
        itinerary: itinerary.trim(),
        included_services: included_services ? included_services.trim() : '',
        languages: languages ? languages.trim() : profile.languages,
        contact_phone: contact_phone || profile.contact_phone,
        contact_email: contact_email || profile.contact_email,
        contact_whatsapp: contact_whatsapp || profile.whatsapp_number || undefined,
        is_published: true,
        admin_status: 'approved',
        featured: profile.current_plan === 'pro' || profile.current_plan === 'elite'
      });

      return res.status(201).json({
        message: 'Trip plan card created successfully',
        card: newCard
      });
    } catch (err: any) {
      console.error('[planner.createCard error]', err);
      return res.status(500).json({ error: 'Failed to create trip plan card.' });
    }
  },

  // Update trip card
  async updateCard(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const cardId = Number(req.params.id);
      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const existingCard = await db.trips.findById(cardId);
      if (!existingCard) {
        return res.status(404).json({ error: 'Trip card not found.' });
      }

      // Security check: planners must only be able to manage their own cards
      if (existingCard.planner_id !== profile.id) {
        return res.status(403).json({ error: 'You do not have permission to modify this trip card.' });
      }

      const updated = await db.trips.update(cardId, profile.id, req.body);
      return res.json({
        message: 'Trip card updated successfully',
        card: updated
      });
    } catch (err: any) {
      console.error('[planner.updateCard error]', err);
      return res.status(500).json({ error: 'Failed to update trip card.' });
    }
  },

  // Toggle publish / unpublish
  async togglePublish(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const cardId = Number(req.params.id);
      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const existingCard = await db.trips.findById(cardId);
      if (!existingCard || existingCard.planner_id !== profile.id) {
        return res.status(403).json({ error: 'You do not have permission to modify this trip card.' });
      }

      const updated = await db.trips.togglePublish(cardId, profile.id);
      return res.json({
        message: updated?.is_published ? 'Card published to travelers' : 'Card unpublished',
        card: updated
      });
    } catch (err: any) {
      console.error('[planner.togglePublish error]', err);
      return res.status(500).json({ error: 'Failed to change publish status.' });
    }
  },

  // Delete trip card
  async deleteCard(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const cardId = Number(req.params.id);
      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const existingCard = await db.trips.findById(cardId);
      if (!existingCard || existingCard.planner_id !== profile.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this trip card.' });
      }

      await db.trips.delete(cardId, profile.id);
      return res.json({ message: 'Trip card deleted successfully.' });
    } catch (err: any) {
      console.error('[planner.deleteCard error]', err);
      return res.status(500).json({ error: 'Failed to delete trip card.' });
    }
  },

  // View traveler inquiries received by this planner
  async getInquiries(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const inquiries = await db.inquiries.findByPlannerId(profile.id);
      return res.json({ inquiries });
    } catch (err: any) {
      console.error('[planner.getInquiries error]', err);
      return res.status(500).json({ error: 'Failed to fetch inquiries.' });
    }
  }
};
