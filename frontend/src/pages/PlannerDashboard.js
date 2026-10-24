import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, ShieldCheck, CheckCircle2, Sparkles, AlertCircle, CreditCard, User, Layers, MessageSquare, Award } from 'lucide-react';
export const PlannerDashboard = () => {
    const { user, plannerProfile, token, refreshMe } = useAuth();
    const [activeTab, setActiveTab] = useState('cards');
    // Cards State
    const [cards, setCards] = useState([]);
    const [loadingCards, setLoadingCards] = useState(true);
    const [editingCard, setEditingCard] = useState(null);
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
    const [plans, setPlans] = useState([]);
    const [currentSub, setCurrentSub] = useState(null);
    const [loadingSub, setLoadingSub] = useState(true);
    const [subscribingPlan, setSubscribingPlan] = useState(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    // Inquiries State
    const [inquiries, setInquiries] = useState([]);
    const [loadingInquiries, setLoadingInquiries] = useState(false);
    // Card Form State
    const [cardForm, setCardForm] = useState({
        title: '',
        origin: '',
        destination: '',
        destination_aliases: '',
        duration: '',
        travel_dates: '',
        price_type: 'fixed',
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
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };
    // Fetch Planner Cards
    const fetchMyCards = async () => {
        if (!token)
            return;
        setLoadingCards(true);
        try {
            const res = await fetch('/api/planner/cards', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setCards(data.cards || []);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoadingCards(false);
        }
    };
    // Fetch Subscriptions & Plans
    const fetchSubscriptionData = async () => {
        if (!token)
            return;
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
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoadingSub(false);
        }
    };
    // Fetch Inquiries
    const fetchInquiries = async () => {
        if (!token)
            return;
        setLoadingInquiries(true);
        try {
            const res = await fetch('/api/planner/inquiries', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setInquiries(data.inquiries || []);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
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
    const handleSaveProfile = async (e) => {
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
            if (!res.ok)
                throw new Error(data.error || 'Failed to update profile');
            await refreshMe();
            showToast('Planner profile updated successfully!');
        }
        catch (err) {
            showToast(err.message, 'error');
        }
        finally {
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
    const openEditCard = (card) => {
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
    const handleSaveCard = async (e) => {
        e.preventDefault();
        if (!token)
            return;
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
            if (!res.ok)
                throw new Error(data.error || 'Failed to save trip card');
            showToast(editingCard ? 'Trip card updated!' : 'Trip card created successfully!');
            setIsCreatingCard(false);
            setEditingCard(null);
            fetchMyCards();
        }
        catch (err) {
            showToast(err.message, 'error');
        }
    };
    // Toggle Publish
    const handleTogglePublish = async (id) => {
        if (!token)
            return;
        try {
            const res = await fetch(`/api/planner/cards/${id}/publish`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Failed to update status');
            showToast(data.message);
            fetchMyCards();
        }
        catch (err) {
            showToast(err.message, 'error');
        }
    };
    // Delete Card with Confirmation
    const handleDeleteCard = async (id, title) => {
        if (!window.confirm(`Are you sure you want to delete the trip card: "${title}"?`))
            return;
        if (!token)
            return;
        try {
            const res = await fetch(`/api/planner/cards/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Failed to delete card');
            showToast('Trip card removed.');
            fetchMyCards();
        }
        catch (err) {
            showToast(err.message, 'error');
        }
    };
    // Execute Subscription Checkout
    const handleCheckout = async (plan) => {
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
            if (!res.ok)
                throw new Error(data.error || 'Checkout failed');
            showToast(`Subscribed to ${plan.name}! Verified badge activated.`);
            setSubscribingPlan(null);
            await refreshMe();
            fetchSubscriptionData();
        }
        catch (err) {
            showToast(err.message, 'error');
        }
        finally {
            setCheckoutLoading(false);
        }
    };
    return (_jsxs("div", { style: { background: '#f8fafc', minHeight: '90vh', paddingBottom: '4rem' }, children: [toast && (_jsx("div", { className: "toast-container", children: _jsxs("div", { className: `toast ${toast.type}`, children: [toast.type === 'success' ? _jsx(CheckCircle2, { size: 18 }) : _jsx(AlertCircle, { size: 18 }), _jsx("span", { children: toast.msg })] }) })), _jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "dashboard-title-row", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsx("img", { src: user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=140&q=80', alt: user?.full_name, style: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ccfbf1' } }), _jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx("h1", { style: { fontSize: '1.6rem', color: '#0f172a' }, children: user?.full_name }), plannerProfile?.verified && (_jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#e0f2fe', color: '#0284c7', fontSize: '0.75rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '999px' }, children: [_jsx(ShieldCheck, { size: 14 }), " Verified Planner"] })), _jsx("span", { className: `role-pill ${plannerProfile?.current_plan === 'pro' ? 'planner' : 'traveler'}`, children: plannerProfile?.current_plan ? `${plannerProfile.current_plan.toUpperCase()} PLAN` : 'STARTER' })] }), _jsxs("p", { style: { fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }, children: [plannerProfile?.location || 'Visakhapatnam, Andhra Pradesh', " \u2022 ", plannerProfile?.experience_years, " Years Experience \u2022 ", plannerProfile?.languages] })] })] }), _jsx("div", { style: { display: 'flex', gap: '0.5rem' }, children: _jsxs("button", { className: "btn-primary", id: "create-trip-card-btn", onClick: openCreateCard, children: [_jsx(PlusCircle, { size: 16 }), " Create Trip-Plan Card"] }) })] }), _jsxs("div", { style: { maxWidth: '1280px', margin: '1.5rem auto 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }, children: [_jsxs("button", { className: `nav-btn ${activeTab === 'cards' ? 'active' : ''}`, onClick: () => setActiveTab('cards'), children: [_jsx(Layers, { size: 16 }), " My Trip Cards (", cards.length, ")"] }), _jsxs("button", { className: `nav-btn ${activeTab === 'profile' ? 'active' : ''}`, onClick: () => setActiveTab('profile'), children: [_jsx(User, { size: 16 }), " Edit Profile"] }), _jsxs("button", { className: `nav-btn ${activeTab === 'subscription' ? 'active' : ''}`, onClick: () => setActiveTab('subscription'), children: [_jsx(CreditCard, { size: 16 }), " Subscription & Visibility"] }), _jsxs("button", { className: `nav-btn ${activeTab === 'inquiries' ? 'active' : ''}`, onClick: () => setActiveTab('inquiries'), children: [_jsx(MessageSquare, { size: 16 }), " Received Inquiries (", inquiries.length, ")"] })] })] }), _jsxs("div", { className: "main-content", style: { paddingTop: '1.5rem' }, children: [activeTab === 'cards' && (_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }, children: [_jsxs("div", { children: [_jsx("h2", { style: { fontSize: '1.3rem', color: '#0f172a' }, children: "Manage Your Travel Cards" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#64748b' }, children: "Create and publish tailored pilgrimage and vacation packages for travelers to discover." })] }), _jsxs("button", { className: "btn-primary", onClick: openCreateCard, children: [_jsx(PlusCircle, { size: 16 }), " Add New Card"] })] }), loadingCards ? (_jsx("div", { style: { textAlign: 'center', padding: '3rem' }, children: "Loading your cards..." })) : cards.length === 0 ? (_jsxs("div", { className: "state-box", children: [_jsx("div", { className: "state-icon", children: _jsx(Layers, { size: 28 }) }), _jsx("h3", { className: "state-title", children: "No Trip-Plan Cards Published Yet" }), _jsx("p", { className: "state-desc", children: "Create your first trip plan card (e.g. Visakhapatnam to Kasi) to start receiving direct traveler inquiries and phone bookings." }), _jsxs("button", { className: "btn-primary", onClick: openCreateCard, children: [_jsx(PlusCircle, { size: 16 }), " Create First Trip Card"] })] })) : (_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }, children: cards.map((card) => (_jsxs("div", { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }, children: [_jsxs("div", { style: { padding: '0.75rem 1rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("span", { style: { fontSize: '0.85rem', fontWeight: 700, color: '#5eead4' }, children: [card.origin, " \u2192 ", card.destination] }), _jsx("span", { className: `status-badge ${card.is_published ? 'approved' : 'flagged'}`, style: { fontSize: '0.72rem' }, children: card.is_published ? 'Live / Published' : 'Draft / Unpublished' })] }), _jsxs("div", { style: { padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }, children: [_jsx("h4", { style: { fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.4rem' }, children: card.title }), card.destination_aliases && (_jsxs("div", { style: { fontSize: '0.75rem', color: '#0f766e', marginBottom: '0.65rem' }, children: ["Aliases: ", card.destination_aliases] })), _jsx("p", { style: { fontSize: '0.84rem', color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1rem' }, children: card.itinerary }), _jsxs("div", { style: { marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }, children: "Price" }), _jsx("strong", { style: { fontSize: '1.05rem', color: '#0f766e' }, children: card.price_display })] }), _jsxs("div", { style: { display: 'flex', gap: '0.4rem' }, children: [_jsx("button", { className: "btn-secondary", onClick: () => handleTogglePublish(card.id), style: { padding: '0.35rem 0.65rem', fontSize: '0.8rem' }, title: card.is_published ? 'Unpublish' : 'Publish', children: card.is_published ? _jsx(EyeOff, { size: 14 }) : _jsx(Eye, { size: 14 }) }), _jsx("button", { className: "btn-secondary", onClick: () => openEditCard(card), style: { padding: '0.35rem 0.65rem', fontSize: '0.8rem' }, title: "Edit Card", children: _jsx(Edit, { size: 14 }) }), _jsx("button", { className: "btn-danger", onClick: () => handleDeleteCard(card.id, card.title), style: { padding: '0.35rem 0.65rem', fontSize: '0.8rem' }, title: "Delete Card", children: _jsx(Trash2, { size: 14 }) })] })] })] })] }, card.id))) }))] })), activeTab === 'profile' && (_jsxs("div", { style: { maxWidth: '800px', margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '2rem', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }, children: [_jsx("h2", { style: { fontSize: '1.35rem', color: '#0f172a', marginBottom: '0.3rem' }, children: "Edit Planner Profile" }), _jsx("p", { style: { fontSize: '0.88rem', color: '#64748b', marginBottom: '1.75rem' }, children: "Keep your contact methods, regional expertise, and guide credentials up-to-date for travelers." }), _jsxs("form", { onSubmit: handleSaveProfile, children: [_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Full Name" }), _jsx("input", { type: "text", className: "form-input", required: true, value: profileForm.full_name, onChange: (e) => setProfileForm({ ...profileForm, full_name: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Location / Base City" }), _jsx("input", { type: "text", className: "form-input", required: true, placeholder: "e.g. Visakhapatnam, Andhra Pradesh", value: profileForm.location, onChange: (e) => setProfileForm({ ...profileForm, location: e.target.value }) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Languages Spoken" }), _jsx("input", { type: "text", className: "form-input", required: true, placeholder: "e.g. Telugu, Hindi, English", value: profileForm.languages, onChange: (e) => setProfileForm({ ...profileForm, languages: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Years of Planning Experience" }), _jsx("input", { type: "number", min: "1", max: "50", className: "form-input", value: profileForm.experience_years, onChange: (e) => setProfileForm({ ...profileForm, experience_years: Number(e.target.value) }) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Direct Contact Phone" }), _jsx("input", { type: "tel", className: "form-input", required: true, value: profileForm.contact_phone, onChange: (e) => setProfileForm({ ...profileForm, contact_phone: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "WhatsApp Number" }), _jsx("input", { type: "tel", className: "form-input", placeholder: "+91 89190 23456", value: profileForm.whatsapp_number, onChange: (e) => setProfileForm({ ...profileForm, whatsapp_number: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Specialties & Tour Themes" }), _jsx("input", { type: "text", className: "form-input", placeholder: "e.g. Kasi Pilgrimages, VIP Darshan, South India Temples, Honeymoon circuits", value: profileForm.specialties, onChange: (e) => setProfileForm({ ...profileForm, specialties: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Professional Bio / Description" }), _jsx("textarea", { className: "form-textarea", style: { minHeight: '110px' }, value: profileForm.bio, onChange: (e) => setProfileForm({ ...profileForm, bio: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Avatar Image URL" }), _jsx("input", { type: "url", className: "form-input", value: profileForm.avatar_url, onChange: (e) => setProfileForm({ ...profileForm, avatar_url: e.target.value }) })] }), _jsx("div", { style: { display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }, children: _jsx("button", { type: "submit", className: "btn-primary", disabled: savingProfile, children: savingProfile ? 'Saving...' : 'Save Profile Changes' }) })] })] })), activeTab === 'subscription' && (_jsxs("div", { children: [_jsxs("div", { style: { background: '#ecfdf5', border: '1.5px solid #a7f3d0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem' }, children: [_jsx("div", { style: { width: '48px', height: '48px', borderRadius: '12px', background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(Award, { size: 26 }) }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.8rem', textTransform: 'uppercase', color: '#047857', fontWeight: 700 }, children: "Current Active Tier" }), _jsx("h3", { style: { fontSize: '1.4rem', color: '#064e3b' }, children: currentSub?.plan_name || 'Starter Plan (Free)' }), _jsxs("div", { style: { fontSize: '0.84rem', color: '#065f46', marginTop: '2px' }, children: ["Status: ", _jsx("strong", { children: "Active" }), " \u2022 Renewal / Expiry: ", new Date(currentSub?.expires_at || Date.now() + 30 * 86400000).toLocaleDateString()] })] })] }), _jsx("div", { style: { textAlign: 'right' }, children: _jsxs("span", { className: "rating-badge", style: { fontSize: '0.9rem', padding: '0.35rem 0.8rem' }, children: [_jsx(ShieldCheck, { size: 16, color: "#059669" }), " Verified Visibility Active"] }) })] }), _jsxs("div", { style: { background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.85rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.65rem' }, children: [_jsx(Sparkles, { size: 18, color: "#2563eb" }), _jsxs("span", { children: [_jsx("strong", { children: "Safe Simulated Payment Flow:" }), " No credit card numbers are ever stored. You can test subscription upgrades instantly below. In production, configure real Stripe/Razorpay keys in ", _jsx("code", { children: "backend/.env" }), "."] })] }), _jsx("div", { className: "pricing-grid", children: plans.map((p) => {
                                    const isCurrent = (currentSub?.plan_id || 'free') === p.id;
                                    return (_jsxs("div", { className: `pricing-card ${p.recommended ? 'featured' : ''}`, children: [p.badge && _jsx("div", { className: "pricing-badge", children: p.badge }), _jsx("h3", { className: "plan-name", children: p.name }), _jsxs("div", { className: "plan-price", children: [p.price_monthly === 0 ? 'Free' : `₹${p.price_monthly}`, p.price_monthly > 0 && _jsx("span", { children: "/month" })] }), _jsx("ul", { className: "plan-feature-list", children: p.features.map((feat, i) => (_jsxs("li", { className: "plan-feature-item", children: [_jsx(CheckCircle2, { size: 16, color: "#0d9488", style: { minWidth: '16px', marginTop: '2px' } }), _jsx("span", { children: feat })] }, i))) }), isCurrent ? (_jsx("button", { className: "btn-secondary", disabled: true, style: { width: '100%', opacity: 0.8 }, children: "Current Active Plan" })) : (_jsxs("button", { className: "btn-primary", onClick: () => setSubscribingPlan(p), style: { width: '100%' }, children: ["Upgrade to ", p.name] }))] }, p.id));
                                }) })] })), activeTab === 'inquiries' && (_jsxs("div", { className: "table-card", children: [_jsx("div", { className: "table-toolbar", children: _jsxs("div", { children: [_jsx("h3", { style: { fontSize: '1.15rem', color: '#0f172a' }, children: "Direct Traveler Leads & Inquiries" }), _jsx("p", { style: { fontSize: '0.84rem', color: '#64748b' }, children: "Travelers who have viewed your cards and requested direct phone / WhatsApp coordination." })] }) }), loadingInquiries ? (_jsx("div", { style: { padding: '3rem', textAlign: 'center' }, children: "Loading inquiries..." })) : inquiries.length === 0 ? (_jsx("div", { style: { padding: '3rem', textAlign: 'center', color: '#64748b' }, children: "No traveler inquiries received yet. When travelers click \"Contact Planner\" on your cards, their details appear here." })) : (_jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Date" }), _jsx("th", { children: "Traveler Name" }), _jsx("th", { children: "Contact Phone" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Trip Package" }), _jsx("th", { children: "Group Size" }), _jsx("th", { children: "Message" }), _jsx("th", { children: "Direct Action" })] }) }), _jsx("tbody", { children: inquiries.map((inq) => (_jsxs("tr", { children: [_jsx("td", { style: { fontSize: '0.8rem', color: '#64748b' }, children: new Date(inq.created_at || Date.now()).toLocaleDateString() }), _jsx("td", { children: _jsx("strong", { children: inq.traveler_name }) }), _jsx("td", { children: _jsx("a", { href: `tel:${inq.traveler_phone}`, style: { color: '#0f766e', fontWeight: 600 }, children: inq.traveler_phone }) }), _jsx("td", { children: inq.traveler_email }), _jsx("td", { children: _jsx("span", { style: { fontSize: '0.85rem', color: '#334155' }, children: inq.trip_title || 'General Inquiry' }) }), _jsxs("td", { children: [inq.group_size || 1, " Persons"] }), _jsx("td", { style: { maxWidth: '260px', fontSize: '0.82rem', color: '#475569' }, children: inq.message }), _jsx("td", { children: _jsx("a", { href: `https://wa.me/${inq.traveler_phone.replace(/[^0-9]/g, '')}`, target: "_blank", rel: "noopener noreferrer", className: "btn-primary", style: { padding: '0.35rem 0.65rem', fontSize: '0.78rem', background: '#16a34a' }, children: "WhatsApp" }) })] }, inq.id))) })] }))] }))] }), (isCreatingCard || editingCard) && (_jsx("div", { className: "modal-overlay", onClick: () => { setIsCreatingCard(false); setEditingCard(null); }, children: _jsxs("div", { className: "modal-container", style: { maxWidth: '720px' }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { className: "modal-title", children: editingCard ? 'Edit Trip-Plan Card' : 'Create New Trip-Plan Card' }), _jsx("button", { className: "modal-close-btn", onClick: () => { setIsCreatingCard(false); setEditingCard(null); }, children: "\u00D7" })] }), _jsx("div", { className: "modal-body", children: _jsxs("form", { onSubmit: handleSaveCard, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-title", children: "Trip Title *" }), _jsx("input", { id: "card-title", type: "text", className: "form-input", required: true, placeholder: "e.g. Divine Kasi & Prayagraj Yatra from Visakhapatnam", value: cardForm.title, onChange: (e) => setCardForm({ ...cardForm, title: e.target.value }) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-origin", children: "Origin / Departure City *" }), _jsx("input", { id: "card-origin", type: "text", className: "form-input", required: true, placeholder: "e.g. Visakhapatnam", value: cardForm.origin, onChange: (e) => setCardForm({ ...cardForm, origin: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-dest", children: "Destination / Circuit *" }), _jsx("input", { id: "card-dest", type: "text", className: "form-input", required: true, placeholder: "e.g. Kasi (Varanasi)", value: cardForm.destination, onChange: (e) => setCardForm({ ...cardForm, destination: e.target.value }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-aliases", children: "Destination Aliases / Cities Covered (Optional)" }), _jsx("input", { id: "card-aliases", type: "text", className: "form-input", placeholder: "e.g. Varanasi, Banaras, Kashi, Prayagraj", value: cardForm.destination_aliases, onChange: (e) => setCardForm({ ...cardForm, destination_aliases: e.target.value }) })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-duration", children: "Duration *" }), _jsx("input", { id: "card-duration", type: "text", className: "form-input", required: true, placeholder: "e.g. 5 Days / 4 Nights", value: cardForm.duration, onChange: (e) => setCardForm({ ...cardForm, duration: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-dates", children: "Travel Dates / Availability" }), _jsx("input", { id: "card-dates", type: "text", className: "form-input", placeholder: "e.g. Departs every Wednesday & Friday", value: cardForm.travel_dates, onChange: (e) => setCardForm({ ...cardForm, travel_dates: e.target.value }) })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-price-display", children: "Price or Price Range (Display) *" }), _jsx("input", { id: "card-price-display", type: "text", className: "form-input", required: true, placeholder: "e.g. \u20B916,500 per person or \u20B915,000 - \u20B918,000", value: cardForm.price_display, onChange: (e) => setCardForm({ ...cardForm, price_display: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-price-min", children: "Numeric Min Price (for search filters)" }), _jsx("input", { id: "card-price-min", type: "number", className: "form-input", placeholder: "16500", value: cardForm.price_min, onChange: (e) => setCardForm({ ...cardForm, price_min: Number(e.target.value) }) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-itinerary", children: "Day-by-Day Itinerary / Description *" }), _jsx("textarea", { id: "card-itinerary", className: "form-textarea", rows: 5, required: true, placeholder: "Day 1: Departure from Visakhapatnam, evening arrival and Ganga Aarti.\nDay 2: Morning Kashi Vishwanath VIP Darshan...\nDay 3: Prayagraj Sangam excursion...", value: cardForm.itinerary, onChange: (e) => setCardForm({ ...cardForm, itinerary: e.target.value }) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "card-services", children: "Included Services (comma separated)" }), _jsx("input", { id: "card-services", type: "text", className: "form-input", placeholder: "3-Star Hotel AC Stay, Pure Veg Meals, AC Cab Transfers, VIP Darshan Coordinator, Boat Aarti", value: cardForm.included_services, onChange: (e) => setCardForm({ ...cardForm, included_services: e.target.value }) })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }, children: [_jsx("button", { type: "button", className: "btn-secondary", onClick: () => { setIsCreatingCard(false); setEditingCard(null); }, children: "Cancel" }), _jsx("button", { type: "submit", id: "save-trip-card-submit", className: "btn-primary", children: editingCard ? 'Update Trip Card' : 'Publish Trip Card' })] })] }) })] }) })), subscribingPlan && (_jsx("div", { className: "modal-overlay", onClick: () => setSubscribingPlan(null), children: _jsxs("div", { className: "modal-container", style: { maxWidth: '500px' }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsx("h3", { className: "modal-title", children: "Confirm Plan Upgrade" }), _jsx("button", { className: "modal-close-btn", onClick: () => setSubscribingPlan(null), children: "\u00D7" })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { style: { textAlign: 'center', marginBottom: '1.25rem' }, children: [_jsx("div", { style: { fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }, children: subscribingPlan.name }), _jsx("div", { style: { fontSize: '2rem', fontWeight: 800, color: '#0f766e', marginTop: '0.35rem' }, children: subscribingPlan.price_monthly === 0 ? 'Free' : `₹${subscribingPlan.price_monthly} / mo` }), _jsx("p", { style: { fontSize: '0.85rem', color: '#64748b' }, children: "Billed monthly. Cancel anytime with immediate effect." })] }), _jsxs("div", { style: { background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }, children: [_jsx("div", { style: { fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '0.5rem' }, children: "Plan Benefits Included:" }), subscribingPlan.features.map((f, i) => (_jsxs("div", { style: { fontSize: '0.82rem', color: '#475569', display: 'flex', gap: '0.5rem', marginBottom: '4px' }, children: [_jsx(CheckCircle2, { size: 14, color: "#0d9488" }), " ", f] }, i)))] }), _jsxs("div", { style: { background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#065f46' }, children: [_jsx("strong", { children: "Dev/Testing Mode:" }), " Simulated transaction token ready. Clicking below immediately activates the tier and verified badge."] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }, children: [_jsx("button", { className: "btn-secondary", onClick: () => setSubscribingPlan(null), children: "Cancel" }), _jsxs("button", { className: "btn-primary", onClick: () => handleCheckout(subscribingPlan), disabled: checkoutLoading, children: [_jsx(CreditCard, { size: 16 }), checkoutLoading ? 'Processing...' : 'Confirm & Activate Plan'] })] })] })] }) }))] }));
};
