-- =========================================================
-- Trip Planner Marketplace Schema & Seed Data
-- =========================================================

CREATE DATABASE IF NOT EXISTS tourist;
USE tourist;

-- Drop old deprecated tables if existing from earlier prototype
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS services;

-- 1. Users table (Admins, Planners, Travelers)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('traveler', 'planner', 'admin') NOT NULL DEFAULT 'traveler',
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  status ENUM('active', 'pending', 'suspended') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Planner Profiles
CREATE TABLE IF NOT EXISTS planner_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  bio TEXT,
  location VARCHAR(255) NOT NULL,
  languages VARCHAR(255) NOT NULL DEFAULT 'English',
  experience_years INT NOT NULL DEFAULT 1,
  specialties VARCHAR(255) DEFAULT '',
  contact_method VARCHAR(50) DEFAULT 'phone',
  contact_phone VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(50) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  reviews_count INT NOT NULL DEFAULT 0,
  current_plan VARCHAR(50) NOT NULL DEFAULT 'free',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Trip-plan Cards
CREATE TABLE IF NOT EXISTS trip_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  planner_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  origin VARCHAR(150) NOT NULL,
  destination VARCHAR(150) NOT NULL,
  destination_aliases VARCHAR(255) DEFAULT '',
  duration VARCHAR(100) NOT NULL,
  travel_dates VARCHAR(255) DEFAULT 'Weekly departures',
  price_type ENUM('fixed', 'range', 'custom') NOT NULL DEFAULT 'fixed',
  price_display VARCHAR(100) NOT NULL,
  price_min DECIMAL(10,2) DEFAULT 0,
  price_max DECIMAL(10,2) DEFAULT 0,
  itinerary MEDIUMTEXT NOT NULL,
  included_services TEXT,
  languages VARCHAR(255) DEFAULT 'English',
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  contact_whatsapp VARCHAR(50),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  admin_status ENUM('approved', 'pending', 'flagged') NOT NULL DEFAULT 'approved',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (planner_id) REFERENCES planner_profiles(id) ON DELETE CASCADE
);

-- 4. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  planner_id INT NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  billing_period ENUM('monthly', 'yearly') NOT NULL DEFAULT 'monthly',
  status ENUM('active', 'cancelled', 'expired') NOT NULL DEFAULT 'active',
  benefits TEXT,
  payment_method VARCHAR(100) DEFAULT 'test_simulated_payment',
  transaction_id VARCHAR(100) DEFAULT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  FOREIGN KEY (planner_id) REFERENCES planner_profiles(id) ON DELETE CASCADE
);

-- 5. Contact Inquiries (Traveler contacting Planner)
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_card_id INT NOT NULL,
  planner_id INT NOT NULL,
  traveler_id INT NULL,
  traveler_name VARCHAR(255) NOT NULL,
  traveler_email VARCHAR(255) NOT NULL,
  traveler_phone VARCHAR(50) NOT NULL,
  travel_date VARCHAR(100) DEFAULT NULL,
  group_size INT DEFAULT 1,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_card_id) REFERENCES trip_cards(id) ON DELETE CASCADE,
  FOREIGN KEY (planner_id) REFERENCES planner_profiles(id) ON DELETE CASCADE
);

-- 6. Planner Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  planner_id INT NOT NULL,
  reviewer_name VARCHAR(255) NOT NULL,
  rating INT NOT NULL DEFAULT 5,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (planner_id) REFERENCES planner_profiles(id) ON DELETE CASCADE
);

-- =========================================================
-- SEED DATA
-- Passwords:
-- Admin@123   -> $2a$10$r/rVVmdOSR6/LLHBLHB85.ciQV7mVohBQzURqAcJcKBKr2QQhDzqm
-- Planner@123 -> $2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge
-- Traveler@123-> $2a$10$u625UFZNpV21uwnrUIhUwOWAi8YNzlZgylmVX18CpEUMq1QePMSIK
-- =========================================================

-- Insert Users
INSERT INTO users (id, email, password_hash, role, full_name, phone, avatar_url, status)
VALUES 
(1, 'admin@tripplanner.com', '$2a$10$r/rVVmdOSR6/LLHBLHB85.ciQV7mVohBQzURqAcJcKBKr2QQhDzqm', 'admin', 'Super Administrator', '+91 98480 11111', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', 'active'),
(2, 'ramesh.planner@tripplanner.com', '$2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge', 'planner', 'Ramesh Varma', '+91 89190 23456', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', 'active'),
(3, 'priya.kerala@tripplanner.com', '$2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge', 'planner', 'Priya Menon', '+91 94470 34567', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80', 'active'),
(4, 'arjun.himalayas@tripplanner.com', '$2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge', 'planner', 'Arjun Rawat', '+91 98160 45678', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', 'active'),
(5, 'vikram.rajasthan@tripplanner.com', '$2a$10$UQ6t32Acp0dPrHIR/7APZ.qWGNtX7hK1qyl.vxGZmNVjhbCvhj/ge', 'planner', 'Vikram Singh', '+91 94140 56789', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', 'pending'),
(6, 'traveler@example.com', '$2a$10$u625UFZNpV21uwnrUIhUwOWAi8YNzlZgylmVX18CpEUMq1QePMSIK', 'traveler', 'Ananya Sharma', '+91 98765 43210', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', 'active')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Insert Planner Profiles
INSERT INTO planner_profiles (id, user_id, bio, location, languages, experience_years, specialties, contact_method, contact_phone, contact_email, whatsapp_number, verified, rating, reviews_count, current_plan)
VALUES
(1, 2, 'Certified pilgrimage and heritage travel specialist with 12+ years of guiding families and spiritual seekers across Varanasi (Kasi), Prayagraj, Ayodhya, and Andhra heritage circuits. Known for authentic local experiences and VIP darshan arrangements.', 'Visakhapatnam, Andhra Pradesh', 'Telugu, Hindi, English', 12, 'Spiritual Tours, Heritage, North India Pilgrimages', 'phone', '+91 89190 23456', 'ramesh.planner@tripplanner.com', '+91 89190 23456', TRUE, 4.95, 48, 'pro'),
(2, 3, 'South India ecotourism and bespoke luxury planner. From private houseboats in Alleppey to tea trail walks in Munnar and temple architecture in Madurai.', 'Kochi, Kerala', 'Malayalam, English, Hindi, Tamil', 8, 'Backwaters, Tea Plantations, Wellness & Ayurveda', 'phone', '+91 94470 34567', 'priya.kerala@tripplanner.com', '+91 94470 34567', TRUE, 4.88, 36, 'pro'),
(3, 4, 'High-altitude expedition leader and Himachal/Ladakh cultural planner. Handling mountain passes, monasteries, camping, and self-drive convoys.', 'New Delhi / Manali', 'Hindi, English, Punjabi', 9, 'Himalayan Treks, Spiti Roadtrips, Ladakh Safaris', 'phone', '+91 98160 45678', 'arjun.himalayas@tripplanner.com', '+91 98160 45678', TRUE, 4.92, 29, 'free'),
(4, 5, 'Desert heritage storyteller crafting royal palace itineraries across Jaipur, Udaipur, and Jaisalmer sand dunes.', 'Jaipur, Rajasthan', 'Hindi, Rajasthani, English', 5, 'Desert Safaris, Palaces, Culinary Trails', 'phone', '+91 94140 56789', 'vikram.rajasthan@tripplanner.com', '+91 94140 56789', FALSE, 4.70, 11, 'free')
ON DUPLICATE KEY UPDATE bio=VALUES(bio);

-- Insert Trip Cards (including Visakhapatnam to Kasi / Varanasi highlights)
INSERT INTO trip_cards (id, planner_id, title, origin, destination, destination_aliases, duration, travel_dates, price_type, price_display, price_min, price_max, itinerary, included_services, languages, contact_phone, contact_email, is_published, admin_status, featured)
VALUES
(1, 1, 'Divine Kasi & Prayagraj Yatra from Visakhapatnam', 'Visakhapatnam', 'Kasi', 'Varanasi, Banaras, Kashi, Prayagraj', '5 Days / 4 Nights', 'Every Wednesday & Friday Departures (All Year)', 'fixed', '₹16,500 per person', 16500, 16500, 
'Day 1: Departure from Visakhapatnam (Train/Flight assistance). Evening arrival in Varanasi. Check-in at central heritage hotel. Sunset Ganga Aarti at Dashashwamedh Ghat from reserved boat.\nDay 2: Morning sacred bath, special VIP Kashi Vishwanath Darshan, Annapurna Devi, and Vishalakshi Temple. Afternoon local Banarasi weaver village visit.\nDay 3: Sunrise boat ride to Manikarnika Ghat. Day excursion to Sarnath (Dhamek Stupa & Archaeological Museum).\nDay 4: Day excursion to Prayagraj (Triveni Sangam holy dip and boat ride, Anand Bhavan). Return to Kasi for evening Bhajan session.\nDay 5: Kaal Bhairav and Sankat Mochan darshan, sweet shopping (Malaiyo & Banarasi Paan), return transit to Visakhapatnam.',
'3-Star Hotel AC Accommodation, Pure Veg Breakfast & Dinner, AC Cab for all local & Prayagraj transfers, Private Ganges Boating with Aarti, Special Darshan Coordinator (Telugu/Hindi speaking)',
'Telugu, Hindi, English', '+91 89190 23456', 'ramesh.planner@tripplanner.com', TRUE, 'approved', TRUE),

(2, 1, 'Visakhapatnam to Varanasi & Ayodhya Ram Janmabhoomi Express Tour', 'Visakhapatnam', 'Varanasi', 'Kasi, Kashi, Ayodhya, Banaras', '6 Days / 5 Nights', 'Weekly Departures: Mondays & Thursdays', 'range', '₹19,500 - ₹23,000', 19500, 23000,
'Day 1: Depart Vizag. Arrive in Varanasi, welcome drink, check-in, and private Assi Ghat Subah-e-Banaras briefing.\nDay 2: Kashi Vishwanath corridor darshan, Kal Bhairav, Durga Kund. Evening Ganga Aarti VIP seats.\nDay 3: Scenic highway drive to Ayodhya. Evening Sarayu river aarti and Ram Ki Paidi.\nDay 4: Early morning Shri Ram Janmabhoomi temple darshan, Hanuman Garhi, and Kanak Bhawan. Drive back to Varanasi.\nDay 5: Leisure day in Varanasi for silk saree shopping, street food walk (Kachori Gali), and Sarnath trip.\nDay 6: Drop at Varanasi Airport / Railway station for journey back to Visakhapatnam.',
'Deluxe Hotel Stays, AC Tempo Traveller / Innova throughout, All Temple Assistance, Breakfast & Traditional Dinner, Tour Manager from Visakhapatnam',
'Telugu, Hindi, English', '+91 89190 23456', 'ramesh.planner@tripplanner.com', TRUE, 'approved', TRUE),

(3, 2, 'Classic Kerala Backwaters & Munnar Mist Trail', 'Kochi', 'Munnar', 'Alleppey, Alappuzha, Fort Kochi', '5 Days / 4 Nights', 'Daily Departures available', 'range', '₹14,500 - ₹18,000', 14500, 18000,
'Day 1: Pick up at Cochin International Airport / Ernakulam Junction. Drive to Munnar through Cheeyappara waterfalls. Check into hill resort.\nDay 2: Eravikulam National Park (Nilgiri Tahr), Tea Museum, Mattupetty Dam, and Echo Point.\nDay 3: Scenic transfer to Alleppey. Board private deluxe houseboat. Cruise scenic palm-fringed backwaters.\nDay 4: Traditional Kerala breakfast on boat. Transfer to Fort Kochi: Chinese fishing nets, Jew Town, spice markets.\nDay 5: Morning Kathakali showcase, souvenir shopping, departure transfer.',
'Private AC Sedan with polite chauffeur, 2 Nights Munnar Hill Resort, 1 Night Private Houseboat with all 3 traditional Kerala meals, Spice plantation entry passes',
'Malayalam, English, Hindi', '+91 94470 34567', 'priya.kerala@tripplanner.com', TRUE, 'approved', TRUE),

(4, 3, 'Manali & Rohtang Pass Alpine Escape', 'Delhi', 'Manali', 'Kullu, Solang Valley, Rohtang, Atal Tunnel', '6 Days / 5 Nights', 'Departs every Saturday from Delhi', 'fixed', '₹13,999 per person', 13999, 13999,
'Day 1: Overnight Volvo semi-sleeper coach from Majnu Ka Tila, Delhi.\nDay 2: Morning arrival in Manali. Check into apple-orchard boutique stay. Afternoon Hadimba Temple and Old Manali cafes.\nDay 3: Thrilling drive through the engineering marvel Atal Tunnel to Sissu (Lahaul Valley). Snow activities at Solang Valley.\nDay 4: Excursion to Rohtang Pass (subject to weather/permit) with snow scooters and mountain photography.\nDay 5: Naggar Castle heritage visit, river rafting in Kullu river, and shopping at Mall Road. Evening overnight bus to Delhi.\nDay 6: Early morning arrival back in Delhi.',
'Volvo Tickets Delhi-Manali-Delhi, 3 Nights Hotel, Breakfast & Dinner, AC Cab for local sightseeing, Green permit handling',
'Hindi, English, Punjabi', '+91 98160 45678', 'arjun.himalayas@tripplanner.com', TRUE, 'approved', FALSE),

(5, 4, 'Royal Golden Sands: Jaipur to Jaisalmer Desert Caravan', 'Jaipur', 'Jaisalmer', 'Thar Desert, Sam Sand Dunes, Jodhpur', '5 Days / 4 Nights', 'Departs 1st & 3rd Friday of every month', 'range', '₹15,000 - ₹19,500', 15000, 19500,
'Day 1: Pick up in Jaipur. Heritage walk in Pink City and Hawa Mahal. Board overnight AC train/sleeper to Jaisalmer.\nDay 2: Arrive in Golden City. Check in, visit Jaisalmer Living Fort, Patwon Ki Haveli, and Gadisar Lake.\nDay 3: Transfer to Sam Sand Dunes. Camel safari at sunset, Kalbelia folk dance, and campfire under starlit desert sky.\nDay 4: Visit Kuldhara abandoned ghost village and Tanot Mata border temple. Return to Jodhpur / Jaipur.\nDay 5: Concluding tour with Mehrangarh fort and departure.',
'Luxury Swiss Desert Tents, Rajasthani buffet dinners & breakfast, Camel safari & jeep dune bashing, All monument entry assistance',
'Hindi, Rajasthani, English', '+91 94140 56789', 'vikram.rajasthan@tripplanner.com', TRUE, 'approved', FALSE)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Subscriptions Seed
INSERT INTO subscriptions (id, planner_id, plan_id, plan_name, price, billing_period, status, benefits, payment_method, expires_at)
VALUES
(1, 1, 'pro', 'Pro Planner', 999.00, 'monthly', 'active', 'Unlimited Trip Cards, Priority Search Placement, Verified Badge, Direct WhatsApp Leads', 'simulated_card_4242', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 25 DAY)),
(2, 2, 'pro', 'Pro Planner', 999.00, 'monthly', 'active', 'Unlimited Trip Cards, Priority Search Placement, Verified Badge, Direct WhatsApp Leads', 'simulated_card_4242', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 18 DAY)),
(3, 3, 'free', 'Starter Planner', 0.00, 'monthly', 'active', 'Up to 2 Trip Cards, Standard Directory Listing', 'free_tier', DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 365 DAY))
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Reviews Seed
INSERT INTO reviews (id, planner_id, reviewer_name, rating, comment)
VALUES
(1, 1, 'Satyanarayana Rao (Vizag)', 5, 'Ramesh garu organized our family trip from Vizag to Kasi and Prayagraj flawlessly! Elderly parents had zero hassle during Kashi Vishwanath darshan. Top tier planner!'),
(2, 1, 'Venkatesh K.', 5, 'Best Telugu planner for Varanasi. The Ganga boat aarti arrangement was breathtaking.'),
(3, 2, 'Anoop Krishnan', 5, 'Priya planned our Munnar honeymoon trip smoothly. The Alleppey houseboat was clean, luxurious, and served authentic Karimeen fry!')
ON DUPLICATE KEY UPDATE comment=VALUES(comment);
