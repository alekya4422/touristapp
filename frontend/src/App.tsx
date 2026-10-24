import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeTraveler } from './pages/HomeTraveler';
import { PlannerDashboard } from './pages/PlannerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Shield, Compass, Sparkles, Heart } from 'lucide-react';
import '../../common-css/styles.css';

function MainApp() {
  const { user, quickLoginAs } = useAuth();
  const [currentView, setCurrentView] = useState<'traveler' | 'planner' | 'admin'>('traveler');
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar with Role Switcher */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={(mode) => setAuthModal({ isOpen: true, mode })}
      />

      {/* Main View Display */}
      <div style={{ flex: 1 }}>
        {currentView === 'traveler' && <HomeTraveler />}

        {currentView === 'planner' && (
          user?.role === 'planner' ? (
            <PlannerDashboard />
          ) : (
            <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <div className="state-box">
                <div className="state-icon" style={{ background: '#ccfbf1', color: '#0f766e' }}>
                  <Compass size={28} />
                </div>
                <h3 className="state-title">Trip Planner Portal</h3>
                <p className="state-desc">
                  This portal is reserved for registered travel planners to manage itineraries, pricing, and traveler leads.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    className="btn-primary"
                    onClick={() => quickLoginAs('planner')}
                  >
                    <Sparkles size={16} /> Demo: Switch to Ramesh (Planner)
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setAuthModal({ isOpen: true, mode: 'register' })}
                  >
                    Register as Planner
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {currentView === 'admin' && (
          user?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="main-content" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
              <div className="state-box">
                <div className="state-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
                  <Shield size={28} />
                </div>
                <h3 className="state-title">Protected Admin Area</h3>
                <p className="state-desc">
                  You must be logged in with administrative privileges to view platform metrics, moderate trip cards, and manage planner accounts.
                </p>
                <button
                  className="btn-primary"
                  onClick={() => quickLoginAs('admin')}
                >
                  <Shield size={16} /> Demo: Login as Superadmin
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Global Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '2.5rem 1.5rem 2rem', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              <Compass size={22} color="#14b8a6" /> TripPlanner Marketplace
            </div>
            <p style={{ fontSize: '0.86rem', lineHeight: 1.6 }}>
              Connecting travelers with verified local trip planners across India. Specialized in spiritual yatra routes like Visakhapatnam to Kasi (Varanasi), Kerala backwaters, Himalayan tours, and Rajasthan desert safaris.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Quick Demo Accounts</h4>
            <div style={{ fontSize: '0.82rem', lineHeight: 1.8 }}>
              <div><strong>Admin:</strong> admin@tripplanner.com / Admin@123</div>
              <div><strong>Planner (Vizag/Kasi):</strong> ramesh.planner@tripplanner.com / Planner@123</div>
              <div><strong>Planner (Kerala):</strong> priya.kerala@tripplanner.com / Planner@123</div>
              <div><strong>Traveler:</strong> traveler@example.com / Traveler@123</div>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '0.75rem' }}>Platform Features</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.84rem', lineHeight: 1.8 }}>
              <li>✓ Smart Origin & Destination Route Search with City Aliases</li>
              <li>✓ Direct Phone / WhatsApp Lead Connection</li>
              <li>✓ Planner Card Manager & Publishing Controls</li>
              <li>✓ Subscription Tier Management with Safe Test Checkout</li>
              <li>✓ Protected Admin Moderation Dashboard</li>
            </ul>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
          <div>
            © {new Date().getFullYear()} TripPlanner Marketplace. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ color: '#14b8a6' }}>React + Express + MySQL Dual Engine</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {authModal.isOpen && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
