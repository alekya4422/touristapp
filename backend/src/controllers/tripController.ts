import { Request, Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export const tripController = {
  // Public search for travelers
  async search(req: Request, res: Response) {
    try {
      const {
        origin,
        destination,
        travel_date,
        min_price,
        max_price,
        duration,
        languages
      } = req.query;

      const trips = await db.trips.search({
        origin: origin ? String(origin) : undefined,
        destination: destination ? String(destination) : undefined,
        travel_date: travel_date ? String(travel_date) : undefined,
        min_price: min_price ? Number(min_price) : undefined,
        max_price: max_price ? Number(max_price) : undefined,
        duration: duration ? String(duration) : undefined,
        languages: languages ? String(languages) : undefined
      });

      // Strip private direct phone numbers from public card search response
      // They are revealed when traveler clicks "Contact Planner"
      const sanitized = trips.map(t => ({
        ...t,
        contact_phone: undefined, // hidden until direct contact
        contact_whatsapp: undefined
      }));

      return res.json({
        total: trips.length,
        trips: sanitized
      });
    } catch (err: any) {
      console.error('[trips.search error]', err);
      return res.status(500).json({ error: 'Failed to search trip plans.' });
    }
  },

  // Get single trip card details
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid trip ID.' });
      }

      const trip = await db.trips.findById(id);
      if (!trip) {
        return res.status(404).json({ error: 'Trip card not found.' });
      }

      const planner = await db.planners.findById(trip.planner_id);
      const reviews = await db.reviews.findByPlannerId(trip.planner_id);

      return res.json({
        trip: {
          ...trip,
          contact_phone: undefined // masked until traveler contacts
        },
        planner: planner ? {
          id: planner.id,
          full_name: planner.full_name,
          avatar_url: planner.avatar_url,
          bio: planner.bio,
          location: planner.location,
          languages: planner.languages,
          experience_years: planner.experience_years,
          specialties: planner.specialties,
          verified: planner.verified,
          rating: planner.rating,
          reviews_count: planner.reviews_count,
          current_plan: planner.current_plan
        } : null,
        reviews
      });
    } catch (err: any) {
      console.error('[trips.getById error]', err);
      return res.status(500).json({ error: 'Failed to load trip details.' });
    }
  },

  // Traveler contacts planner: stores inquiry and reveals planner contact info
  async contactPlanner(req: AuthRequest, res: Response) {
    try {
      const tripId = Number(req.params.id);
      const { traveler_name, traveler_phone, traveler_email, travel_date, group_size, message } = req.body;

      if (!traveler_name || !traveler_phone || !traveler_email) {
        return res.status(400).json({ error: 'Name, phone, and email are required to contact the planner.' });
      }

      const trip = await db.trips.findById(tripId);
      if (!trip) {
        return res.status(404).json({ error: 'Trip plan not found.' });
      }

      const planner = await db.planners.findById(trip.planner_id);
      if (!planner) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const inquiry = await db.inquiries.create({
        trip_card_id: trip.id,
        planner_id: trip.planner_id,
        traveler_id: req.user?.id || null,
        traveler_name: traveler_name.trim(),
        traveler_phone: traveler_phone.trim(),
        traveler_email: traveler_email.trim().toLowerCase(),
        travel_date: travel_date ? String(travel_date) : undefined,
        group_size: Number(group_size) || 1,
        message: message ? message.trim() : 'Inquired about this trip plan.'
      });

      // Now return the verified contact details to the traveler
      return res.status(201).json({
        message: 'Your inquiry has been sent directly to the planner!',
        inquiry_id: inquiry.id,
        planner_contact: {
          planner_name: planner.full_name,
          phone: trip.contact_phone || planner.contact_phone,
          whatsapp: trip.contact_whatsapp || planner.whatsapp_number,
          email: trip.contact_email || planner.contact_email,
          contact_method: planner.contact_method
        }
      });
    } catch (err: any) {
      console.error('[trips.contactPlanner error]', err);
      return res.status(500).json({ error: 'Failed to submit inquiry.' });
    }
  }
};
