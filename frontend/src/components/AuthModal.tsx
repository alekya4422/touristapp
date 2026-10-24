import React, { useState } from 'react';
import { X, LogIn, UserPlus, Compass, Shield, Briefcase, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose }) => {
  const { login, register, quickLoginAs } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [role, setRole] = useState<UserRole>('traveler');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Visakhapatnam, Andhra Pradesh');
  const [languages, setLanguages] = useState('Telugu, Hindi, English');
  const [bio, setBio] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (!res.success) throw new Error(res.error || 'Login failed');
        onClose();
      } else {
        const payload: any = {
          email,
          password,
          role,
          full_name: fullName,
          phone
        };
        if (role === 'planner') {
          payload.location = location;
          payload.languages = languages;
          payload.bio = bio;
        }
        const res = await register(payload);
        if (!res.success) throw new Error(res.error || 'Registration failed');
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async (r: UserRole) => {
    await quickLoginAs(r);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`nav-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError(null); }}
            >
              <LogIn size={15} /> Login
            </button>
            <button
              className={`nav-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError(null); }}
            >
              <UserPlus size={15} /> Register
            </button>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick Demo Logins Bar */}
          <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }}>
              <Sparkles size={13} /> Quick One-Click Demo Logins:
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => handleDemoFill('traveler')}
              >
                Traveler (Ananya)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => handleDemoFill('planner')}
              >
                Planner (Ramesh)
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => handleDemoFill('admin')}
              >
                Admin (Superadmin)
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    type="button"
                    className={`btn-secondary ${role === 'traveler' ? 'active' : ''}`}
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: role === 'traveler' ? '#e0e7ff' : '#fff', borderColor: role === 'traveler' ? '#6366f1' : '#cbd5e1' }}
                    onClick={() => setRole('traveler')}
                  >
                    I am a Traveler
                  </button>
                  <button
                    type="button"
                    className={`btn-secondary ${role === 'planner' ? 'active' : ''}`}
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: role === 'planner' ? '#ccfbf1' : '#fff', borderColor: role === 'planner' ? '#0d9488' : '#cbd5e1' }}
                    onClick={() => setRole('planner')}
                  >
                    I am a Trip Planner
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name *</label>
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">Email Address *</label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="auth-pwd">Password *</label>
              <input
                id="auth-pwd"
                type="password"
                className="form-input"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            {mode === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-phone">Phone Number</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    className="form-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 89190 23456"
                  />
                </div>

                {role === 'planner' && (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-loc">Operating Location / Base City *</label>
                      <input
                        id="reg-loc"
                        type="text"
                        className="form-input"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Visakhapatnam, Andhra Pradesh"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-langs">Languages Spoken</label>
                      <input
                        id="reg-langs"
                        type="text"
                        className="form-input"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                        placeholder="e.g. Telugu, Hindi, English"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="reg-bio">Short Description / Bio</label>
                      <textarea
                        id="reg-bio"
                        className="form-textarea"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Specializing in Varanasi (Kasi) pilgrimages, VIP darshans, and family tours."
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <button type="submit" id="auth-submit-btn" className="btn-primary" style={{ width: '100%', marginTop: '0.75rem' }} disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In to Account' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
