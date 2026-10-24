import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { X, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export const AuthModal = ({ initialMode, onClose }) => {
    const { login, register, quickLoginAs } = useAuth();
    const [mode, setMode] = useState(initialMode);
    const [role, setRole] = useState('traveler');
    // Form states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('Visakhapatnam, Andhra Pradesh');
    const [languages, setLanguages] = useState('Telugu, Hindi, English');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            if (mode === 'login') {
                const res = await login(email, password);
                if (!res.success)
                    throw new Error(res.error || 'Login failed');
                onClose();
            }
            else {
                const payload = {
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
                if (!res.success)
                    throw new Error(res.error || 'Registration failed');
                onClose();
            }
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDemoFill = async (r) => {
        await quickLoginAs(r);
        onClose();
    };
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-container", style: { maxWidth: '480px' }, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { style: { display: 'flex', gap: '0.5rem' }, children: [_jsxs("button", { className: `nav-btn ${mode === 'login' ? 'active' : ''}`, onClick: () => { setMode('login'); setError(null); }, children: [_jsx(LogIn, { size: 15 }), " Login"] }), _jsxs("button", { className: `nav-btn ${mode === 'register' ? 'active' : ''}`, onClick: () => { setMode('register'); setError(null); }, children: [_jsx(UserPlus, { size: 15 }), " Register"] })] }), _jsx("button", { className: "modal-close-btn", onClick: onClose, children: _jsx(X, { size: 20 }) })] }), _jsxs("div", { className: "modal-body", children: [_jsxs("div", { style: { background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem' }, children: [_jsxs("div", { style: { fontSize: '0.78rem', fontWeight: 700, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.4rem' }, children: [_jsx(Sparkles, { size: 13 }), " Quick One-Click Demo Logins:"] }), _jsxs("div", { style: { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }, children: [_jsx("button", { type: "button", className: "btn-secondary", style: { padding: '0.25rem 0.6rem', fontSize: '0.75rem' }, onClick: () => handleDemoFill('traveler'), children: "Traveler (Ananya)" }), _jsx("button", { type: "button", className: "btn-secondary", style: { padding: '0.25rem 0.6rem', fontSize: '0.75rem' }, onClick: () => handleDemoFill('planner'), children: "Planner (Ramesh)" }), _jsx("button", { type: "button", className: "btn-secondary", style: { padding: '0.25rem 0.6rem', fontSize: '0.75rem' }, onClick: () => handleDemoFill('admin'), children: "Admin (Superadmin)" })] })] }), error && (_jsx("div", { style: { background: '#fee2e2', color: '#991b1b', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }, children: error })), _jsxs("form", { onSubmit: handleSubmit, children: [mode === 'register' && (_jsxs(_Fragment, { children: [_jsxs("div", { style: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' }, children: [_jsx("button", { type: "button", className: `btn-secondary ${role === 'traveler' ? 'active' : ''}`, style: { flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: role === 'traveler' ? '#e0e7ff' : '#fff', borderColor: role === 'traveler' ? '#6366f1' : '#cbd5e1' }, onClick: () => setRole('traveler'), children: "I am a Traveler" }), _jsx("button", { type: "button", className: `btn-secondary ${role === 'planner' ? 'active' : ''}`, style: { flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: role === 'planner' ? '#ccfbf1' : '#fff', borderColor: role === 'planner' ? '#0d9488' : '#cbd5e1' }, onClick: () => setRole('planner'), children: "I am a Trip Planner" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "reg-name", children: "Full Name *" }), _jsx("input", { id: "reg-name", type: "text", className: "form-input", required: true, value: fullName, onChange: (e) => setFullName(e.target.value), placeholder: "e.g. Ramesh Varma" })] })] })), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "auth-email", children: "Email Address *" }), _jsx("input", { id: "auth-email", type: "email", className: "form-input", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "name@example.com" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "auth-pwd", children: "Password *" }), _jsx("input", { id: "auth-pwd", type: "password", className: "form-input", required: true, minLength: 6, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "Minimum 6 characters" })] }), mode === 'register' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "reg-phone", children: "Phone Number" }), _jsx("input", { id: "reg-phone", type: "tel", className: "form-input", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "+91 89190 23456" })] }), role === 'planner' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "reg-loc", children: "Operating Location / Base City *" }), _jsx("input", { id: "reg-loc", type: "text", className: "form-input", required: true, value: location, onChange: (e) => setLocation(e.target.value), placeholder: "e.g. Visakhapatnam, Andhra Pradesh" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "reg-langs", children: "Languages Spoken" }), _jsx("input", { id: "reg-langs", type: "text", className: "form-input", value: languages, onChange: (e) => setLanguages(e.target.value), placeholder: "e.g. Telugu, Hindi, English" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "reg-bio", children: "Short Description / Bio" }), _jsx("textarea", { id: "reg-bio", className: "form-textarea", rows: 3, value: bio, onChange: (e) => setBio(e.target.value), placeholder: "Specializing in Varanasi (Kasi) pilgrimages, VIP darshans, and family tours." })] })] }))] })), _jsx("button", { type: "submit", id: "auth-submit-btn", className: "btn-primary", style: { width: '100%', marginTop: '0.75rem' }, disabled: loading, children: loading ? 'Please wait...' : mode === 'login' ? 'Log In to Account' : 'Complete Registration' })] })] })] }) }));
};
