import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { X, Phone, Mail, MessageSquare, CheckCircle, ShieldCheck, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export const ContactModal = ({ card, onClose }) => {
    const { user, token } = useAuth();
    const [name, setName] = useState(user?.full_name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [travelDate, setTravelDate] = useState('');
    const [groupSize, setGroupSize] = useState('2');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unlockedData, setUnlockedData] = useState(null);
    const [copied, setCopied] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim() || !phone.trim() || !email.trim()) {
            setError('Please provide your name, phone number, and email.');
            return;
        }
        setLoading(true);
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (token)
                headers['Authorization'] = `Bearer ${token}`;
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
        }
        catch (err) {
            setError(err.message || 'Error contacting planner');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, children: _jsxs("div", { className: "modal-container", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "modal-header", children: [_jsxs("div", { children: [_jsx("h3", { className: "modal-title", children: unlockedData ? 'Direct Planner Contact Unlocked' : 'Contact Trip Planner' }), _jsxs("p", { style: { fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }, children: [card.title, " (", card.origin, " \u2192 ", card.destination, ")"] })] }), _jsx("button", { className: "modal-close-btn", onClick: onClose, children: _jsx(X, { size: 20 }) })] }), _jsx("div", { className: "modal-body", children: unlockedData ? (_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { width: '52px', height: '52px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }, children: _jsx(CheckCircle, { size: 32 }) }), _jsxs("h4", { style: { fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.4rem' }, children: ["Inquiry Sent to ", unlockedData.planner_name || card.planner_name, "!"] }), _jsx("p", { style: { fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }, children: "Your request details have been transmitted. You can now call, WhatsApp, or email the planner directly:" }), _jsxs("div", { className: "unlocked-contact-box", children: [unlockedData.phone && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #bbf7d0' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.6rem' }, children: [_jsx(Phone, { size: 18, color: "#059669" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }, children: "Phone / Mobile" }), _jsx("strong", { style: { fontSize: '1.05rem', color: '#064e3b' }, children: unlockedData.phone })] })] }), _jsxs("div", { style: { display: 'flex', gap: '0.4rem' }, children: [_jsx("a", { href: `tel:${unlockedData.phone}`, className: "btn-primary", style: { padding: '0.4rem 0.75rem', fontSize: '0.8rem' }, children: "Call Now" }), _jsx("button", { className: "btn-secondary", onClick: () => handleCopy(unlockedData.phone), style: { padding: '0.4rem 0.65rem' }, title: "Copy phone", children: copied ? _jsx(Check, { size: 14, color: "#059669" }) : _jsx(Copy, { size: 14 }) })] })] })), unlockedData.whatsapp && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #bbf7d0' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.6rem' }, children: [_jsx(MessageSquare, { size: 18, color: "#16a34a" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }, children: "WhatsApp Chat" }), _jsx("strong", { style: { fontSize: '1.05rem', color: '#064e3b' }, children: unlockedData.whatsapp })] })] }), _jsx("a", { href: `https://wa.me/${unlockedData.whatsapp.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(unlockedData.planner_name || '')},%20I%20saw%20your%20trip%20plan%20"${encodeURIComponent(card.title)}"%20on%20TripPlanner.`, target: "_blank", rel: "noopener noreferrer", className: "btn-primary", style: { padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: '#16a34a' }, children: "Open WhatsApp" })] })), unlockedData.email && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.6rem' }, children: [_jsx(Mail, { size: 18, color: "#059669" }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.75rem', color: '#065f46', fontWeight: 600 }, children: "Direct Email" }), _jsx("span", { style: { fontSize: '0.92rem', color: '#064e3b', fontWeight: 600 }, children: unlockedData.email })] })] }), _jsx("a", { href: `mailto:${unlockedData.email}?subject=Inquiry:%20${encodeURIComponent(card.title)}`, className: "btn-secondary", style: { padding: '0.4rem 0.75rem', fontSize: '0.8rem' }, children: "Send Email" })] }))] }), _jsx("button", { className: "btn-primary", onClick: onClose, style: { marginTop: '1.5rem', width: '100%' }, children: "Close & Return to Search" })] })) : (_jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { style: { background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }, children: [_jsx("img", { src: card.planner_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80', alt: card.planner_name, style: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' } }), _jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }, children: card.planner_name }), _jsxs("div", { style: { fontSize: '0.78rem', color: '#64748b' }, children: [card.planner_location, " \u2022 ", card.planner_languages] })] })] }), error && (_jsx("div", { style: { background: '#fee2e2', color: '#991b1b', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }, children: error })), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "contact-name", children: "Your Full Name *" }), _jsx("input", { id: "contact-name", type: "text", className: "form-input", required: true, value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. Ramesh Kumar" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "contact-phone", children: "Phone Number *" }), _jsx("input", { id: "contact-phone", type: "tel", className: "form-input", required: true, value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "+91 98765 43210" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "contact-email", children: "Email Address *" }), _jsx("input", { id: "contact-email", type: "email", className: "form-input", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "you@example.com" })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "contact-date", children: "Intended Travel Date" }), _jsx("input", { id: "contact-date", type: "date", className: "form-input", value: travelDate, onChange: (e) => setTravelDate(e.target.value) })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "contact-group", children: "Group Size (Members)" }), _jsx("input", { id: "contact-group", type: "number", min: "1", max: "50", className: "form-input", value: groupSize, onChange: (e) => setGroupSize(e.target.value) })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", htmlFor: "contact-msg", children: "Requirements / Notes for Planner" }), _jsx("textarea", { id: "contact-msg", className: "form-textarea", placeholder: "e.g. Need hotel stay near Kashi Vishwanath temple, senior citizen friendly transport, pure vegetarian meals...", value: message, onChange: (e) => setMessage(e.target.value) })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.78rem', color: '#64748b' }, children: [_jsx(ShieldCheck, { size: 16, color: "#059669" }), _jsx("span", { children: "Your contact info is shared only with this verified trip planner." })] }), _jsxs("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }, children: [_jsx("button", { type: "button", className: "btn-secondary", onClick: onClose, disabled: loading, children: "Cancel" }), _jsxs("button", { type: "submit", id: "submit-inquiry-btn", className: "btn-primary", disabled: loading, children: [_jsx(Phone, { size: 16 }), loading ? 'Connecting...' : 'Request & Reveal Direct Phone'] })] })] })) })] }) }));
};
