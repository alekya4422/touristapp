import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { HeroSearch } from '../components/HeroSearch';
import { TripCardItem } from '../components/TripCardItem';
import { ContactModal } from '../components/ContactModal';
import { TripDetailModal } from '../components/TripDetailModal';
import { Compass, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
export const HomeTraveler = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedContactCard, setSelectedContactCard] = useState(null);
    const [selectedDetailCard, setSelectedDetailCard] = useState(null);
    const [currentSearchParams, setCurrentSearchParams] = useState({
        origin: '',
        destination: '',
        travel_date: '',
        max_price: '',
        languages: ''
    });
    const fetchTrips = async (params) => {
        setLoading(true);
        setError(null);
        try {
            const query = new URLSearchParams();
            if (params.origin)
                query.append('origin', params.origin);
            if (params.destination)
                query.append('destination', params.destination);
            if (params.travel_date)
                query.append('travel_date', params.travel_date);
            if (params.max_price)
                query.append('max_price', params.max_price);
            if (params.languages)
                query.append('languages', params.languages);
            const res = await fetch(`/api/trips/search?${query.toString()}`);
            if (!res.ok) {
                throw new Error('Failed to retrieve trip plans from server.');
            }
            const data = await res.json();
            setTrips(data.trips || []);
            setCurrentSearchParams(params);
        }
        catch (err) {
            setError(err.message || 'Error connecting to the travel network.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        // Initial fetch of popular/featured trip plans
        fetchTrips(currentSearchParams);
    }, []);
    const hasSearchFilter = Boolean(currentSearchParams.origin || currentSearchParams.destination || currentSearchParams.max_price || currentSearchParams.languages);
    return (_jsxs("div", { children: [_jsx(HeroSearch, { onSearch: fetchTrips, loading: loading }), _jsxs("main", { className: "main-content", children: [_jsxs("div", { className: "section-header", children: [_jsxs("div", { children: [_jsx("h2", { className: "section-title", children: hasSearchFilter ? (_jsxs(_Fragment, { children: ["Matching Trip Plans", ' ', currentSearchParams.origin && `from ${currentSearchParams.origin}`, ' ', currentSearchParams.destination && `to ${currentSearchParams.destination}`] })) : ('Featured Planner Itineraries & Pilgrimages') }), _jsx("p", { className: "section-subtitle", children: loading
                                            ? 'Searching verified itineraries...'
                                            : `Showing ${trips.length} expert-crafted travel options with direct planner assistance.` })] }), hasSearchFilter && (_jsxs("button", { className: "btn-secondary", style: { fontSize: '0.85rem', padding: '0.45rem 0.85rem' }, onClick: () => {
                                    const emptyParams = { origin: '', destination: '', travel_date: '', max_price: '', languages: '' };
                                    fetchTrips(emptyParams);
                                }, children: [_jsx(RefreshCw, { size: 14, style: { display: 'inline', marginRight: '5px' } }), "Clear Filters"] }))] }), loading && (_jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }, children: [1, 2, 3].map((n) => (_jsxs("div", { style: { background: '#fff', borderRadius: '14px', height: '360px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'pulse 1.5s infinite' }, children: [_jsx("div", { style: { height: '30px', background: '#f1f5f9', borderRadius: '6px' } }), _jsx("div", { style: { height: '24px', background: '#f1f5f9', width: '70%', borderRadius: '4px' } }), _jsx("div", { style: { height: '70px', background: '#f8fafc', borderRadius: '8px' } }), _jsx("div", { style: { height: '50px', background: '#f1f5f9', borderRadius: '8px', marginTop: 'auto' } })] }, n))) })), !loading && error && (_jsxs("div", { className: "state-box", children: [_jsx("div", { className: "state-icon", style: { background: '#fee2e2', color: '#dc2626' }, children: _jsx(AlertCircle, { size: 28 }) }), _jsx("h3", { className: "state-title", children: "Unable to load trip plans" }), _jsx("p", { className: "state-desc", children: error }), _jsx("button", { className: "btn-primary", onClick: () => fetchTrips(currentSearchParams), children: "Try Again" })] })), !loading && !error && trips.length === 0 && (_jsxs("div", { className: "state-box", id: "empty-results-box", children: [_jsx("div", { className: "state-icon", children: _jsx(Compass, { size: 28 }) }), _jsx("h3", { className: "state-title", children: "No matching trip cards found" }), _jsxs("p", { className: "state-desc", children: ["We couldn't find itineraries matching \"", currentSearchParams.origin ? currentSearchParams.origin + ' → ' : '', currentSearchParams.destination, "\". Try searching popular routes like ", _jsx("strong", { children: "Visakhapatnam to Kasi" }), ", ", _jsx("strong", { children: "Kochi to Munnar" }), ", or clear your filters."] }), _jsxs("button", { className: "btn-primary", onClick: () => {
                                    fetchTrips({ origin: 'Visakhapatnam', destination: 'Kasi', travel_date: '', max_price: '', languages: '' });
                                }, children: [_jsx(Sparkles, { size: 16 }), " Search \"Visakhapatnam to Kasi\""] })] })), !loading && !error && trips.length > 0 && (_jsx("div", { className: "cards-grid", id: "trip-cards-grid", children: trips.map((card) => (_jsx(TripCardItem, { card: card, onSelectContact: (c) => setSelectedContactCard(c), onViewDetails: (c) => setSelectedDetailCard(c) }, card.id))) }))] }), selectedContactCard && (_jsx(ContactModal, { card: selectedContactCard, onClose: () => setSelectedContactCard(null) })), selectedDetailCard && (_jsx(TripDetailModal, { card: selectedDetailCard, onClose: () => setSelectedDetailCard(null), onContact: (c) => {
                    setSelectedDetailCard(null);
                    setSelectedContactCard(c);
                } }))] }));
};
