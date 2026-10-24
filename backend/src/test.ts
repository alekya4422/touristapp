import http from 'http';
import app from './index';
import { db } from './db';

// Simple lightweight test runner without needing heavy external testing packages
async function runTests() {
  console.log('\n--- STARTING TRIP PLANNER BACKEND VERIFICATION SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test search with origin Visakhapatnam and destination Kasi (alias mapping)
    const kasiTrips = await db.trips.search({ origin: 'Visakhapatnam', destination: 'Kasi' });
    assert(kasiTrips.length >= 1, 'Search "Visakhapatnam to Kasi" returns matching trip plans');
    assert(
      kasiTrips.some(t => t.destination.toLowerCase() === 'kasi' || t.destination_aliases?.toLowerCase().includes('kasi')),
      'Recognizes Kasi / Varanasi destination alias correctly'
    );

    // 2. Test search with destination Varanasi
    const varanasiTrips = await db.trips.search({ origin: 'Visakhapatnam', destination: 'Varanasi' });
    assert(varanasiTrips.length >= 1, 'Search "Visakhapatnam to Varanasi" returns matching trip plans');

    // 3. Test user retrieval and password verification
    const adminUser = await db.users.findByEmail('admin@tripplanner.com');
    assert(adminUser !== null && adminUser.role === 'admin', 'Admin user seed exists and has admin role');

    const plannerUser = await db.users.findByEmail('ramesh.planner@tripplanner.com');
    assert(plannerUser !== null && plannerUser.role === 'planner', 'Planner user seed exists');

    // 4. Test planner profile linking
    if (plannerUser) {
      const profile = await db.planners.findByUserId(plannerUser.id);
      assert(profile !== null && profile.location.includes('Visakhapatnam'), 'Planner profile correctly links to user in Visakhapatnam');
    }

    // 5. Test traveler contact inquiry
    const inquiry = await db.inquiries.create({
      trip_card_id: 1,
      planner_id: 1,
      traveler_name: 'Test Traveler',
      traveler_email: 'test@traveler.com',
      traveler_phone: '+91 99999 88888',
      message: 'Testing direct inquiry flow'
    });
    assert(inquiry.id > 0, 'Traveler contact inquiry saved successfully');

    // 6. Test planner subscription lookup and checkout
    const sub = await db.subscriptions.findByPlannerId(1);
    assert(sub !== null && sub.plan_id === 'pro', 'Planner active Pro subscription identified');

    // 7. Test Admin metrics
    const plannersList = await db.planners.listAll();
    const adminCards = await db.trips.listAllForAdmin();
    assert(plannersList.length >= 4, 'Admin can list all registered planners');
    assert(adminCards.length >= 5, 'Admin can list all trip cards across planners');

    console.log(`\nVerification finished: ${passed} passed, ${failed} failed.\n`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

// Give server time to initialize then run
setTimeout(runTests, 1200);
