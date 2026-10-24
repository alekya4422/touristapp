import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TripCard, PlannerProfile, SubscriptionPlan, SubscriptionRecord, ContactInquiry } from '../types';
import {
  PlusCircle, Edit, Trash2, Eye, EyeOff, ShieldCheck, CheckCircle2,
  Clock, IndianRupee, Sparkles, AlertCircle, CreditCard, User, Layers,
  Phone, MessageSquare, MapPin, Globe, Award, HelpCircle
} from 'lucide-react';

export const PlannerDashboard: React.FC = () => {
  const { user, plannerProfile, token, refreshMe } = useAuth();
  const [activeTab, setActiveTab] = useState<'cards' | 'profile' | 'subscription' | 'inquiries'>('cards');

  // Cards State
  const [cards, setCards] = useState<TripCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [editingCard, setEditingCard] = useState<TripCard | null>(null);
  const [isCreatingCard, setIsCreatingCard] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    location: '',
    languages: '',
    experience_years: 1,
    specialties: '',
    contact_phone: '',
    contact_email: '',
    whatsapp_number: '',
    website: '',
    avatar_url: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Subscriptions State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<SubscriptionRecord | null>(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [subscribingPlan, setSubscribingPlan] = useState<SubscriptionPlan | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Inquiries State
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loadingInquiries, setLoadingInquiries] = useState(false);

  // Card Form State
  const [cardForm, setCardForm] = useState({
    title: '',
    origin: '',
    destination: '',
    destination_aliases: '',
    duration: '',
    travel_dates: '',
    price_type: 'fixed' as 'fixed' | 'range' | 'custom',
    price_display: '',
    price_min: 0,
    price_max: 0,
    itinerary: '',
    included_services: '',
    languages: '',
    contact_phone: '',
    contact_email: '',
    contact_whatsapp: ''
  });

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Planner Cards
  const fetchMyCards = async () => {
    if (!token) return;
    setLoadingCards(true);
    try {
      const res = await fetch('/api/planner/cards', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCards(false);
    }
  };

  // Fetch Subscriptions & Plans
  const fetchSubscriptionData = async () => {
    if (!token) return;
    setLoadingSub(true);
    try {
      const [plansRes, subRes] = await Promise.all([
        fetch('/api/subscriptions/plans'),
        fetch('/api/subscriptions/current', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (plansRes.ok) {
        const pData = await plansRes.json();
        setPlans(pData.plans || []);
      }
      if (subRes.ok) {
        const sData = await subRes.json();
        setCurrentSub(sData.subscription || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSub(false);
    }
  };

  // Fetch Inquiries
  const fetchInquiries = async () => {
    if (!token) return;
    setLoadingInquiries(true);
    try {
      const res = await fetch('/api/planner/inquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    fetchMyCards();
    fetchSubscriptionData();
    fetchInquiries();
  }, [token]);

  // Sync profile form when profile loads
  useEffect(() => {
    if (plannerProfile && user) {
      setProfileForm({
        full_name: user.full_name || '',
        bio: plannerProfile.bio || '',
        location: plannerProfile.location || '',
        languages: plannerProfile.languages || '',
        experience_years: plannerProfile.experience_years || 1,
        specialties: plannerProfile.specialties || '',
        contact_phone: plannerProfile.contact_phone || '',
        contact_email: plannerProfile.contact_email || user.email,
        whatsapp_number: plannerProfile.whatsapp_number || '',
        website: plannerProfile.website || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [plannerProfile, user]);

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/planner/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      await refreshMe();
      showToast('Planner profile updated successfully!');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  // Open Create Card
  const openCreateCard = () => {
    setCardForm({
      title: '',
      origin: plannerProfile?.location?.split(',')[0]?.trim() || 'Visakhapatnam',
      destination: '',
      destination_aliases: '',
      duration: '4 Days / 3 Nights',
      travel_dates: 'Weekly departures',
      price_type: 'fixed',
      price_display: '₹15,000 per person',
      price_min: 15000,
      price_max: 15000,
      itinerary: `Day 1: Departure and arrival, hotel check-in.\nDay 2: Guided temple/sightseeing darshan.\nDay 3: Scenic excursion and shopping.\nDay 4: Return journey.`,
      included_services: 'AC Hotel Accommodation, Breakfast & Dinner, Sightseeing Cab, Darshan Assistance',
      languages: plannerProfile?.languages || 'English, Telugu, Hindi',
      contact_phone: plannerProfile?.contact_phone || '',
      contact_email: plannerProfile?.contact_email || '',
      contact_whatsapp: plannerProfile?.whatsapp_number || ''
    });
    setIsCreatingCard(true);
    setEditingCard(null);
  };

  // Open Edit Card
  const openEditCard = (card: TripCard) => {
    setCardForm({
      title: card.title,
      origin: card.origin,
      destination: card.destination,
      destination_aliases: card.destination_aliases || '',
      duration: card.duration,
      travel_dates: card.travel_dates,
      price_type: card.price_type || 'fixed',
      price_display: card.price_display,
      price_min: card.price_min || 0,
      price_max: card.price_max || 0,
      itinerary: card.itinerary,
      included_services: card.included_services || '',
      languages: card.languages || '',
      contact_phone: card.contact_phone || '',
      contact_email: card.contact_email || '',
      contact_whatsapp: card.contact_whatsapp || ''
    });
    setEditingCard(card);
    setIsCreatingCard(false);
  };

  // Save Card (Create or Edit)
  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const url = editingCard ? `/api/planner/cards/${editingCard.id}` : '/api/planner/cards';
      const method = editingCard ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(cardForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save trip card');

      showToast(editingCard ? 'Trip card updated!' : 'Trip card created successfully!');
      setIsCreatingCard(false);
      setEditingCard(null);
      fetchMyCards();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Toggle Publish
  const handleTogglePublish = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/planner/cards/${id}/publish`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      showToast(data.message);
      fetchMyCards();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Card with Confirmation
  const handleDeleteCard = async (id: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the trip card: "${title}"?`)) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/planner/cards/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete card');
      showToast('Trip card removed.');
      fetchMyCards();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Execute Subscription Checkout
  const handleCheckout = async (plan: SubscriptionPlan) => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          plan_id: plan.id,
          billing_period: 'monthly',
          test_token: 'test_demo_card_valid'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      showToast(`Subscribed to ${plan.name}! Verified badge activated.`);
      setSubscribingPlan(null);
      await refreshMe();
      fetchSubscriptionData();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', paddingBottom: '4rem' }}>
      {/* Toast Alert */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="dashboard-header">
        <div className="dashboard-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=140&q=80'}
              alt={user?.full_name}
              style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ccfbf1' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>{user?.full_name}</h1>
                {plannerProfile?.verified && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px' }}>
                    <ShieldCheck size={14} /> Verified Planner
                  </span>
                )}
                <span className={`role-pill ${plannerProfile?.current_plan === 'pro' ? 'planner' : 'traveler'}`}>
                  {plannerProfile?.current_plan ? `${plannerProfile.current_plan.toUpperCase()} PLAN` : 'STARTER'}
                </span>
              </div>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
                {plannerProfile?.location || 'Visakhapatnam, Andhra Pradesh'} • {plannerProfile?.experience_years} Years Experience • {plannerProfile?.languages}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn-primary"
              id="create-trip-card-btn"
              onClick={openCreateCard}
            >
              <PlusCircle size={16} /> Create Trip-Plan Card
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ maxWidth: '1280px', margin: '1.5rem auto 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
          <button
            className={`nav-btn ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('cards')}
          >
            <Layers size={16} /> My Trip Cards ({cards.length})
          </button>
          <button
            className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={16} /> Edit Profile
          </button>
          <button
            className={`nav-btn ${activeTab === 'subscription' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscription')}
          >
            <CreditCard size={16} /> Subscription & Visibility
          </button>
          <button
            className={`nav-btn ${activeTab === 'inquiries' ? 'active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <MessageSquare size={16} /> Received Inquiries ({inquiries.length})
          </button>
        </div>
      </div>

      <div className="main-content" style={{ paddingTop: '1.5rem' }}>
        {/* ========================================================
            TAB 1: TRIP CARDS MANAGER
           ======================================================== */}
        {activeTab === 'cards' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', color: '#0f172a' }}>Manage Your Travel Cards</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Create and publish tailored pilgrimage and vacation packages for travelers to discover.
                </p>
              </div>
              <button className="btn-primary" onClick={openCreateCard}>
                <PlusCircle size={16} /> Add New Card
              </button>
            </div>

            {loadingCards ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your cards...</div>
            ) : cards.length === 0 ? (
              <div className="state-box">
                <div className="state-icon">
                  <Layers size={28} />
                </div>
                <h3 className="state-title">No Trip-Plan Cards Published Yet</h3>
                <p className="state-desc">
                  Create your first trip plan card (e.g. Visakhapatnam to Kasi) to start receiving direct traveler inquiries and phone bookings.
                </p>
                <button className="btn-primary" onClick={openCreateCard}>
                  <PlusCircle size={16} /> Create First Trip Card
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                {cards.map((card) => (
                  <div key={card.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
                    <div style={{ padding: '0.75rem 1rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#5eead4' }}>
                        {card.origin} → {card.destination}
                      </span>
                      <span className={`status-badge ${card.is_published ? 'approved' : 'flagged'}`} style={{ fontSize: '0.72rem' }}>
                        {card.is_published ? 'Live / Published' : 'Draft / Unpublished'}
                      </span>
                    </div>

                    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.4rem' }}>{card.title}</h4>
                      {card.destination_aliases && (
                        <div style={{ fontSize: '0.75rem', color: '#0f766e', marginBottom: '0.65rem' }}>
                          Aliases: {card.destination_aliases}
                        </div>
                      )}
                      <p style={{ fontSize: '0.84rem', color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }}>
                        {card.itinerary}
                      </p>

                      <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>Price</div>
                          <strong style={{ fontSize: '1.05rem', color: '#0f766e' }}>{card.price_display}</strong>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleTogglePublish(card.id)}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            title={card.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {card.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            className="btn-secondary"
                            onClick={() => openEditCard(card)}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            title="Edit Card"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDeleteCard(card.id, card.title)}
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            title="Delete Card"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: PLANNER PROFILE EDITOR
           ======================================================== */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '2rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '0.3rem' }}>Edit Planner Profile</h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.75rem' }}>
              Keep your contact methods, regional expertise, and guide credentials up-to-date for travelers.
            </p>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Location / Base City</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Visakhapatnam, Andhra Pradesh"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Languages Spoken</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Telugu, Hindi, English"
                    value={profileForm.languages}
                    onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Years of Planning Experience</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="form-input"
                    value={profileForm.experience_years}
                    onChange={(e) => setProfileForm({ ...profileForm, experience_years: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-group">
                  <label className="form-label">Direct Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    required
                    value={profileForm.contact_phone}
                    onChange={(e) => setProfileForm({ ...profileForm, contact_phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">WhatsApp Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+91 89190 23456"
                    value={profileForm.whatsapp_number}
                    onChange={(e) => setProfileForm({ ...profileForm, whatsapp_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Specialties & Tour Themes</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Kasi Pilgrimages, VIP Darshan, South India Temples, Honeymoon circuits"
                  value={profileForm.specialties}
                  onChange={(e) => setProfileForm({ ...profileForm, specialties: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Professional Bio / Description</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '110px' }}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Avatar Image URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={profileForm.avatar_url}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================
            TAB 3: SUBSCRIPTION & VISIBILITY
           ======================================================== */}
        {activeTab === 'subscription' && (
          <div>
            {/* Current status banner */}
            <div style={{ background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Award size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#047857', fontWeight: 700 }}>
                    Current Active Tier
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: '#064e3b' }}>
                    {currentSub?.plan_name || 'Starter Plan (Free)'}
                  </h3>
                  <div style={{ fontSize: '0.84rem', color: '#065f46', marginTop: '2px' }}>
                    Status: <strong>Active</strong> • Renewal / Expiry: {new Date(currentSub?.expires_at || Date.now() + 30 * 86400000).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="rating-badge" style={{ fontSize: '0.9rem', padding: '0.35rem 0.8rem' }}>
                  <ShieldCheck size={16} color="#059669" /> Verified Visibility Active
                </span>
              </div>
            </div>

            {/* Test Payment notice */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Sparkles size={18} color="#2563eb" />
              <span>
                <strong>Safe Simulated Payment Flow:</strong> No credit card numbers are ever stored. You can test subscription upgrades instantly below. In production, configure real Stripe/Razorpay keys in <code>backend/.env</code>.
              </span>
            </div>

            {/* Plans Pricing Grid */}
            <div className="pricing-grid">
              {plans.map((p) => {
                const isCurrent = (currentSub?.plan_id || 'free') === p.id;
                return (
                  <div key={p.id} className={`pricing-card ${p.recommended ? 'featured' : ''}`}>
                    {p.badge && <div className="pricing-badge">{p.badge}</div>}
                    <h3 className="plan-name">{p.name}</h3>
                    <div className="plan-price">
                      {p.price_monthly === 0 ? 'Free' : `₹${p.price_monthly}`}
                      {p.price_monthly > 0 && <span>/month</span>}
                    </div>

                    <ul className="plan-feature-list">
                      {p.features.map((feat, i) => (
                        <li key={i} className="plan-feature-item">
                          <CheckCircle2 size={16} color="#0d9488" style={{ minWidth: '16px', marginTop: '2px' }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {isCurrent ? (
                      <button className="btn-secondary" disabled style={{ width: '100%', opacity: 0.8 }}>
                        Current Active Plan
                      </button>
                    ) : (
                      <button
                        className="btn-primary"
                        onClick={() => setSubscribingPlan(p)}
                        style={{ width: '100%' }}
                      >
                        Upgrade to {p.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: RECEIVED INQUIRIES
           ======================================================== */}
        {activeTab === 'inquiries' && (
          <div className="table-card">
            <div className="table-toolbar">
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Direct Traveler Leads & Inquiries</h3>
                <p style={{ fontSize: '0.84rem', color: '#64748b' }}>
                  Travelers who have viewed your cards and requested direct phone / WhatsApp coordination.
                </p>
              </div>
            </div>

            {loadingInquiries ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>Loading inquiries...</div>
            ) : inquiries.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                No traveler inquiries received yet. When travelers click "Contact Planner" on your cards, their details appear here.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Traveler Name</th>
                    <th>Contact Phone</th>
                    <th>Email</th>
                    <th>Trip Package</th>
                    <th>Group Size</th>
                    <th>Message</th>
                    <th>Direct Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq) => (
                    <tr key={inq.id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(inq.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td><strong>{inq.traveler_name}</strong></td>
                      <td>
                        <a href={`tel:${inq.traveler_phone}`} style={{ color: '#0f766e', fontWeight: 600 }}>
                          {inq.traveler_phone}
                        </a>
                      </td>
                      <td>{inq.traveler_email}</td>
                      <td><span style={{ fontSize: '0.85rem', color: '#334155' }}>{inq.trip_title || 'General Inquiry'}</span></td>
                      <td>{inq.group_size || 1} Persons</td>
                      <td style={{ maxWidth: '260px', fontSize: '0.82rem', color: '#475569' }}>
                        {inq.message}
                      </td>
                      <td>
                        <a
                          href={`https://wa.me/${inq.traveler_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', background: '#16a34a' }}
                        >
                          WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ========================================================
          CREATE / EDIT TRIP CARD MODAL
         ======================================================== */}
      {(isCreatingCard || editingCard) && (
        <div className="modal-overlay" onClick={() => { setIsCreatingCard(false); setEditingCard(null); }}>
          <div className="modal-container" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCard ? 'Edit Trip-Plan Card' : 'Create New Trip-Plan Card'}
              </h3>
              <button className="modal-close-btn" onClick={() => { setIsCreatingCard(false); setEditingCard(null); }}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSaveCard}>
                <div className="form-group">
                  <label className="form-label" htmlFor="card-title">Trip Title *</label>
                  <input
                    id="card-title"
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Divine Kasi & Prayagraj Yatra from Visakhapatnam"
                    value={cardForm.title}
                    onChange={(e) => setCardForm({ ...cardForm, title: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-origin">Origin / Departure City *</label>
                    <input
                      id="card-origin"
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Visakhapatnam"
                      value={cardForm.origin}
                      onChange={(e) => setCardForm({ ...cardForm, origin: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="card-dest">Destination / Circuit *</label>
                    <input
                      id="card-dest"
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. Kasi (Varanasi)"
                      value={cardForm.destination}
                      onChange={(e) => setCardForm({ ...cardForm, destination: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="card-aliases">Destination Aliases / Cities Covered (Optional)</label>
                  <input
                    id="card-aliases"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Varanasi, Banaras, Kashi, Prayagraj"
                    value={cardForm.destination_aliases}
                    onChange={(e) => setCardForm({ ...cardForm, destination_aliases: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-duration">Duration *</label>
                    <input
                      id="card-duration"
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. 5 Days / 4 Nights"
                      value={cardForm.duration}
                      onChange={(e) => setCardForm({ ...cardForm, duration: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="card-dates">Travel Dates / Availability</label>
                    <input
                      id="card-dates"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Departs every Wednesday & Friday"
                      value={cardForm.travel_dates}
                      onChange={(e) => setCardForm({ ...cardForm, travel_dates: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-price-display">Price or Price Range (Display) *</label>
                    <input
                      id="card-price-display"
                      type="text"
                      className="form-input"
                      required
                      placeholder="e.g. ₹16,500 per person or ₹15,000 - ₹18,000"
                      value={cardForm.price_display}
                      onChange={(e) => setCardForm({ ...cardForm, price_display: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="card-price-min">Numeric Min Price (for search filters)</label>
                    <input
                      id="card-price-min"
                      type="number"
                      className="form-input"
                      placeholder="16500"
                      value={cardForm.price_min}
                      onChange={(e) => setCardForm({ ...cardForm, price_min: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="card-itinerary">Day-by-Day Itinerary / Description *</label>
                  <textarea
                    id="card-itinerary"
                    className="form-textarea"
                    rows={5}
                    required
                    placeholder="Day 1: Departure from Visakhapatnam, evening arrival and Ganga Aarti.&#10;Day 2: Morning Kashi Vishwanath VIP Darshan...&#10;Day 3: Prayagraj Sangam excursion..."
                    value={cardForm.itinerary}
                    onChange={(e) => setCardForm({ ...cardForm, itinerary: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="card-services">Included Services (comma separated)</label>
                  <input
                    id="card-services"
                    type="text"
                    className="form-input"
                    placeholder="3-Star Hotel AC Stay, Pure Veg Meals, AC Cab Transfers, VIP Darshan Coordinator, Boat Aarti"
                    value={cardForm.included_services}
                    onChange={(e) => setCardForm({ ...cardForm, included_services: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => { setIsCreatingCard(false); setEditingCard(null); }}
                  >
                    Cancel
                  </button>
                  <button type="submit" id="save-trip-card-submit" className="btn-primary">
                    {editingCard ? 'Update Trip Card' : 'Publish Trip Card'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TEST SUBSCRIPTION CHECKOUT MODAL
         ======================================================== */}
      {subscribingPlan && (
        <div className="modal-overlay" onClick={() => setSubscribingPlan(null)}>
          <div className="modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Plan Upgrade</h3>
              <button className="modal-close-btn" onClick={() => setSubscribingPlan(null)}>&times;</button>
            </div>

            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {subscribingPlan.name}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f766e', marginTop: '0.35rem' }}>
                  {subscribingPlan.price_monthly === 0 ? 'Free' : `₹${subscribingPlan.price_monthly} / mo`}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Billed monthly. Cancel anytime with immediate effect.
                </p>
              </div>

              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }}>
                  Plan Benefits Included:
                </div>
                {subscribingPlan.features.map((f, i) => (
                  <div key={i} style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', gap: '0.5rem', marginBottom: '4px' }}>
                    <CheckCircle2 size={14} color="#0d9488" /> {f}
                  </div>
                ))}
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#065f46' }}>
                <strong>Dev/Testing Mode:</strong> Simulated transaction token ready. Clicking below immediately activates the tier and verified badge.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => setSubscribingPlan(null)}>
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={() => handleCheckout(subscribingPlan)}
                  disabled={checkoutLoading}
                >
                  <CreditCard size={16} />
                  {checkoutLoading ? 'Processing...' : 'Confirm & Activate Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
