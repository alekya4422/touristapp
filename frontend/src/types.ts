export type UserRole = 'traveler' | 'planner' | 'admin';
export type UserStatus = 'active' | 'pending' | 'suspended';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: UserStatus;
  created_at?: string;
}

export interface PlannerProfile {
  id: number;
  user_id: number;
  bio: string;
  location: string;
  languages: string;
  experience_years: number;
  specialties?: string;
  contact_method: string;
  contact_phone: string;
  contact_email: string;
  whatsapp_number?: string | null;
  website?: string | null;
  verified: boolean;
  rating: number;
  reviews_count: number;
  current_plan: string;
  full_name?: string;
  avatar_url?: string | null;
  user_status?: UserStatus;
  cards_count?: number;
  cards?: TripCard[];
}

export interface TripCard {
  id: number;
  planner_id: number;
  title: string;
  origin: string;
  destination: string;
  destination_aliases?: string;
  duration: string;
  travel_dates: string;
  price_type: 'fixed' | 'range' | 'custom';
  price_display: string;
  price_min: number;
  price_max: number;
  itinerary: string;
  included_services: string;
  languages: string;
  contact_phone?: string;
  contact_email?: string;
  contact_whatsapp?: string;
  is_published: boolean;
  admin_status: 'approved' | 'pending' | 'flagged';
  featured: boolean;
  views_count: number;
  created_at?: string;
  planner_name?: string;
  planner_avatar?: string | null;
  planner_location?: string;
  planner_languages?: string;
  planner_rating?: number;
  planner_reviews_count?: number;
  planner_verified?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  billing_period: string;
  badge: string;
  features: string[];
  recommended: boolean;
}

export interface SubscriptionRecord {
  id: number;
  planner_id: number;
  plan_id: string;
  plan_name: string;
  price: number;
  billing_period: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  benefits: string;
  payment_method: string;
  transaction_id?: string;
  started_at?: string;
  expires_at: string;
  auto_renew: boolean;
  planner_name?: string;
  planner_email?: string;
}

export interface ContactInquiry {
  id: number;
  trip_card_id: number;
  planner_id: number;
  traveler_id?: number | null;
  traveler_name: string;
  traveler_email: string;
  traveler_phone: string;
  travel_date?: string;
  group_size: number;
  message: string;
  created_at?: string;
  trip_title?: string;
}
