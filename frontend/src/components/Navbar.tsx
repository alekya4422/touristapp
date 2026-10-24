import React from 'react';
import { Compass, Shield, Briefcase, LogIn, LogOut, UserPlus, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'traveler' | 'planner' | 'admin';
  setCurrentView: (view: 'traveler' | 'planner' | 'admin') => void;
  openAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, openAuthModal }) => {
  const { user, plannerProfile, logout, quickLoginAs } = useAuth();

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand */}
        <div className="brand-logo" onClick={() => setCurrentView('traveler')}>
          <div className="brand-icon-box">
            <Compass size={24} />
          </div>
          <div>
            <span className="brand-title">TripPlanner</span>
            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }}>
              MARKETPLACE
            </div>
          </div>
        </div>

        {/* View Switchers / Main Nav */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${currentView === 'traveler' ? 'active' : ''}`}
            onClick={() => setCurrentView('traveler')}
          >
            <Compass size={16} />
            Explore Trips
          </button>

          <button
            className={`nav-btn ${currentView === 'planner' ? 'active' : ''}`}
            onClick={() => {
              if (!user || user.role !== 'planner') {
                // If not logged in as planner, auto switch to demo planner for seamless testing
                quickLoginAs('planner');
              }
              setCurrentView('planner');
            }}
          >
            <Briefcase size={16} />
            Planner Portal
            {plannerProfile?.current_plan === 'pro' && (
              <span style={{ fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                PRO
              </span>
            )}
          </button>

          <button
            className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => {
              if (!user || user.role !== 'admin') {
                // If not logged in as admin, auto switch to demo admin for seamless testing
                quickLoginAs('admin');
              }
              setCurrentView('admin');
            }}
          >
            <Shield size={16} />
            Admin Portal
          </button>
        </nav>

        {/* Right Section: Quick Demo Switcher + User State */}
        <div className="header-auth">
          {/* Quick Demo Role Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Sparkles size={12} color="#0d9488" /> Demo:
            </span>
            <button
              onClick={() => { quickLoginAs('traveler'); setCurrentView('traveler'); }}
              title="Login as Traveler"
              style={{
                background: user?.role === 'traveler' ? '#0d9488' : '#fff',
                color: user?.role === 'traveler' ? '#fff' : '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.2rem 0.45rem',
                cursor: 'pointer'
              }}
            >
              Traveler
            </button>
            <button
              onClick={() => { quickLoginAs('planner'); setCurrentView('planner'); }}
              title="Login as Verified Planner (Ramesh Varma)"
              style={{
                background: user?.role === 'planner' ? '#0d9488' : '#fff',
                color: user?.role === 'planner' ? '#fff' : '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.2rem 0.45rem',
                cursor: 'pointer'
              }}
            >
              Planner
            </button>
            <button
              onClick={() => { quickLoginAs('admin'); setCurrentView('admin'); }}
              title="Login as Super Administrator"
              style={{
                background: user?.role === 'admin' ? '#0d9488' : '#fff',
                color: user?.role === 'admin' ? '#fff' : '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '0.2rem 0.45rem',
                cursor: 'pointer'
              }}
            >
              Admin
            </button>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="user-badge">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.full_name}
                  className="avatar-img"
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
                    {user.full_name.split(' ')[0]}
                  </span>
                  <span className={`role-pill ${user.role}`}>{user.role}</span>
                </div>
              </div>
              <button
                className="nav-btn"
                onClick={logout}
                title="Logout"
                style={{ padding: '0.45rem', color: '#dc2626' }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.45rem' }}>
              <button className="nav-btn" onClick={() => openAuthModal('login')}>
                <LogIn size={16} /> Login
              </button>
              <button className="btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }} onClick={() => openAuthModal('register')}>
                <UserPlus size={15} /> Join
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
