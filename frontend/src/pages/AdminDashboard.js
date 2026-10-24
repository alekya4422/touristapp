import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Layers, Award, CheckCircle, Trash2, Search, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck } from 'lucide-react';
export const AdminDashboard = () => {
    const { user, token } = useAuth();
    const [activeTab, setActiveTab] = useState('planners');
    // Metrics
    const [metrics, setMetrics] = useState({
        totalPlanners: 0,
        activeCards: 0,
        pendingApprovals: 0,
        activeSubscriptions: 0,
        totalUsers: 0
    });
    // Planners with cards
    const [planners, setPlanners] = useState([]);
    const [searchPlanner, setSearchPlanner] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedPlannerId, setExpandedPlannerId] = useState(null);
    // Cards Moderation
    const [cards, setCards] = useState([]);
    const [searchCard, setSearchCard] = useState('');
    const [cardStatusFilter, setCardStatusFilter] = useState('all');
    // Users & Subscriptions
    const [allUsers, setAllUsers] = useState([]);
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };
    // Fetch admin metrics
    const fetchMetrics = async () => {
        if (!token)
            return;
        try {
            const res = await fetch('/api/admin/metrics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMetrics(data.metrics);
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    // Fetch planners & their cards
    const fetchPlanners = async () => {
        if (!token)
            return;
        try {
            const query = new URLSearchParams();
            if (searchPlanner)
                query.append('search', searchPlanner);
            if (statusFilter !== 'all')
                query.append('status', statusFilter);
            const res = await fetch(`/api/admin/planners?${query.toString()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setPlanners(data.planners || []);
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    // Fetch cards
    const fetchCards = async () => {
        if (!token)
            return;
        try {
            const query = new URLSearchParams();
            if (searchCard)
                query.append('search', searchCard);
            if (cardStatusFilter !== 'all')
                query.append('status', cardStatusFilter);
            const res = await fetch(`/api/admin/cards?${query.toString()}`, {
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
    };
    // Fetch users & subscriptions
    const fetchUsersAndSubs = async () => {
        if (!token)
            return;
        try {
            const [uRes, sRes] = await Promise.all([
                fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
                fetch('/api/admin/subscriptions', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            if (uRes.ok) {
                const uData = await uRes.json();
                setAllUsers(uData.users || []);
            }
            if (sRes.ok) {
                const sData = await sRes.json();
                setSubscriptions(sData.subscriptions || []);
            }
        }
        catch (e) {
            console.error(e);
        }
    };
    useEffect(() => {
        setLoading(true);
        Promise.all([fetchMetrics(), fetchPlanners(), fetchCards(), fetchUsersAndSubs()]).finally(() => {
            setLoading(false);
        });
    }, [token]);
    // Update Planner Status (approve / suspend / activate)
    const handleUpdatePlannerStatus = async (plannerId, status, verified) => {
        try {
            const res = await fetch(`/api/admin/planners/${plannerId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status, verified })
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Failed to update planner');
            showToast('Planner status updated successfully.');
            fetchPlanners();
            fetchMetrics();
        }
        catch (err) {
            showToast(err.message, 'error');
        }
    };
    // Moderate Card
    const handleModerateCard = async (cardId, admin_status) => {
        try {
            const res = await fetch(`/api/admin/cards/${cardId}/moderate`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ admin_status })
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Failed to moderate card');
            showToast(`Trip card status changed to ${admin_status}.`);
            fetchCards();
            fetchPlanners();
            fetchMetrics();
        }
        catch (err) {
            showToast(err.message, 'error');
        }
    };
    // Delete Card
    const handleDeleteCard = async (cardId) => {
        if (!window.confirm('Are you sure you want to remove this trip card?'))
            return;
        try {
            const res = await fetch(`/api/admin/cards/${cardId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.error || 'Failed to delete card');
            showToast('Trip card removed.');
            fetchCards();
            fetchPlanners();
            fetchMetrics();
        }
        catch (err) {
            showToast(err.message, 'error');
        }
    };
    return (_jsxs("div", { style: { background: '#f8fafc', minHeight: '90vh', paddingBottom: '4rem' }, children: [toast && (_jsx("div", { className: "toast-container", children: _jsxs("div", { className: `toast ${toast.type}`, children: [toast.type === 'success' ? _jsx(CheckCircle, { size: 18 }) : _jsx(AlertTriangle, { size: 18 }), _jsx("span", { children: toast.msg })] }) })), _jsxs("div", { className: "dashboard-header", children: [_jsxs("div", { className: "dashboard-title-row", children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }, children: [_jsx(Shield, { size: 20, color: "#0f766e" }), _jsx("span", { style: { fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f766e', letterSpacing: '0.05em' }, children: "SUPER ADMINISTRATOR DASHBOARD" })] }), _jsx("h1", { style: { fontSize: '1.6rem', color: '#0f172a' }, children: "Platform Moderation & Operations" })] }), _jsx("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: _jsx("span", { className: "status-badge approved", children: "Admin Authorized" }) })] }), _jsxs("div", { style: { maxWidth: '1280px', margin: '1.5rem auto 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }, children: [_jsxs("button", { className: `nav-btn ${activeTab === 'planners' ? 'active' : ''}`, onClick: () => { setActiveTab('planners'); fetchPlanners(); }, children: [_jsx(Users, { size: 16 }), " Planners & Cards View (", metrics.totalPlanners, ")"] }), _jsxs("button", { className: `nav-btn ${activeTab === 'cards' ? 'active' : ''}`, onClick: () => { setActiveTab('cards'); fetchCards(); }, children: [_jsx(Layers, { size: 16 }), " All Trip Cards (", metrics.activeCards, ")"] }), _jsxs("button", { className: `nav-btn ${activeTab === 'subscriptions' ? 'active' : ''}`, onClick: () => setActiveTab('subscriptions'), children: [_jsx(Award, { size: 16 }), " Subscriptions (", metrics.activeSubscriptions, ")"] }), _jsxs("button", { className: `nav-btn ${activeTab === 'users' ? 'active' : ''}`, onClick: () => setActiveTab('users'), children: [_jsx(Users, { size: 16 }), " User Registry (", allUsers.length, ")"] })] })] }), _jsxs("div", { className: "main-content", style: { paddingTop: '1.5rem' }, children: [_jsxs("div", { className: "metrics-grid", children: [_jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-icon-box teal", children: _jsx(Users, { size: 24 }) }), _jsxs("div", { children: [_jsx("div", { className: "metric-value", children: metrics.totalPlanners }), _jsx("div", { className: "metric-label", children: "Total Planners" })] })] }), _jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-icon-box indigo", children: _jsx(Layers, { size: 24 }) }), _jsxs("div", { children: [_jsx("div", { className: "metric-value", children: metrics.activeCards }), _jsx("div", { className: "metric-label", children: "Active Trip Cards" })] })] }), _jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-icon-box amber", children: _jsx(AlertTriangle, { size: 24 }) }), _jsxs("div", { children: [_jsx("div", { className: "metric-value", children: metrics.pendingApprovals }), _jsx("div", { className: "metric-label", children: "Pending Approvals" })] })] }), _jsxs("div", { className: "metric-card", children: [_jsx("div", { className: "metric-icon-box teal", children: _jsx(Award, { size: 24 }) }), _jsxs("div", { children: [_jsx("div", { className: "metric-value", children: metrics.activeSubscriptions }), _jsx("div", { className: "metric-label", children: "Active Subscriptions" })] })] })] }), activeTab === 'planners' && (_jsxs("div", { className: "table-card", children: [_jsxs("div", { className: "table-toolbar", children: [_jsxs("div", { style: { display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '500px' }, children: [_jsxs("div", { className: "input-with-icon", style: { flex: 1 }, children: [_jsx(Search, { size: 16, className: "input-icon" }), _jsx("input", { type: "text", className: "text-input", placeholder: "Search planners by name, city, language...", value: searchPlanner, onChange: (e) => setSearchPlanner(e.target.value), onKeyDown: (e) => e.key === 'Enter' && fetchPlanners() })] }), _jsx("button", { className: "btn-primary", onClick: fetchPlanners, children: "Search" })] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }, children: "Status:" }), _jsxs("select", { className: "filter-select", value: statusFilter, onChange: (e) => { setStatusFilter(e.target.value); setTimeout(fetchPlanners, 50); }, children: [_jsx("option", { value: "all", children: "All Planners" }), _jsx("option", { value: "active", children: "Active" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "suspended", children: "Suspended" })] })] })] }), _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Planner Details" }), _jsx("th", { children: "Location & Languages" }), _jsx("th", { children: "Plan Tier" }), _jsx("th", { children: "Cards Published" }), _jsx("th", { children: "Account Status" }), _jsx("th", { children: "Actions" }), _jsx("th", { children: "Cards" })] }) }), _jsx("tbody", { children: planners.map((p) => {
                                            const isExpanded = expandedPlannerId === p.id;
                                            return (_jsxs(React.Fragment, { children: [_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }, children: [_jsx("img", { src: p.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', alt: p.full_name, style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' } }), _jsxs("div", { children: [_jsxs("div", { style: { fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }, children: [p.full_name, p.verified && _jsx(ShieldCheck, { size: 14, color: "#0284c7" })] }), _jsxs("div", { style: { fontSize: '0.75rem', color: '#64748b' }, children: [p.contact_email, " \u2022 ", p.contact_phone] })] })] }) }), _jsxs("td", { children: [_jsx("div", { style: { fontSize: '0.86rem', color: '#334155' }, children: p.location }), _jsx("div", { style: { fontSize: '0.75rem', color: '#64748b' }, children: p.languages })] }), _jsx("td", { children: _jsx("span", { className: `role-pill ${p.current_plan === 'pro' ? 'planner' : 'traveler'}`, children: p.current_plan.toUpperCase() }) }), _jsxs("td", { children: [_jsx("strong", { children: p.cards?.length || 0 }), " cards"] }), _jsx("td", { children: _jsx("span", { className: `status-badge ${p.user_status || 'active'}`, children: p.user_status || 'active' }) }), _jsx("td", { children: _jsx("div", { style: { display: 'flex', gap: '0.4rem' }, children: p.user_status === 'pending' || p.user_status === 'suspended' ? (_jsx("button", { className: "btn-primary", style: { padding: '0.35rem 0.65rem', fontSize: '0.78rem' }, onClick: () => handleUpdatePlannerStatus(p.id, 'active', true), children: "Approve" })) : (_jsx("button", { className: "btn-secondary", style: { padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#dc2626' }, onClick: () => handleUpdatePlannerStatus(p.id, 'suspended', false), children: "Suspend" })) }) }), _jsx("td", { children: _jsxs("button", { className: "btn-secondary", style: { padding: '0.35rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }, onClick: () => setExpandedPlannerId(isExpanded ? null : p.id), children: [_jsxs("span", { children: ["Cards (", p.cards?.length || 0, ")"] }), isExpanded ? _jsx(ChevronUp, { size: 14 }) : _jsx(ChevronDown, { size: 14 })] }) })] }), isExpanded && (_jsx("tr", { children: _jsxs("td", { colSpan: 7, style: { background: '#f8fafc', padding: '1.25rem' }, children: [_jsxs("div", { style: { marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("strong", { style: { fontSize: '0.9rem', color: '#0f172a' }, children: ["Trip Cards by ", p.full_name] }), _jsxs("span", { style: { fontSize: '0.8rem', color: '#64748b' }, children: ["Bio: ", p.bio] })] }), (!p.cards || p.cards.length === 0) ? (_jsx("div", { style: { fontSize: '0.84rem', color: '#64748b' }, children: "This planner has not created any trip cards yet." })) : (_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }, children: p.cards.map((c) => (_jsxs("div", { style: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }, children: [_jsxs("span", { style: { fontSize: '0.78rem', fontWeight: 700, color: '#0f766e' }, children: [c.origin, " \u2192 ", c.destination] }), _jsx("span", { className: `status-badge ${c.admin_status}`, children: c.admin_status })] }), _jsx("h5", { style: { fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.4rem' }, children: c.title }), _jsxs("div", { style: { fontSize: '0.8rem', color: '#64748b', marginBottom: '0.65rem' }, children: [c.duration, " \u2022 ", _jsx("strong", { children: c.price_display })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }, children: [c.admin_status !== 'approved' && (_jsx("button", { className: "btn-primary", style: { padding: '0.25rem 0.55rem', fontSize: '0.75rem' }, onClick: () => handleModerateCard(c.id, 'approved'), children: "Approve" })), c.admin_status !== 'flagged' && (_jsx("button", { className: "btn-secondary", style: { padding: '0.25rem 0.55rem', fontSize: '0.75rem', color: '#b45309' }, onClick: () => handleModerateCard(c.id, 'flagged'), children: "Flag" })), _jsx("button", { className: "btn-danger", style: { padding: '0.25rem 0.55rem', fontSize: '0.75rem' }, onClick: () => handleDeleteCard(c.id), children: "Delete" })] })] }, c.id))) }))] }) }))] }, p.id));
                                        }) })] })] })), activeTab === 'cards' && (_jsxs("div", { className: "table-card", children: [_jsxs("div", { className: "table-toolbar", children: [_jsxs("div", { style: { display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '480px' }, children: [_jsxs("div", { className: "input-with-icon", style: { flex: 1 }, children: [_jsx(Search, { size: 16, className: "input-icon" }), _jsx("input", { type: "text", className: "text-input", placeholder: "Search cards by title, route, planner...", value: searchCard, onChange: (e) => setSearchCard(e.target.value), onKeyDown: (e) => e.key === 'Enter' && fetchCards() })] }), _jsx("button", { className: "btn-primary", onClick: fetchCards, children: "Search" })] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' }, children: [_jsx("span", { style: { fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }, children: "Moderation:" }), _jsxs("select", { className: "filter-select", value: cardStatusFilter, onChange: (e) => { setCardStatusFilter(e.target.value); setTimeout(fetchCards, 50); }, children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "flagged", children: "Flagged" })] })] })] }), _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Card Title & Route" }), _jsx("th", { children: "Planner" }), _jsx("th", { children: "Price Display" }), _jsx("th", { children: "Duration" }), _jsx("th", { children: "Public Status" }), _jsx("th", { children: "Admin Status" }), _jsx("th", { children: "Actions" })] }) }), _jsx("tbody", { children: cards.map((card) => (_jsxs("tr", { children: [_jsxs("td", { children: [_jsx("div", { style: { fontWeight: 700, color: '#0f172a' }, children: card.title }), _jsxs("div", { style: { fontSize: '0.78rem', color: '#0f766e', marginTop: '2px' }, children: [card.origin, " \u2192 ", card.destination, card.destination_aliases && ` (${card.destination_aliases})`] })] }), _jsxs("td", { children: [_jsx("div", { style: { fontSize: '0.88rem', color: '#334155', fontWeight: 600 }, children: card.planner_name }), _jsx("div", { style: { fontSize: '0.75rem', color: '#64748b' }, children: card.planner_location })] }), _jsx("td", { children: _jsx("strong", { children: card.price_display }) }), _jsx("td", { children: card.duration }), _jsx("td", { children: _jsx("span", { className: `status-badge ${card.is_published ? 'approved' : 'suspended'}`, children: card.is_published ? 'Live' : 'Draft' }) }), _jsx("td", { children: _jsx("span", { className: `status-badge ${card.admin_status}`, children: card.admin_status }) }), _jsx("td", { children: _jsxs("div", { style: { display: 'flex', gap: '0.35rem' }, children: [card.admin_status !== 'approved' && (_jsx("button", { className: "btn-primary", style: { padding: '0.3rem 0.55rem', fontSize: '0.75rem' }, onClick: () => handleModerateCard(card.id, 'approved'), children: "Approve" })), card.admin_status !== 'flagged' && (_jsx("button", { className: "btn-secondary", style: { padding: '0.3rem 0.55rem', fontSize: '0.75rem', color: '#b45309' }, onClick: () => handleModerateCard(card.id, 'flagged'), children: "Flag" })), _jsx("button", { className: "btn-danger", style: { padding: '0.3rem 0.55rem', fontSize: '0.75rem' }, onClick: () => handleDeleteCard(card.id), children: _jsx(Trash2, { size: 13 }) })] }) })] }, card.id))) })] })] })), activeTab === 'subscriptions' && (_jsxs("div", { className: "table-card", children: [_jsx("div", { className: "table-toolbar", children: _jsx("h3", { style: { fontSize: '1.15rem', color: '#0f172a' }, children: "Planner Subscriptions & Revenue Log" }) }), _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Subscription ID" }), _jsx("th", { children: "Planner" }), _jsx("th", { children: "Plan Tier" }), _jsx("th", { children: "Billing Cycle" }), _jsx("th", { children: "Price" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Expires / Renewal" }), _jsx("th", { children: "Payment Mode" })] }) }), _jsx("tbody", { children: subscriptions.map((s) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("code", { children: ["#SUB-", s.id] }) }), _jsxs("td", { children: [_jsx("strong", { children: s.planner_name }), _jsx("div", { style: { fontSize: '0.75rem', color: '#64748b' }, children: s.planner_email })] }), _jsx("td", { children: _jsx("span", { className: `role-pill ${s.plan_id === 'pro' ? 'planner' : 'traveler'}`, children: s.plan_name }) }), _jsx("td", { style: { textTransform: 'capitalize' }, children: s.billing_period }), _jsx("td", { children: _jsxs("strong", { children: ["\u20B9", s.price] }) }), _jsx("td", { children: _jsx("span", { className: `status-badge ${s.status}`, children: s.status }) }), _jsx("td", { children: new Date(s.expires_at).toLocaleDateString() }), _jsx("td", { children: _jsx("code", { children: s.payment_method }) })] }, s.id))) })] })] })), activeTab === 'users' && (_jsxs("div", { className: "table-card", children: [_jsx("div", { className: "table-toolbar", children: _jsx("h3", { style: { fontSize: '1.15rem', color: '#0f172a' }, children: "Platform User Registry" }) }), _jsxs("table", { className: "data-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "User ID" }), _jsx("th", { children: "Full Name" }), _jsx("th", { children: "Email Address" }), _jsx("th", { children: "Platform Role" }), _jsx("th", { children: "Phone Number" }), _jsx("th", { children: "Account Status" }), _jsx("th", { children: "Joined Date" })] }) }), _jsx("tbody", { children: allUsers.map((u) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("code", { children: ["#", u.id] }) }), _jsx("td", { children: _jsx("strong", { children: u.full_name }) }), _jsx("td", { children: u.email }), _jsx("td", { children: _jsx("span", { className: `role-pill ${u.role}`, children: u.role }) }), _jsx("td", { children: u.phone || '—' }), _jsx("td", { children: _jsx("span", { className: `status-badge ${u.status}`, children: u.status }) }), _jsx("td", { children: new Date(u.created_at || Date.now()).toLocaleDateString() })] }, u.id))) })] })] }))] })] }));
};
