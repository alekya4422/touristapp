import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlannerProfile, TripCard, User, SubscriptionRecord } from '../types';
import {
  Shield, Users, Layers, Award, CheckCircle, Ban, Trash2, Search,
  Filter, ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Eye, ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'planners' | 'cards' | 'users' | 'subscriptions'>('planners');

  // Metrics
  const [metrics, setMetrics] = useState({
    totalPlanners: 0,
    activeCards: 0,
    pendingApprovals: 0,
    activeSubscriptions: 0,
    totalUsers: 0
  });

  // Planners with cards
  const [planners, setPlanners] = useState<PlannerProfile[]>([]);
  const [searchPlanner, setSearchPlanner] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedPlannerId, setExpandedPlannerId] = useState<number | null>(null);

  // Cards Moderation
  const [cards, setCards] = useState<TripCard[]>([]);
  const [searchCard, setSearchCard] = useState('');
  const [cardStatusFilter, setCardStatusFilter] = useState('all');

  // Users & Subscriptions
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch admin metrics
  const fetchMetrics = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch planners & their cards
  const fetchPlanners = async () => {
    if (!token) return;
    try {
      const query = new URLSearchParams();
      if (searchPlanner) query.append('search', searchPlanner);
      if (statusFilter !== 'all') query.append('status', statusFilter);

      const res = await fetch(`/api/admin/planners?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlanners(data.planners || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch cards
  const fetchCards = async () => {
    if (!token) return;
    try {
      const query = new URLSearchParams();
      if (searchCard) query.append('search', searchCard);
      if (cardStatusFilter !== 'all') query.append('status', cardStatusFilter);

      const res = await fetch(`/api/admin/cards?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch users & subscriptions
  const fetchUsersAndSubs = async () => {
    if (!token) return;
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
    } catch (e) {
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
  const handleUpdatePlannerStatus = async (plannerId: number, status: string, verified?: boolean) => {
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
      if (!res.ok) throw new Error(data.error || 'Failed to update planner');
      showToast('Planner status updated successfully.');
      fetchPlanners();
      fetchMetrics();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Moderate Card
  const handleModerateCard = async (cardId: number, admin_status: string) => {
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
      if (!res.ok) throw new Error(data.error || 'Failed to moderate card');
      showToast(`Trip card status changed to ${admin_status}.`);
      fetchCards();
      fetchPlanners();
      fetchMetrics();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Card
  const handleDeleteCard = async (cardId: number) => {
    if (!window.confirm('Are you sure you want to remove this trip card?')) return;
    try {
      const res = await fetch(`/api/admin/cards/${cardId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete card');
      showToast('Trip card removed.');
      fetchCards();
      fetchPlanners();
      fetchMetrics();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', paddingBottom: '4rem' }}>
      {/* Toast Alert */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Admin Title Row */}
      <div className="dashboard-header">
        <div className="dashboard-title-row">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <Shield size={20} color="#0f766e" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: '#0f766e', letterSpacing: '0.05em' }}>
                SUPER ADMINISTRATOR DASHBOARD
              </span>
            </div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Platform Moderation & Operations</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-badge approved">Admin Authorized</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ maxWidth: '1280px', margin: '1.5rem auto 0', display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem' }}>
          <button
            className={`nav-btn ${activeTab === 'planners' ? 'active' : ''}`}
            onClick={() => { setActiveTab('planners'); fetchPlanners(); }}
          >
            <Users size={16} /> Planners & Cards View ({metrics.totalPlanners})
          </button>
          <button
            className={`nav-btn ${activeTab === 'cards' ? 'active' : ''}`}
            onClick={() => { setActiveTab('cards'); fetchCards(); }}
          >
            <Layers size={16} /> All Trip Cards ({metrics.activeCards})
          </button>
          <button
            className={`nav-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveTab('subscriptions')}
          >
            <Award size={16} /> Subscriptions ({metrics.activeSubscriptions})
          </button>
          <button
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={16} /> User Registry ({allUsers.length})
          </button>
        </div>
      </div>

      <div className="main-content" style={{ paddingTop: '1.5rem' }}>
        {/* ========================================================
            SUMMARY COUNTS / METRICS GRID
           ======================================================== */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box teal">
              <Users size={24} />
            </div>
            <div>
              <div className="metric-value">{metrics.totalPlanners}</div>
              <div className="metric-label">Total Planners</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box indigo">
              <Layers size={24} />
            </div>
            <div>
              <div className="metric-value">{metrics.activeCards}</div>
              <div className="metric-label">Active Trip Cards</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box amber">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="metric-value">{metrics.pendingApprovals}</div>
              <div className="metric-label">Pending Approvals</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box teal">
              <Award size={24} />
            </div>
            <div>
              <div className="metric-value">{metrics.activeSubscriptions}</div>
              <div className="metric-label">Active Subscriptions</div>
            </div>
          </div>
        </div>

        {/* ========================================================
            TAB 1: PLANNERS & THEIR CARDS TOGETHER
           ======================================================== */}
        {activeTab === 'planners' && (
          <div className="table-card">
            <div className="table-toolbar">
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '500px' }}>
                <div className="input-with-icon" style={{ flex: 1 }}>
                  <Search size={16} className="input-icon" />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Search planners by name, city, language..."
                    value={searchPlanner}
                    onChange={(e) => setSearchPlanner(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchPlanners()}
                  />
                </div>
                <button className="btn-primary" onClick={fetchPlanners}>Search</button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
                <select
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setTimeout(fetchPlanners, 50); }}
                >
                  <option value="all">All Planners</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Planner Details</th>
                  <th>Location & Languages</th>
                  <th>Plan Tier</th>
                  <th>Cards Published</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                  <th>Cards</th>
                </tr>
              </thead>
              <tbody>
                {planners.map((p) => {
                  const isExpanded = expandedPlannerId === p.id;
                  return (
                    <React.Fragment key={p.id}>
                      <tr>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={p.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                              alt={p.full_name}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {p.full_name}
                                {p.verified && <ShieldCheck size={14} color="#0284c7" />}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {p.contact_email} • {p.contact_phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.86rem', color: '#334155' }}>{p.location}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.languages}</div>
                        </td>

                        <td>
                          <span className={`role-pill ${p.current_plan === 'pro' ? 'planner' : 'traveler'}`}>
                            {p.current_plan.toUpperCase()}
                          </span>
                        </td>

                        <td>
                          <strong>{p.cards?.length || 0}</strong> cards
                        </td>

                        <td>
                          <span className={`status-badge ${p.user_status || 'active'}`}>
                            {p.user_status || 'active'}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            {p.user_status === 'pending' || p.user_status === 'suspended' ? (
                              <button
                                className="btn-primary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                                onClick={() => handleUpdatePlannerStatus(p.id, 'active', true)}
                              >
                                Approve
                              </button>
                            ) : (
                              <button
                                className="btn-secondary"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', color: '#dc2626' }}
                                onClick={() => handleUpdatePlannerStatus(p.id, 'suspended', false)}
                              >
                                Suspend
                              </button>
                            )}
                          </div>
                        </td>

                        <td>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setExpandedPlannerId(isExpanded ? null : p.id)}
                          >
                            <span>Cards ({p.cards?.length || 0})</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>

                      {/* Accordion row showing planner's cards */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} style={{ background: '#f8fafc', padding: '1.25rem' }}>
                            <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                                Trip Cards by {p.full_name}
                              </strong>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                Bio: {p.bio}
                              </span>
                            </div>

                            {(!p.cards || p.cards.length === 0) ? (
                              <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
                                This planner has not created any trip cards yet.
                              </div>
                            ) : (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                                {p.cards.map((c) => (
                                  <div key={c.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f766e' }}>
                                        {c.origin} → {c.destination}
                                      </span>
                                      <span className={`status-badge ${c.admin_status}`}>
                                        {c.admin_status}
                                      </span>
                                    </div>
                                    <h5 style={{ fontSize: '0.95rem', color: '#0f172a', marginBottom: '0.4rem' }}>{c.title}</h5>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.65rem' }}>
                                      {c.duration} • <strong>{c.price_display}</strong>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.35rem' }}>
                                      {c.admin_status !== 'approved' && (
                                        <button
                                          className="btn-primary"
                                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                          onClick={() => handleModerateCard(c.id, 'approved')}
                                        >
                                          Approve
                                        </button>
                                      )}
                                      {c.admin_status !== 'flagged' && (
                                        <button
                                          className="btn-secondary"
                                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', color: '#b45309' }}
                                          onClick={() => handleModerateCard(c.id, 'flagged')}
                                        >
                                          Flag
                                        </button>
                                      )}
                                      <button
                                        className="btn-danger"
                                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem' }}
                                        onClick={() => handleDeleteCard(c.id)}
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================
            TAB 2: ALL TRIP CARDS MODERATION
           ======================================================== */}
        {activeTab === 'cards' && (
          <div className="table-card">
            <div className="table-toolbar">
              <div style={{ display: 'flex', gap: '0.75rem', flex: 1, maxWidth: '480px' }}>
                <div className="input-with-icon" style={{ flex: 1 }}>
                  <Search size={16} className="input-icon" />
                  <input
                    type="text"
                    className="text-input"
                    placeholder="Search cards by title, route, planner..."
                    value={searchCard}
                    onChange={(e) => setSearchCard(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchCards()}
                  />
                </div>
                <button className="btn-primary" onClick={fetchCards}>Search</button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Moderation:</span>
                <select
                  className="filter-select"
                  value={cardStatusFilter}
                  onChange={(e) => { setCardStatusFilter(e.target.value); setTimeout(fetchCards, 50); }}
                >
                  <option value="all">All Statuses</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="flagged">Flagged</option>
                </select>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Card Title & Route</th>
                  <th>Planner</th>
                  <th>Price Display</th>
                  <th>Duration</th>
                  <th>Public Status</th>
                  <th>Admin Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{card.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#0f766e', marginTop: '2px' }}>
                        {card.origin} → {card.destination}
                        {card.destination_aliases && ` (${card.destination_aliases})`}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                        {card.planner_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {card.planner_location}
                      </div>
                    </td>

                    <td><strong>{card.price_display}</strong></td>
                    <td>{card.duration}</td>

                    <td>
                      <span className={`status-badge ${card.is_published ? 'approved' : 'suspended'}`}>
                        {card.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge ${card.admin_status}`}>
                        {card.admin_status}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {card.admin_status !== 'approved' && (
                          <button
                            className="btn-primary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                            onClick={() => handleModerateCard(card.id, 'approved')}
                          >
                            Approve
                          </button>
                        )}
                        {card.admin_status !== 'flagged' && (
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem', color: '#b45309' }}
                            onClick={() => handleModerateCard(card.id, 'flagged')}
                          >
                            Flag
                          </button>
                        )}
                        <button
                          className="btn-danger"
                          style={{ padding: '0.3rem 0.55rem', fontSize: '0.75rem' }}
                          onClick={() => handleDeleteCard(card.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================
            TAB 3: SUBSCRIPTIONS AUDIT
           ======================================================== */}
        {activeTab === 'subscriptions' && (
          <div className="table-card">
            <div className="table-toolbar">
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Planner Subscriptions & Revenue Log</h3>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Subscription ID</th>
                  <th>Planner</th>
                  <th>Plan Tier</th>
                  <th>Billing Cycle</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Expires / Renewal</th>
                  <th>Payment Mode</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s) => (
                  <tr key={s.id}>
                    <td><code>#SUB-{s.id}</code></td>
                    <td>
                      <strong>{s.planner_name}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.planner_email}</div>
                    </td>
                    <td>
                      <span className={`role-pill ${s.plan_id === 'pro' ? 'planner' : 'traveler'}`}>
                        {s.plan_name}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{s.billing_period}</td>
                    <td><strong>₹{s.price}</strong></td>
                    <td>
                      <span className={`status-badge ${s.status}`}>{s.status}</span>
                    </td>
                    <td>{new Date(s.expires_at).toLocaleDateString()}</td>
                    <td><code>{s.payment_method}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================
            TAB 4: USER REGISTRY
           ======================================================== */}
        {activeTab === 'users' && (
          <div className="table-card">
            <div className="table-toolbar">
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a' }}>Platform User Registry</h3>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Platform Role</th>
                  <th>Phone Number</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((u) => (
                  <tr key={u.id}>
                    <td><code>#{u.id}</code></td>
                    <td><strong>{u.full_name}</strong></td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-pill ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`status-badge ${u.status}`}>{u.status}</span>
                    </td>
                    <td>{new Date(u.created_at || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
