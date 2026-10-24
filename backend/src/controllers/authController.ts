import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { signToken, AuthRequest } from '../middleware/auth';
import { UserRole } from '../types';

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        role = 'traveler',
        full_name,
        phone,
        // Planner specific fields if registering as planner
        location,
        languages = 'English',
        experience_years = 1,
        bio,
        specialties
      } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Email, password, and full name are required.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }

      const existing = await db.users.findByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists.' });
      }

      const validRoles: UserRole[] = ['traveler', 'planner'];
      const userRole: UserRole = validRoles.includes(role) ? role : 'traveler';

      const password_hash = await bcrypt.hash(password, 10);
      const user = await db.users.create({
        email: email.trim().toLowerCase(),
        password_hash,
        role: userRole,
        full_name: full_name.trim(),
        phone: phone ? phone.trim() : null,
        status: userRole === 'planner' ? 'active' : 'active'
      });

      let plannerProfile = null;
      if (userRole === 'planner') {
        plannerProfile = await db.planners.create({
          user_id: user.id,
          bio: bio || 'Professional trip planner offering custom travel arrangements.',
          location: location || 'Visakhapatnam, Andhra Pradesh',
          languages: languages || 'English, Telugu, Hindi',
          experience_years: Number(experience_years) || 1,
          specialties: specialties || 'Custom Tours, Group Pilgrimages',
          contact_method: 'phone',
          contact_phone: phone || '+91 90000 00000',
          contact_email: user.email,
          whatsapp_number: phone || null,
          website: null,
          verified: false,
          rating: 5.0,
          reviews_count: 0,
          current_plan: 'free'
        });
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        planner_id: plannerProfile?.id
      });

      return res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          status: user.status
        },
        planner_profile: plannerProfile
      });
    } catch (err: any) {
      console.error('[auth.register error]', err);
      return res.status(500).json({ error: 'Failed to register account.' });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await db.users.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'Your account has been suspended. Please contact support.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      let plannerProfile = null;
      if (user.role === 'planner') {
        plannerProfile = await db.planners.findByUserId(user.id);
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        role: user.role,
        planner_id: plannerProfile?.id
      });

      return res.json({
        message: 'Logged in successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          status: user.status
        },
        planner_profile: plannerProfile
      });
    } catch (err: any) {
      console.error('[auth.login error]', err);
      return res.status(500).json({ error: 'Login failed due to a server error.' });
    }
  },

  async me(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }

      const user = await db.users.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      let plannerProfile = null;
      if (user.role === 'planner') {
        plannerProfile = await db.planners.findByUserId(user.id);
      }

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          phone: user.phone,
          avatar_url: user.avatar_url,
          status: user.status
        },
        planner_profile: plannerProfile
      });
    } catch (err: any) {
      console.error('[auth.me error]', err);
      return res.status(500).json({ error: 'Failed to retrieve profile.' });
    }
  }
};
