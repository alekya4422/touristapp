import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Compass, Shield, Briefcase, LogIn, LogOut, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export const Navbar = ({ currentView, setCurrentView, openAuthModal }) => {
    const { user, plannerProfile, logout, quickLoginAs } = useAuth();
    return (_jsx("header", { className: "app-header", children: _jsxs("div", { className: "header-container", children: [_jsxs("div", { className: "brand-logo", onClick: () => setCurrentView('traveler'), children: [_jsx("div", { className: "brand-icon-box", children: _jsx(Compass, { size: 24 }) }), _jsxs("div", { children: [_jsx("span", { className: "brand-title", children: "TripPlanner" }), _jsx("div", { style: { fontSize: '0.65rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em' }, children: "MARKETPLACE" })] })] }), _jsxs("nav", { className: "nav-links", children: [_jsxs("button", { className: `nav-btn ${currentView === 'traveler' ? 'active' : ''}`, onClick: () => setCurrentView('traveler'), children: [_jsx(Compass, { size: 16 }), "Explore Trips"] }), _jsxs("button", { className: `nav-btn ${currentView === 'planner' ? 'active' : ''}`, onClick: () => {
                                if (!user || user.role !== 'planner') {
                                    // If not logged in as planner, auto switch to demo planner for seamless testing
                                    quickLoginAs('planner');
                                }
                                setCurrentView('planner');
                            }, children: [_jsx(Briefcase, { size: 16 }), "Planner Portal", plannerProfile?.current_plan === 'pro' && (_jsx("span", { style: { fontSize: '0.68rem', background: '#dcfce7', color: '#15803d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }, children: "PRO" }))] }), _jsxs("button", { className: `nav-btn ${currentView === 'admin' ? 'active' : ''}`, onClick: () => {
                                if (!user || user.role !== 'admin') {
                                    // If not logged in as admin, auto switch to demo admin for seamless testing
                                    quickLoginAs('admin');
                                }
                                setCurrentView('admin');
                            }, children: [_jsx(Shield, { size: 16 }), "Admin Portal"] })] }), _jsxs("div", { className: "header-auth", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#f8fafc', padding: '0.2rem 0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }, children: [_jsxs("span", { style: { fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }, children: [_jsx(Sparkles, { size: 12, color: "#0d9488" }), " Demo:"] }), _jsx("button", { onClick: () => { quickLoginAs('traveler'); setCurrentView('traveler'); }, title: "Login as Traveler", style: {
                                        background: user?.role === 'traveler' ? '#0d9488' : '#fff',
                                        color: user?.role === 'traveler' ? '#fff' : '#475569',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        padding: '0.2rem 0.45rem',
                                        cursor: 'pointer'
                                    }, children: "Traveler" }), _jsx("button", { onClick: () => { quickLoginAs('planner'); setCurrentView('planner'); }, title: "Login as Verified Planner (Ramesh Varma)", style: {
                                        background: user?.role === 'planner' ? '#0d9488' : '#fff',
                                        color: user?.role === 'planner' ? '#fff' : '#475569',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        padding: '0.2rem 0.45rem',
                                        cursor: 'pointer'
                                    }, children: "Planner" }), _jsx("button", { onClick: () => { quickLoginAs('admin'); setCurrentView('admin'); }, title: "Login as Super Administrator", style: {
                                        background: user?.role === 'admin' ? '#0d9488' : '#fff',
                                        color: user?.role === 'admin' ? '#fff' : '#475569',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        fontSize: '0.72rem',
                                        fontWeight: 600,
                                        padding: '0.2rem 0.45rem',
                                        cursor: 'pointer'
                                    }, children: "Admin" })] }), user ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.65rem' }, children: [_jsxs("div", { className: "user-badge", children: [_jsx("img", { src: user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80', alt: user.full_name, className: "avatar-img" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column' }, children: [_jsx("span", { style: { fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }, children: user.full_name.split(' ')[0] }), _jsx("span", { className: `role-pill ${user.role}`, children: user.role })] })] }), _jsx("button", { className: "nav-btn", onClick: logout, title: "Logout", style: { padding: '0.45rem', color: '#dc2626' }, children: _jsx(LogOut, { size: 18 }) })] })) : (_jsxs("div", { style: { display: 'flex', gap: '0.45rem' }, children: [_jsxs("button", { className: "nav-btn", onClick: () => openAuthModal('login'), children: [_jsx(LogIn, { size: 16 }), " Login"] }), _jsxs("button", { className: "btn-primary", style: { padding: '0.45rem 0.85rem', fontSize: '0.85rem' }, onClick: () => openAuthModal('register'), children: [_jsx(UserPlus, { size: 15 }), " Join"] })] }))] })] }) }));
};
