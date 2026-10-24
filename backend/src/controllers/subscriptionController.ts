import { Response } from 'express';
import { db } from '../db';
import { AuthRequest } from '../middleware/auth';

export const SUBSCRIPTION_PLANS = [
  {
    id: 'free',
    name: 'Starter Planner',
    price_monthly: 0,
    price_yearly: 0,
    billing_period: 'monthly',
    badge: 'Standard',
    features: [
      'Up to 2 active Trip-Plan Cards',
      'Standard directory listing',
      'Direct traveler contact requests',
      'Community forum access'
    ],
    recommended: false
  },
  {
    id: 'pro',
    name: 'Pro Planner',
    price_monthly: 999,
    price_yearly: 9990,
    billing_period: 'monthly',
    badge: 'Popular',
    features: [
      'Unlimited Trip-Plan Cards',
      'Verified Planner Badge on all cards',
      'Priority placement in search results',
      'Direct WhatsApp and Phone lead alerts',
      'Analytics & lead impression tracker',
      'Standard email & phone support'
    ],
    recommended: true
  },
  {
    id: 'elite',
    name: 'Elite Agency / Master Planner',
    price_monthly: 2499,
    price_yearly: 24990,
    billing_period: 'monthly',
    badge: 'Top Tier',
    features: [
      'Everything in Pro Planner',
      'Featured homepage spotlight banner',
      'Exclusive regional exclusivity badge',
      'Custom travel itinerary templates',
      'Dedicated 24/7 account manager',
      'Zero commission on group inquiries'
    ],
    recommended: false
  }
];

export const subscriptionController = {
  // Get all available plans
  getPlans(req: AuthRequest, res: Response) {
    return res.json({
      gateway_mode: process.env.PAYMENT_GATEWAY_MODE || 'test',
      plans: SUBSCRIPTION_PLANS,
      notice: 'In development/testing mode, payments are safely simulated without storing any card numbers or making live charges.'
    });
  },

  // Get current planner subscription status
  async getCurrentSubscription(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const subscription = await db.subscriptions.findByPlannerId(profile.id);
      const planInfo = SUBSCRIPTION_PLANS.find(p => p.id === (subscription?.plan_id || profile.current_plan)) || SUBSCRIPTION_PLANS[0];

      return res.json({
        profile: {
          id: profile.id,
          current_plan: profile.current_plan
        },
        subscription: subscription || {
          plan_id: 'free',
          plan_name: 'Starter Planner',
          status: 'active',
          price: 0,
          billing_period: 'monthly',
          expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
          auto_renew: true
        },
        plan_details: planInfo
      });
    } catch (err: any) {
      console.error('[subscription.getCurrent error]', err);
      return res.status(500).json({ error: 'Failed to retrieve subscription.' });
    }
  },

  // Process subscription checkout (Safe test flow or real gateway webhook)
  async checkout(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'planner') {
        return res.status(403).json({ error: 'Planner account required.' });
      }

      const { plan_id, billing_period = 'monthly', test_token } = req.body;
      const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === plan_id);
      if (!targetPlan) {
        return res.status(400).json({ error: 'Invalid subscription plan selected.' });
      }

      const profile = await db.planners.findByUserId(req.user.id);
      if (!profile) {
        return res.status(404).json({ error: 'Planner profile not found.' });
      }

      const price = billing_period === 'yearly' ? targetPlan.price_yearly : targetPlan.price_monthly;
      const durationDays = billing_period === 'yearly' ? 365 : 30;
      const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();

      // Note: In test mode, we generate a mock transaction ID and NEVER store sensitive card credentials
      const transactionId = `tx_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      const subscription = await db.subscriptions.createOrUpdate({
        planner_id: profile.id,
        plan_id: targetPlan.id,
        plan_name: targetPlan.name,
        price,
        billing_period: billing_period as 'monthly' | 'yearly',
        status: 'active',
        benefits: targetPlan.features.join('; '),
        payment_method: test_token ? 'simulated_test_card' : 'standard_checkout',
        transaction_id: transactionId,
        expires_at: expiresAt,
        auto_renew: true
      });

      // Update planner profile tier and verification badge if pro/elite
      if (targetPlan.id === 'pro' || targetPlan.id === 'elite') {
        await db.planners.update(profile.id, {
          verified: true,
          current_plan: targetPlan.id
        });
      }

      return res.status(201).json({
        message: `Successfully subscribed to ${targetPlan.name}!`,
        subscription,
        mode: 'test_simulation',
        documentation: 'Real payments can be integrated by attaching Stripe or Razorpay client tokens in backend/.env'
      });
    } catch (err: any) {
      console.error('[subscription.checkout error]', err);
      return res.status(500).json({ error: 'Failed to complete subscription checkout.' });
    }
  }
};
