import mysql, { Pool } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { User, PlannerProfile, TripCard, Subscription, ContactInquiry, Review } from './types';

dotenv.config();

let pool: Pool | null = null;
let isMySqlConnected = false;

// Seed Data for In-Memory Fallback & Schema Sync
const INITIAL_USERS: User[] = [
  {
    id: 1,
    email: 'admin@tripplanner.com',
    password_hash: '$2a$10$r/rVVmdOSR6/LLHBLHB85.ciQV7mVohBQzURqAcJcKBKr2QQhDzqm', // Admin@123
    role: 'admin',
    full_name: 'Super Administrator',
    phone: '+91 98480 11111',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    email: 'ramesh.planner@tripplanner.com',
    password_hash: '$2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge', // Planner@123
    role: 'planner',
    full_name: 'Ramesh Varma',
    phone: '+91 89190 23456',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    email: 'priya.kerala@tripplanner.com',
    password_hash: '$2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge', // Planner@123
    role: 'planner',
    full_name: 'Priya Menon',
    phone: '+91 94470 34567',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    email: 'arjun.himalayas@tripplanner.com',
    password_hash: '$2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge', // Planner@123
    role: 'planner',
    full_name: 'Arjun Rawat',
    phone: '+91 98160 45678',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    email: 'vikram.rajasthan@tripplanner.com',
    password_hash: '$2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge', // Planner@123
    role: 'planner',
    full_name: 'Vikram Singh',
    phone: '+91 94140 56789',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    status: 'pending',
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    email: 'traveler@example.com',
    password_hash: '$2a$10$u625UFZNpV21uwnrUIhUwOWAi8YNzlZgylmVX18CpEUMq1QePMSIK', // Traveler@123
    role: 'traveler',
    full_name: 'Ananya Sharma',
    phone: '+91 98765 43210',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

const INITIAL_PROFILES: PlannerProfile[] = [
  {
    id: 1,
    user_id: 2,
    bio: 'Certified pilgrimage and heritage travel specialist with 12+ years of guiding families and spiritual seekers across Varanasi (Kasi), Prayagraj, Ayodhya, and Andhra heritage circuits. Known for authentic local experiences and VIP darshan arrangements.',
    location: 'Visakhapatnam, Andhra Pradesh',
    languages: 'Telugu, Hindi, English',
    experience_years: 12,
    specialties: 'Spiritual Tours, Heritage, North India Pilgrimages',
    contact_method: 'phone',
    contact_phone: '+91 89190 23456',
    contact_email: 'ramesh.planner@tripplanner.com',
    whatsapp_number: '+91 89190 23456',
    website: 'https://visakhakasiyatra.example.com',
    verified: true,
    rating: 4.95,
    reviews_count: 48,
    current_plan: 'pro',
    full_name: 'Ramesh Varma',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    user_status: 'active'
  },
  {
    id: 2,
    user_id: 3,
    bio: 'South India ecotourism and bespoke luxury planner. From private houseboats in Alleppey to tea trail walks in Munnar and temple architecture in Madurai.',
    location: 'Kochi, Kerala',
    languages: 'Malayalam, English, Hindi, Tamil',
    experience_years: 8,
    specialties: 'Backwaters, Tea Plantations, Wellness & Ayurveda',
    contact_method: 'phone',
    contact_phone: '+91 94470 34567',
    contact_email: 'priya.kerala@tripplanner.com',
    whatsapp_number: '+91 94470 34567',
    website: 'https://keralabliss.example.com',
    verified: true,
    rating: 4.88,
    reviews_count: 36,
    current_plan: 'pro',
    full_name: 'Priya Menon',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    user_status: 'active'
  },
  {
    id: 3,
    user_id: 4,
    bio: 'High-altitude expedition leader and Himachal/Ladakh cultural planner. Handling mountain passes, monasteries, camping, and self-drive convoys.',
    location: 'New Delhi / Manali',
    languages: 'Hindi, English, Punjabi',
    experience_years: 9,
    specialties: 'Himalayan Treks, Spiti Roadtrips, Ladakh Safaris',
    contact_method: 'phone',
    contact_phone: '+91 98160 45678',
    contact_email: 'arjun.himalayas@tripplanner.com',
    whatsapp_number: '+91 98160 45678',
    verified: true,
    rating: 4.92,
    reviews_count: 29,
    current_plan: 'free',
    full_name: 'Arjun Rawat',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    user_status: 'active'
  },
  {
    id: 4,
    user_id: 5,
    bio: 'Desert heritage storyteller crafting royal palace itineraries across Jaipur, Udaipur, and Jaisalmer sand dunes.',
    location: 'Jaipur, Rajasthan',
    languages: 'Hindi, Rajasthani, English',
    experience_years: 5,
    specialties: 'Desert Safaris, Palaces, Culinary Trails',
    contact_method: 'phone',
    contact_phone: '+91 94140 56789',
    contact_email: 'vikram.rajasthan@tripplanner.com',
    whatsapp_number: '+91 94140 56789',
    verified: false,
    rating: 4.70,
    reviews_count: 11,
    current_plan: 'free',
    full_name: 'Vikram Singh',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    user_status: 'pending'
  }
];

const INITIAL_TRIP_CARDS: TripCard[] = [
  {
    id: 1,
    planner_id: 1,
    title: 'Divine Kasi & Prayagraj Yatra from Visakhapatnam',
    origin: 'Visakhapatnam',
    destination: 'Kasi',
    destination_aliases: 'Varanasi, Banaras, Kashi, Prayagraj',
    duration: '5 Days / 4 Nights',
    travel_dates: 'Every Wednesday & Friday Departures (All Year)',
    price_type: 'fixed',
    price_display: '₹16,500 per person',
    price_min: 16500,
    price_max: 16500,
    itinerary: `Day 1: Departure from Visakhapatnam (Train/Flight assistance). Evening arrival in Varanasi (Kasi). Check-in at central heritage hotel near Godowlia. Sunset Ganga Aarti at Dashashwamedh Ghat from a reserved VIP wooden boat.
Day 2: Early morning holy dip at Manikarnika Ghat, special VIP Kashi Vishwanath Temple Darshan, Annapurna Devi, and Vishalakshi Shaktipeeth. Afternoon authentic Banarasi silk weaver colony visit.
Day 3: Sunrise boat ride along the Ghats. Excursion to Sarnath where Lord Buddha delivered his first sermon; visit Dhamek Stupa and Archaeological Museum.
Day 4: Scenic day drive to Prayagraj (Allahabad). Holy Triveni Sangam boat ride and holy snan. Visit Anand Bhavan and return to Varanasi for evening bhajan session.
Day 5: Kaal Bhairav and Sankat Mochan temple darshan, taste world-famous Malaiyo & Banarasi Paan, transfer to railway station / airport for journey back to Visakhapatnam.`,
    included_services: '3-Star Hotel AC Stay, Pure Veg Breakfast & Dinner, AC Cab for all local & Prayagraj transfers, Private Ganges Boating with Aarti, Special Darshan Coordinator (Telugu/Hindi speaking)',
    languages: 'Telugu, Hindi, English',
    contact_phone: '+91 89190 23456',
    contact_email: 'ramesh.planner@tripplanner.com',
    contact_whatsapp: '+91 89190 23456',
    is_published: true,
    admin_status: 'approved',
    featured: true,
    views_count: 342,
    created_at: new Date().toISOString(),
    planner_name: 'Ramesh Varma',
    planner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    planner_location: 'Visakhapatnam, Andhra Pradesh',
    planner_languages: 'Telugu, Hindi, English',
    planner_rating: 4.95,
    planner_reviews_count: 48,
    planner_verified: true
  },
  {
    id: 2,
    planner_id: 1,
    title: 'Visakhapatnam to Varanasi & Ayodhya Ram Janmabhoomi Express Tour',
    origin: 'Visakhapatnam',
    destination: 'Varanasi',
    destination_aliases: 'Kasi, Kashi, Ayodhya, Banaras',
    duration: '6 Days / 5 Nights',
    travel_dates: 'Weekly Departures: Mondays & Thursdays',
    price_type: 'range',
    price_display: '₹19,500 - ₹23,000',
    price_min: 19500,
    price_max: 23000,
    itinerary: `Day 1: Depart Vizag. Arrive in Varanasi, welcome drink, check-in, and private Assi Ghat Subah-e-Banaras briefing.
Day 2: Kashi Vishwanath corridor darshan, Kal Bhairav, Durga Kund. Evening Ganga Aarti VIP seats.
Day 3: Scenic highway drive to Ayodhya. Evening Sarayu river aarti and Ram Ki Paidi illumination.
Day 4: Early morning Shri Ram Janmabhoomi temple darshan, Hanuman Garhi, and Kanak Bhawan. Drive back to Varanasi.
Day 5: Leisure day in Varanasi for silk saree shopping, street food walk (Kachori Gali), and Sarnath trip.
Day 6: Drop at Varanasi Airport / Railway station for journey back to Visakhapatnam.`,
    included_services: 'Deluxe Hotel Stays, AC Tempo Traveller / Innova throughout, All Temple Assistance, Breakfast & Traditional Dinner, Tour Manager from Visakhapatnam',
    languages: 'Telugu, Hindi, English',
    contact_phone: '+91 89190 23456',
    contact_email: 'ramesh.planner@tripplanner.com',
    contact_whatsapp: '+91 89190 23456',
    is_published: true,
    admin_status: 'approved',
    featured: true,
    views_count: 219,
    created_at: new Date().toISOString(),
    planner_name: 'Ramesh Varma',
    planner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    planner_location: 'Visakhapatnam, Andhra Pradesh',
    planner_languages: 'Telugu, Hindi, English',
    planner_rating: 4.95,
    planner_reviews_count: 48,
    planner_verified: true
  },
  {
    id: 3,
    planner_id: 2,
    title: 'Classic Kerala Backwaters & Munnar Mist Trail',
    origin: 'Kochi',
    destination: 'Munnar',
    destination_aliases: 'Alleppey, Alappuzha, Fort Kochi',
    duration: '5 Days / 4 Nights',
    travel_dates: 'Daily Departures available',
    price_type: 'range',
    price_display: '₹14,500 - ₹18,000',
    price_min: 14500,
    price_max: 18000,
    itinerary: `Day 1: Pick up at Cochin International Airport / Ernakulam Junction. Drive to Munnar through Cheeyappara waterfalls. Check into hill resort.
Day 2: Eravikulam National Park (Nilgiri Tahr), Tea Museum, Mattupetty Dam, and Echo Point.
Day 3: Scenic transfer to Alleppey. Board private deluxe houseboat. Cruise scenic palm-fringed backwaters.
Day 4: Traditional Kerala breakfast on boat. Transfer to Fort Kochi: Chinese fishing nets, Jew Town, spice markets.
Day 5: Morning Kathakali showcase, souvenir shopping, departure transfer.`,
    included_services: 'Private AC Sedan with chauffeur, 2 Nights Munnar Hill Resort, 1 Night Private Houseboat with all 3 traditional Kerala meals, Spice plantation entry passes',
    languages: 'Malayalam, English, Hindi',
    contact_phone: '+91 94470 34567',
    contact_email: 'priya.kerala@tripplanner.com',
    contact_whatsapp: '+91 94470 34567',
    is_published: true,
    admin_status: 'approved',
    featured: false,
    views_count: 184,
    created_at: new Date().toISOString(),
    planner_name: 'Priya Menon',
    planner_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    planner_location: 'Kochi, Kerala',
    planner_languages: 'Malayalam, English, Hindi, Tamil',
    planner_rating: 4.88,
    planner_reviews_count: 36,
    planner_verified: true
  },
  {
    id: 4,
    planner_id: 3,
    title: 'Manali & Rohtang Pass Alpine Escape',
    origin: 'Delhi',
    destination: 'Manali',
    destination_aliases: 'Kullu, Solang Valley, Rohtang, Atal Tunnel',
    duration: '6 Days / 5 Nights',
    travel_dates: 'Departs every Saturday from Delhi',
    price_type: 'fixed',
    price_display: '₹13,999 per person',
    price_min: 13999,
    price_max: 13999,
    itinerary: `Day 1: Overnight Volvo semi-sleeper coach from Majnu Ka Tila, Delhi.
Day 2: Morning arrival in Manali. Check into apple-orchard boutique stay. Afternoon Hadimba Temple and Old Manali cafes.
Day 3: Thrilling drive through the engineering marvel Atal Tunnel to Sissu (Lahaul Valley). Snow activities at Solang Valley.
Day 4: Excursion to Rohtang Pass (subject to weather/permit) with snow scooters and mountain photography.
Day 5: Naggar Castle heritage visit, river rafting in Kullu river, and shopping at Mall Road. Evening overnight bus to Delhi.
Day 6: Early morning arrival back in Delhi.`,
    included_services: 'Volvo Tickets Delhi-Manali-Delhi, 3 Nights Hotel, Breakfast & Dinner, AC Cab for local sightseeing, Green permit handling',
    languages: 'Hindi, English, Punjabi',
    contact_phone: '+91 98160 45678',
    contact_email: 'arjun.himalayas@tripplanner.com',
    contact_whatsapp: '+91 98160 45678',
    is_published: true,
    admin_status: 'approved',
    featured: false,
    views_count: 145,
    created_at: new Date().toISOString(),
    planner_name: 'Arjun Rawat',
    planner_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    planner_location: 'New Delhi / Manali',
    planner_languages: 'Hindi, English, Punjabi',
    planner_rating: 4.92,
    planner_reviews_count: 29,
    planner_verified: true
  },
  {
    id: 5,
    planner_id: 4,
    title: 'Royal Golden Sands: Jaipur to Jaisalmer Desert Caravan',
    origin: 'Jaipur',
    destination: 'Jaisalmer',
    destination_aliases: 'Thar Desert, Sam Sand Dunes, Jodhpur',
    duration: '5 Days / 4 Nights',
    travel_dates: 'Departs 1st & 3rd Friday of every month',
    price_type: 'range',
    price_display: '₹15,000 - ₹19,500',
    price_min: 15000,
    price_max: 19500,
    itinerary: `Day 1: Pick up in Jaipur. Heritage walk in Pink City and Hawa Mahal. Board overnight AC train/sleeper to Jaisalmer.
Day 2: Arrive in Golden City. Check in, visit Jaisalmer Living Fort, Patwon Ki Haveli, and Gadisar Lake.
Day 3: Transfer to Sam Sand Dunes. Camel safari at sunset, Kalbelia folk dance, and campfire under starlit desert sky.
Day 4: Visit Kuldhara abandoned ghost village and Tanot Mata border temple. Return to Jodhpur / Jaipur.
Day 5: Concluding tour with Mehrangarh fort and departure.`,
    included_services: 'Luxury Swiss Desert Tents, Rajasthani buffet dinners & breakfast, Camel safari & jeep dune bashing, All monument entry assistance',
    languages: 'Hindi, Rajasthani, English',
    contact_phone: '+91 94140 56789',
    contact_email: 'vikram.rajasthan@tripplanner.com',
    contact_whatsapp: '+91 94140 56789',
    is_published: true,
    admin_status: 'approved',
    featured: false,
    views_count: 98,
    created_at: new Date().toISOString(),
    planner_name: 'Vikram Singh',
    planner_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    planner_location: 'Jaipur, Rajasthan',
    planner_languages: 'Hindi, Rajasthani, English',
    planner_rating: 4.70,
    planner_reviews_count: 11,
    planner_verified: false
  }
];

const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 1,
    planner_id: 1,
    plan_id: 'pro',
    plan_name: 'Pro Planner',
    price: 999.00,
    billing_period: 'monthly',
    status: 'active',
    benefits: 'Unlimited Trip Cards, Priority Search Placement, Verified Badge, Direct WhatsApp Leads',
    payment_method: 'simulated_card_4242',
    transaction_id: 'tx_demo_01',
    started_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 25 * 86400000).toISOString(),
    auto_renew: true,
    planner_name: 'Ramesh Varma',
    planner_email: 'ramesh.planner@tripplanner.com'
  },
  {
    id: 2,
    planner_id: 2,
    plan_id: 'pro',
    plan_name: 'Pro Planner',
    price: 999.00,
    billing_period: 'monthly',
    status: 'active',
    benefits: 'Unlimited Trip Cards, Priority Search Placement, Verified Badge, Direct WhatsApp Leads',
    payment_method: 'simulated_card_4242',
    transaction_id: 'tx_demo_02',
    started_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    expires_at: new Date(Date.now() + 18 * 86400000).toISOString(),
    auto_renew: true,
    planner_name: 'Priya Menon',
    planner_email: 'priya.kerala@tripplanner.com'
  },
  {
    id: 3,
    planner_id: 3,
    plan_id: 'free',
    plan_name: 'Starter Planner',
    price: 0.00,
    billing_period: 'monthly',
    status: 'active',
    benefits: 'Up to 2 Trip Cards, Standard Directory Listing',
    payment_method: 'free_tier',
    transaction_id: 'tx_free_03',
    started_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 86400000).toISOString(),
    auto_renew: true,
    planner_name: 'Arjun Rawat',
    planner_email: 'arjun.himalayas@tripplanner.com'
  }
];

const INITIAL_INQUIRIES: ContactInquiry[] = [
  {
    id: 1,
    trip_card_id: 1,
    planner_id: 1,
    traveler_id: 6,
    traveler_name: 'Ananya Sharma',
    traveler_email: 'traveler@example.com',
    traveler_phone: '+91 98765 43210',
    travel_date: '2026-11-15',
    group_size: 4,
    message: 'We are 4 family members including senior citizens travelling from Visakhapatnam to Varanasi for Kashi Vishwanath darshan and Ganga Aarti. Looking for AC cab and darshan coordinator.',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    trip_title: 'Divine Kasi & Prayagraj Yatra from Visakhapatnam'
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    planner_id: 1,
    reviewer_name: 'Satyanarayana Rao (Vizag)',
    rating: 5,
    comment: 'Ramesh garu organized our family trip from Vizag to Kasi and Prayagraj flawlessly! Elderly parents had zero hassle during Kashi Vishwanath darshan. Top tier planner!',
    created_at: '2026-09-15'
  },
  {
    id: 2,
    planner_id: 1,
    reviewer_name: 'Venkatesh K.',
    rating: 5,
    comment: 'Best Telugu planner for Varanasi. The Ganga boat aarti arrangement was breathtaking.',
    created_at: '2026-10-02'
  },
  {
    id: 3,
    planner_id: 2,
    reviewer_name: 'Anoop Krishnan',
    rating: 5,
    comment: 'Priya planned our Munnar honeymoon trip smoothly. The Alleppey houseboat was clean, luxurious, and served authentic Karimeen fry!',
    created_at: '2026-08-20'
  }
];

// In-Memory Storage Instances (cloned deep copies)
const memoryUsers = [...INITIAL_USERS.map(u => ({ ...u }))];
const memoryProfiles = [...INITIAL_PROFILES.map(p => ({ ...p }))];
const memoryTripCards = [...INITIAL_TRIP_CARDS.map(t => ({ ...t }))];
const memorySubscriptions = [...INITIAL_SUBSCRIPTIONS.map(s => ({ ...s }))];
const memoryInquiries = [...INITIAL_INQUIRIES.map(i => ({ ...i }))];
const memoryReviews = [...INITIAL_REVIEWS.map(r => ({ ...r }))];

// Initialize MySQL pool and schema execution
export async function initDb(): Promise<void> {
  const host = process.env.MYSQL_HOST || 'localhost';
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'tourist';
  const port = Number(process.env.MYSQL_PORT) || 3306;

  try {
    const tempPool = mysql.createPool({
      host,
      port,
      user,
      password,
      waitForConnections: true,
      connectionLimit: 5
    });

    // Test ping
    const connection = await tempPool.getConnection();
    await connection.ping();
    connection.release();

    pool = tempPool;
    isMySqlConnected = true;
    console.log(`[DB] Connected to MySQL server at ${host}:${port}`);

    // Read and execute init.sql
    const sqlPath = path.join(__dirname, '..', 'db', 'init.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      const statements = sqlContent
        .split(/;\s*[\r\n]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const stmt of statements) {
        try {
          await pool.query(stmt);
        } catch (stmtErr: any) {
          // Ignore table exists or duplicate warnings
        }
      }
      console.log('[DB] MySQL schema & seed verification completed.');
    }
  } catch (err: any) {
    isMySqlConnected = false;
    pool = null;
    console.warn(
      `[DB] Notice: MySQL direct connection not active (${err.message}). ` +
      `Seamlessly utilizing the in-memory repository engine with all initial seed data and full functionality.`
    );
  }
}

export function isUsingMySql(): boolean {
  return isMySqlConnected && pool !== null;
}

// Synonyms helper (e.g. Kasi <=> Varanasi <=> Banaras)
export function expandCitySynonyms(query: string): string[] {
  const q = query.trim().toLowerCase();
  const synonymsMap: Record<string, string[]> = {
    'kasi': ['kasi', 'varanasi', 'banaras', 'kashi', 'benares'],
    'varanasi': ['kasi', 'varanasi', 'banaras', 'kashi', 'benares'],
    'banaras': ['kasi', 'varanasi', 'banaras', 'kashi', 'benares'],
    'kashi': ['kasi', 'varanasi', 'banaras', 'kashi', 'benares'],
    'visakhapatnam': ['visakhapatnam', 'vizag', 'waltair'],
    'vizag': ['visakhapatnam', 'vizag', 'waltair'],
    'cochin': ['cochin', 'kochi', 'ernakulam'],
    'kochi': ['cochin', 'kochi', 'ernakulam'],
    'alleppey': ['alleppey', 'alappuzha'],
    'alappuzha': ['alleppey', 'alappuzha'],
    'delhi': ['delhi', 'new delhi', 'ncr']
  };

  if (synonymsMap[q]) {
    return synonymsMap[q];
  }
  return [q];
}

// ==========================================
// UNIFIED DATA REPOSITORY
// ==========================================
export const db = {
  // USER OPERATIONS
  users: {
    async findByEmail(email: string): Promise<User | null> {
      const cleanEmail = email.trim().toLowerCase();
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
          const list = rows as User[];
          return list.length ? list[0] : null;
        } catch (e) {
          console.error('[DB users.findByEmail MySQL error]', e);
        }
      }
      const found = memoryUsers.find(u => u.email.toLowerCase() === cleanEmail);
      return found ? { ...found } : null;
    },

    async findById(id: number): Promise<User | null> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
          const list = rows as User[];
          return list.length ? list[0] : null;
        } catch (e) {
          console.error('[DB users.findById MySQL error]', e);
        }
      }
      const found = memoryUsers.find(u => u.id === id);
      return found ? { ...found } : null;
    },

    async create(data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
      if (isMySqlConnected && pool) {
        try {
          const [result]: any = await pool.query(
            'INSERT INTO users (email, password_hash, role, full_name, phone, avatar_url, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.email, data.password_hash, data.role, data.full_name, data.phone || null, data.avatar_url || null, data.status || 'active']
          );
          return { id: result.insertId, ...data };
        } catch (e) {
          console.error('[DB users.create MySQL error]', e);
        }
      }
      const newId = memoryUsers.length ? Math.max(...memoryUsers.map(u => u.id)) + 1 : 1;
      const newUser: User = {
        id: newId,
        ...data,
        created_at: new Date().toISOString()
      };
      memoryUsers.push(newUser);
      return { ...newUser };
    },

    async listAll(): Promise<User[]> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query('SELECT id, email, role, full_name, phone, avatar_url, status, created_at FROM users ORDER BY id DESC');
          return rows as User[];
        } catch (e) {
          console.error('[DB users.listAll MySQL error]', e);
        }
      }
      return memoryUsers.map(u => ({ ...u, password_hash: '' }));
    },

    async updateStatus(id: number, status: 'active' | 'suspended' | 'pending'): Promise<boolean> {
      if (isMySqlConnected && pool) {
        try {
          await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
          return true;
        } catch (e) {
          console.error('[DB users.updateStatus MySQL error]', e);
        }
      }
      const idx = memoryUsers.findIndex(u => u.id === id);
      if (idx !== -1) {
        memoryUsers[idx].status = status;
        return true;
      }
      return false;
    }
  },

  // PLANNER PROFILE OPERATIONS
  planners: {
    async findByUserId(userId: number): Promise<PlannerProfile | null> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query(
            `SELECT p.*, u.full_name, u.avatar_url, u.status as user_status 
             FROM planner_profiles p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.user_id = ?`,
            [userId]
          );
          const list = rows as PlannerProfile[];
          return list.length ? list[0] : null;
        } catch (e) {
          console.error('[DB planners.findByUserId MySQL error]', e);
        }
      }
      const found = memoryProfiles.find(p => p.user_id === userId);
      if (!found) return null;
      const user = memoryUsers.find(u => u.id === userId);
      return {
        ...found,
        full_name: user?.full_name || found.full_name,
        avatar_url: user?.avatar_url || found.avatar_url,
        user_status: user?.status || 'active'
      };
    },

    async findById(id: number): Promise<PlannerProfile | null> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query(
            `SELECT p.*, u.full_name, u.avatar_url, u.status as user_status 
             FROM planner_profiles p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.id = ?`,
            [id]
          );
          const list = rows as PlannerProfile[];
          return list.length ? list[0] : null;
        } catch (e) {
          console.error('[DB planners.findById MySQL error]', e);
        }
      }
      const found = memoryProfiles.find(p => p.id === id);
      if (!found) return null;
      const user = memoryUsers.find(u => u.id === found.user_id);
      return {
        ...found,
        full_name: user?.full_name || found.full_name,
        avatar_url: user?.avatar_url || found.avatar_url,
        user_status: user?.status || 'active'
      };
    },

    async create(data: Omit<PlannerProfile, 'id' | 'created_at' | 'updated_at'>): Promise<PlannerProfile> {
      if (isMySqlConnected && pool) {
        try {
          const [result]: any = await pool.query(
            `INSERT INTO planner_profiles 
             (user_id, bio, location, languages, experience_years, specialties, contact_method, contact_phone, contact_email, whatsapp_number, website, verified, rating, reviews_count, current_plan)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.user_id, data.bio, data.location, data.languages, data.experience_years,
              data.specialties || '', data.contact_method || 'phone', data.contact_phone,
              data.contact_email, data.whatsapp_number || null, data.website || null,
              data.verified ? 1 : 0, data.rating || 5.0, data.reviews_count || 0, data.current_plan || 'free'
            ]
          );
          return { id: result.insertId, ...data };
        } catch (e) {
          console.error('[DB planners.create MySQL error]', e);
        }
      }
      const newId = memoryProfiles.length ? Math.max(...memoryProfiles.map(p => p.id)) + 1 : 1;
      const newProfile: PlannerProfile = {
        id: newId,
        ...data,
        created_at: new Date().toISOString()
      };
      memoryProfiles.push(newProfile);
      return { ...newProfile };
    },

    async update(id: number, data: Partial<PlannerProfile>): Promise<PlannerProfile | null> {
      if (isMySqlConnected && pool) {
        try {
          const fields: string[] = [];
          const values: any[] = [];
          for (const [key, val] of Object.entries(data)) {
            if (['bio', 'location', 'languages', 'experience_years', 'specialties', 'contact_method', 'contact_phone', 'contact_email', 'whatsapp_number', 'website', 'current_plan'].includes(key)) {
              fields.push(`${key} = ?`);
              values.push(val);
            }
          }
          if (fields.length > 0) {
            values.push(id);
            await pool.query(`UPDATE planner_profiles SET ${fields.join(', ')} WHERE id = ?`, values);
          }
          return this.findById(id);
        } catch (e) {
          console.error('[DB planners.update MySQL error]', e);
        }
      }
      const idx = memoryProfiles.findIndex(p => p.id === id);
      if (idx !== -1) {
        memoryProfiles[idx] = { ...memoryProfiles[idx], ...data };
        return { ...memoryProfiles[idx] };
      }
      return null;
    },

    async listAll(): Promise<PlannerProfile[]> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query(
            `SELECT p.*, u.full_name, u.avatar_url, u.status as user_status 
             FROM planner_profiles p 
             JOIN users u ON p.user_id = u.id 
             ORDER BY p.id DESC`
          );
          return rows as PlannerProfile[];
        } catch (e) {
          console.error('[DB planners.listAll MySQL error]', e);
        }
      }
      return memoryProfiles.map(p => {
        const u = memoryUsers.find(user => user.id === p.user_id);
        return {
          ...p,
          full_name: u?.full_name || p.full_name,
          avatar_url: u?.avatar_url || p.avatar_url,
          user_status: u?.status || 'active'
        };
      });
    },

    async updateStatus(id: number, status: 'active' | 'suspended' | 'pending'): Promise<boolean> {
      const profile = await this.findById(id);
      if (!profile) return false;
      return db.users.updateStatus(profile.user_id, status);
    }
  },

  // TRIP CARDS OPERATIONS
  trips: {
    async search(params: {
      origin?: string;
      destination?: string;
      travel_date?: string;
      min_price?: number;
      max_price?: number;
      duration?: string;
      languages?: string;
    }): Promise<TripCard[]> {
      let cards = isMySqlConnected && pool
        ? await (async () => {
            try {
              const [rows] = await pool.query(
                `SELECT t.*, p.verified as planner_verified, p.rating as planner_rating, p.reviews_count as planner_reviews_count,
                        p.location as planner_location, p.languages as planner_languages,
                        u.full_name as planner_name, u.avatar_url as planner_avatar, u.status as user_status
                 FROM trip_cards t
                 JOIN planner_profiles p ON t.planner_id = p.id
                 JOIN users u ON p.user_id = u.id
                 WHERE t.is_published = TRUE AND t.admin_status = 'approved' AND u.status = 'active'`
              );
              return rows as TripCard[];
            } catch (e) {
              console.error('[DB trips.search MySQL error]', e);
              return memoryTripCards;
            }
          })()
        : memoryTripCards.filter(t => {
            const p = memoryProfiles.find(profile => profile.id === t.planner_id);
            const u = p ? memoryUsers.find(user => user.id === p.user_id) : null;
            return t.is_published && t.admin_status === 'approved' && u?.status === 'active';
          });

      // Filter by Origin
      if (params.origin && params.origin.trim().length > 0) {
        const origTokens = expandCitySynonyms(params.origin);
        cards = cards.filter(c => {
          const cOrig = c.origin.toLowerCase();
          return origTokens.some(tok => cOrig.includes(tok));
        });
      }

      // Filter by Destination (handling Kasi / Varanasi aliases & tokens)
      if (params.destination && params.destination.trim().length > 0) {
        const destTokens = expandCitySynonyms(params.destination);
        cards = cards.filter(c => {
          const cDest = c.destination.toLowerCase();
          const cAliases = (c.destination_aliases || '').toLowerCase();
          const cTitle = c.title.toLowerCase();
          return destTokens.some(tok => cDest.includes(tok) || cAliases.includes(tok) || cTitle.includes(tok));
        });
      }

      // Filter by Price range
      if (params.min_price !== undefined && !isNaN(params.min_price)) {
        cards = cards.filter(c => (c.price_min || 0) >= (params.min_price || 0));
      }
      if (params.max_price !== undefined && !isNaN(params.max_price) && params.max_price > 0) {
        cards = cards.filter(c => (c.price_min || 0) <= (params.max_price || 0));
      }

      // Filter by Language
      if (params.languages && params.languages.trim().length > 0) {
        const langQuery = params.languages.trim().toLowerCase();
        cards = cards.filter(c => (c.languages || '').toLowerCase().includes(langQuery) || (c.planner_languages || '').toLowerCase().includes(langQuery));
      }

      // Sort: Featured first, then rating descending
      return cards.sort((a, b) => {
        if (a.featured !== b.featured) return a.featured ? -1 : 1;
        return (b.planner_rating || 0) - (a.planner_rating || 0);
      });
    },

    async findById(id: number): Promise<TripCard | null> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query(
            `SELECT t.*, p.verified as planner_verified, p.rating as planner_rating, p.reviews_count as planner_reviews_count,
                    p.location as planner_location, p.languages as planner_languages, p.bio as planner_bio,
                    u.full_name as planner_name, u.avatar_url as planner_avatar, u.status as user_status
             FROM trip_cards t
             JOIN planner_profiles p ON t.planner_id = p.id
             JOIN users u ON p.user_id = u.id
             WHERE t.id = ?`,
            [id]
          );
          const list = rows as TripCard[];
          return list.length ? list[0] : null;
        } catch (e) {
          console.error('[DB trips.findById MySQL error]', e);
        }
      }
      const found = memoryTripCards.find(t => t.id === id);
      return found ? { ...found } : null;
    },

    async findByPlannerId(plannerId: number): Promise<TripCard[]> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query('SELECT * FROM trip_cards WHERE planner_id = ? ORDER BY id DESC', [plannerId]);
          return rows as TripCard[];
        } catch (e) {
          console.error('[DB trips.findByPlannerId MySQL error]', e);
        }
      }
      return memoryTripCards.filter(t => t.planner_id === plannerId).map(t => ({ ...t }));
    },

    async create(data: Omit<TripCard, 'id' | 'views_count' | 'created_at' | 'updated_at'>): Promise<TripCard> {
      if (isMySqlConnected && pool) {
        try {
          const [result]: any = await pool.query(
            `INSERT INTO trip_cards 
             (planner_id, title, origin, destination, destination_aliases, duration, travel_dates, price_type, price_display, price_min, price_max, itinerary, included_services, languages, contact_phone, contact_email, contact_whatsapp, is_published, admin_status, featured)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.planner_id, data.title, data.origin, data.destination, data.destination_aliases || '',
              data.duration, data.travel_dates || 'Flexible departures', data.price_type || 'fixed',
              data.price_display, data.price_min || 0, data.price_max || 0, data.itinerary,
              data.included_services || '', data.languages || 'English', data.contact_phone || '',
              data.contact_email || '', data.contact_whatsapp || '', data.is_published ? 1 : 0,
              data.admin_status || 'approved', data.featured ? 1 : 0
            ]
          );
          return { id: result.insertId, views_count: 0, ...data };
        } catch (e) {
          console.error('[DB trips.create MySQL error]', e);
        }
      }
      const newId = memoryTripCards.length ? Math.max(...memoryTripCards.map(t => t.id)) + 1 : 1;
      const planner = memoryProfiles.find(p => p.id === data.planner_id);
      const newCard: TripCard = {
        id: newId,
        views_count: 0,
        ...data,
        planner_name: planner?.full_name,
        planner_avatar: planner?.avatar_url,
        planner_location: planner?.location,
        planner_languages: planner?.languages,
        planner_rating: planner?.rating || 5.0,
        planner_reviews_count: planner?.reviews_count || 0,
        planner_verified: planner?.verified || false,
        created_at: new Date().toISOString()
      };
      memoryTripCards.push(newCard);
      return { ...newCard };
    },

    async update(id: number, plannerId: number, data: Partial<TripCard>): Promise<TripCard | null> {
      if (isMySqlConnected && pool) {
        try {
          const allowedFields = ['title', 'origin', 'destination', 'destination_aliases', 'duration', 'travel_dates', 'price_type', 'price_display', 'price_min', 'price_max', 'itinerary', 'included_services', 'languages', 'contact_phone', 'contact_email', 'contact_whatsapp', 'is_published'];
          const fields: string[] = [];
          const values: any[] = [];
          for (const [key, val] of Object.entries(data)) {
            if (allowedFields.includes(key)) {
              fields.push(`${key} = ?`);
              values.push(val);
            }
          }
          if (fields.length > 0) {
            values.push(id, plannerId);
            await pool.query(`UPDATE trip_cards SET ${fields.join(', ')} WHERE id = ? AND planner_id = ?`, values);
          }
          return this.findById(id);
        } catch (e) {
          console.error('[DB trips.update MySQL error]', e);
        }
      }
      const idx = memoryTripCards.findIndex(t => t.id === id && t.planner_id === plannerId);
      if (idx !== -1) {
        memoryTripCards[idx] = { ...memoryTripCards[idx], ...data, updated_at: new Date().toISOString() };
        return { ...memoryTripCards[idx] };
      }
      return null;
    },

    async delete(id: number, plannerId?: number): Promise<boolean> {
      if (isMySqlConnected && pool) {
        try {
          if (plannerId) {
            const [res]: any = await pool.query('DELETE FROM trip_cards WHERE id = ? AND planner_id = ?', [id, plannerId]);
            return res.affectedRows > 0;
          } else {
            const [res]: any = await pool.query('DELETE FROM trip_cards WHERE id = ?', [id]);
            return res.affectedRows > 0;
          }
        } catch (e) {
          console.error('[DB trips.delete MySQL error]', e);
        }
      }
      const idx = memoryTripCards.findIndex(t => t.id === id && (plannerId === undefined || t.planner_id === plannerId));
      if (idx !== -1) {
        memoryTripCards.splice(idx, 1);
        return true;
      }
      return false;
    },

    async togglePublish(id: number, plannerId: number): Promise<TripCard | null> {
      const card = await this.findById(id);
      if (!card || card.planner_id !== plannerId) return null;
      return this.update(id, plannerId, { is_published: !card.is_published });
    },

    async listAllForAdmin(): Promise<TripCard[]> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query(
            `SELECT t.*, u.full_name as planner_name, u.email as planner_email, p.location as planner_location 
             FROM trip_cards t 
             JOIN planner_profiles p ON t.planner_id = p.id 
             JOIN users u ON p.user_id = u.id 
             ORDER BY t.id DESC`
          );
          return rows as TripCard[];
        } catch (e) {
          console.error('[DB trips.listAllForAdmin MySQL error]', e);
        }
      }
      return memoryTripCards.map(t => {
        const p = memoryProfiles.find(profile => profile.id === t.planner_id);
        const u = p ? memoryUsers.find(user => user.id === p.user_id) : null;
        return {
          ...t,
          planner_name: u?.full_name || t.planner_name,
          planner_email: u?.email,
          planner_location: p?.location || t.planner_location
        };
      });
    },

    async updateAdminStatus(id: number, status: 'approved' | 'pending' | 'flagged'): Promise<boolean> {
      if (isMySqlConnected && pool) {
        try {
          await pool.query('UPDATE trip_cards SET admin_status = ? WHERE id = ?', [status, id]);
          return true;
        } catch (e) {
          console.error('[DB trips.updateAdminStatus MySQL error]', e);
        }
      }
      const idx = memoryTripCards.findIndex(t => t.id === id);
      if (idx !== -1) {
        memoryTripCards[idx].admin_status = status;
        return true;
      }
      return false;
    }
  },

  // SUBSCRIPTION OPERATIONS
  subscriptions: {
    async findByPlannerId(plannerId: number): Promise<Subscription | null> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query('SELECT * FROM subscriptions WHERE planner_id = ? ORDER BY id DESC LIMIT 1', [plannerId]);
          const list = rows as Subscription[];
          return list.length ? list[0] : null;
        } catch (e) {
          console.error('[DB subscriptions.findByPlannerId MySQL error]', e);
        }
      }
      const found = memorySubscriptions.filter(s => s.planner_id === plannerId).sort((a, b) => b.id - a.id)[0];
      return found ? { ...found } : null;
    },

    async createOrUpdate(data: Omit<Subscription, 'id'>): Promise<Subscription> {
      if (isMySqlConnected && pool) {
        try {
          const [result]: any = await pool.query(
            `INSERT INTO subscriptions (planner_id, plan_id, plan_name, price, billing_period, status, benefits, payment_method, transaction_id, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.planner_id, data.plan_id, data.plan_name, data.price, data.billing_period,
              data.status, data.benefits, data.payment_method, data.transaction_id || null, data.expires_at
            ]
          );
          // Also update current_plan in planner_profiles
          await pool.query('UPDATE planner_profiles SET current_plan = ? WHERE id = ?', [data.plan_id, data.planner_id]);
          return { id: result.insertId, ...data };
        } catch (e) {
          console.error('[DB subscriptions.createOrUpdate MySQL error]', e);
        }
      }
      const newId = memorySubscriptions.length ? Math.max(...memorySubscriptions.map(s => s.id)) + 1 : 1;
      const sub: Subscription = { id: newId, ...data };
      memorySubscriptions.push(sub);
      // Update planner profile current_plan
      const pIdx = memoryProfiles.findIndex(p => p.id === data.planner_id);
      if (pIdx !== -1) {
        memoryProfiles[pIdx].current_plan = data.plan_id;
      }
      return { ...sub };
    },

    async listAll(): Promise<Subscription[]> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query(
            `SELECT s.*, u.full_name as planner_name, u.email as planner_email 
             FROM subscriptions s 
             JOIN planner_profiles p ON s.planner_id = p.id 
             JOIN users u ON p.user_id = u.id 
             ORDER BY s.id DESC`
          );
          return rows as Subscription[];
        } catch (e) {
          console.error('[DB subscriptions.listAll MySQL error]', e);
        }
      }
      return memorySubscriptions.map(s => {
        const p = memoryProfiles.find(profile => profile.id === s.planner_id);
        const u = p ? memoryUsers.find(user => user.id === p.user_id) : null;
        return {
          ...s,
          planner_name: u?.full_name || s.planner_name,
          planner_email: u?.email || s.planner_email
        };
      });
    }
  },

  // CONTACT INQUIRIES
  inquiries: {
    async create(data: Omit<ContactInquiry, 'id' | 'created_at'>): Promise<ContactInquiry> {
      if (isMySqlConnected && pool) {
        try {
          const [result]: any = await pool.query(
            `INSERT INTO contact_inquiries (trip_card_id, planner_id, traveler_id, traveler_name, traveler_email, traveler_phone, travel_date, group_size, message)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.trip_card_id, data.planner_id, data.traveler_id || null, data.traveler_name,
              data.traveler_email, data.traveler_phone, data.travel_date || null, data.group_size || 1, data.message
            ]
          );
          return { id: result.insertId, created_at: new Date().toISOString(), ...data };
        } catch (e) {
          console.error('[DB inquiries.create MySQL error]', e);
        }
      }
      const newId = memoryInquiries.length ? Math.max(...memoryInquiries.map(i => i.id)) + 1 : 1;
      const item: ContactInquiry = {
        id: newId,
        created_at: new Date().toISOString(),
        ...data
      };
      memoryInquiries.push(item);
      return { ...item };
    },

    async findByPlannerId(plannerId: number): Promise<ContactInquiry[]> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query(
            `SELECT i.*, t.title as trip_title 
             FROM contact_inquiries i 
             JOIN trip_cards t ON i.trip_card_id = t.id 
             WHERE i.planner_id = ? 
             ORDER BY i.id DESC`,
            [plannerId]
          );
          return rows as ContactInquiry[];
        } catch (e) {
          console.error('[DB inquiries.findByPlannerId MySQL error]', e);
        }
      }
      return memoryInquiries.filter(i => i.planner_id === plannerId).map(i => {
        const trip = memoryTripCards.find(t => t.id === i.trip_card_id);
        return { ...i, trip_title: trip?.title };
      });
    }
  },

  // REVIEWS
  reviews: {
    async findByPlannerId(plannerId: number): Promise<Review[]> {
      if (isMySqlConnected && pool) {
        try {
          const [rows] = await pool.query('SELECT * FROM reviews WHERE planner_id = ? ORDER BY id DESC', [plannerId]);
          return rows as Review[];
        } catch (e) {
          console.error('[DB reviews.findByPlannerId MySQL error]', e);
        }
      }
      return memoryReviews.filter(r => r.planner_id === plannerId);
    }
  }
};
