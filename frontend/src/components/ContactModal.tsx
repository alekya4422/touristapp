import React, { useState } from 'react';
import { X, Phone, Mail, MessageSquare, CheckCircle, ShieldCheck, Calendar, Users, Copy, Check } from 'lucide-react';
import { TripCard } from '../types';
import { useAuth } from '../context/AuthContext';

interface ContactModalProps {
  card: TripCard;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ card, onClose }) => {
  const { user, token } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [travelDate, setTravelDate] = useState('');
  const [groupSize, setGroupSize] = useState('2');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlockedData, setUnlockedData] = useState<{
    phone?: string;
    whatsapp?: string;
    email?: string;
    planner_name?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setError('Please provide your name, phone number, and email.');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/trips/${card.id}/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          traveler_name: name,
          traveler_phone: phone,
          traveler_email: email,
          travel_date: travelDate,
          group_size: Number(groupSize) || 1,
          message
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit inquiry');
      }

      setUnlockedData(data.planner_contact);
    } catch (err: any) {
      setError(err.message || 'Error contacting planner');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              {unlockedData ? 'Direct Planner Contact Unlocked' : 'Contact Trip Planner'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              {card.title} ({card.origin} → {card.destination})
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {unlockedData ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={32} />
              </div>
              <h4 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.4rem' }}>
                Inquiry Sent to {unlockedData.planner_name || card.planner_name}!
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                Your request details have been transmitted. You can now call, WhatsApp, or email the planner directly:
              </p>

              <div className="unlocked-contact-box">
                {unlockedData.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Phone size={18} color="#059669" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>Phone / Mobile</div>
                        <strong style={{ fontSize: '1.05rem', color: '#064e3b' }}>{unlockedData.phone}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <a
                        href={`tel:${unlockedData.phone}`}
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Call Now
                      </a>
                      <button
                        className="btn-secondary"
                        onClick={() => handleCopy(unlockedData.phone!)}
                        style={{ padding: '0.4rem 0.65rem' }}
                        title="Copy phone"
                      >
                        {copied ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {unlockedData.whatsapp && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #bbf7d0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <MessageSquare size={18} color="#16a34a" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>WhatsApp Chat</div>
                        <strong style={{ fontSize: '1.05rem', color: '#064e3b' }}>{unlockedData.whatsapp}</strong>
                      </div>
                    </div>
                    <a
                      href={`https://wa.me/${unlockedData.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(unlockedData.planner_name || '')},%20I%20saw%20your%20trip%20plan%20"${encodeURIComponent(card.title)}"%20on%20TripPlanner.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#16a34a' }}
                    >
                      Open WhatsApp
                    </a>
                  </div>
                )}

                {unlockedData.email && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Mail size={18} color="#059669" />
                      <div>
                        <div style={{ fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }}>Direct Email</div>
                        <span style={{ fontSize: '0.92rem', color: '#064e3b', fontWeight: 600 }}>{unlockedData.email}</span>
                      </div>
                    </div>
                    <a
                      href={`mailto:${unlockedData.email}?subject=Inquiry:%20${encodeURIComponent(card.title)}`}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Send Email
                    </a>
                  </div>
                )}
              </div>

              <button
                className="btn-primary"
                onClick={onClose}
                style={{ marginTop: '1.5rem', width: '100%' }}
              >
                Close & Return to Search
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={card.planner_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                  alt={card.planner_name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                    {card.planner_name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {card.planner_location} • {card.planner_languages}
                  </div>
                </div>
              </div>

              {error && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  {error}
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Your Full Name *</label>
                <input
                  id="contact-name"
                  type="text"
                  className="form-input"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-phone">Phone Number *</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="form-input"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email Address *</label>
                  <input
                    id="contact-email"
                    type="email"
                    className="form-input"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-date">Intended Travel Date</label>
                  <input
                    id="contact-date"
                    type="date"
                    className="form-input"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-group">Group Size (Members)</label>
                  <input
                    id="contact-group"
                    type="number"
                    min="1"
                    max="50"
                    className="form-input"
                    value={groupSize}
                    onChange={(e) => setGroupSize(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-msg">Requirements / Notes for Planner</label>
                <textarea
                  id="contact-msg"
                  className="form-textarea"
                  placeholder="e.g. Need hotel stay near Kashi Vishwanath temple, senior citizen friendly transport, pure vegetarian meals..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#64748b' }}>
                <ShieldCheck size={16} color="#059669" />
                <span>Your contact info is shared only with this verified trip planner.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
                  Cancel
                </button>
                <button type="submit" id="submit-inquiry-btn" className="btn-primary" disabled={loading}>
                  <Phone size={16} />
                  {loading ? 'Connecting...' : 'Request & Reveal Direct Phone'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
