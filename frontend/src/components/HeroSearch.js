import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Search, MapPin, Calendar, Compass, Sparkles, Filter, IndianRupee } from 'lucide-react';
export const HeroSearch = ({ onSearch, loading }) => {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [travelDate, setTravelDate] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [languages, setLanguages] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const handleSubmit = (e) => {
        if (e)
            e.preventDefault();
        onSearch({
            origin,
            destination,
            travel_date: travelDate,
            max_price: maxPrice,
            languages
        });
    };
    const handleQuickRoute = (orig, dest) => {
        setOrigin(orig);
        setDestination(dest);
        onSearch({
            origin: orig,
            destination: dest,
            travel_date: travelDate,
            max_price: maxPrice,
            languages
        });
    };
    const isKasiSearch = destination.toLowerCase().includes('kasi') ||
        destination.toLowerCase().includes('varanasi') ||
        destination.toLowerCase().includes('banaras') ||
        destination.toLowerCase().includes('kashi');
    return (_jsx("section", { className: "hero-section", children: _jsxs("div", { className: "hero-content", children: [_jsxs("div", { className: "hero-badge", children: [_jsx(Sparkles, { size: 14, color: "#059669" }), _jsx("span", { children: "Verified Local Travel Planners & Custom Itineraries" })] }), _jsxs("h1", { className: "hero-title", children: ["Plan Your Next Journey With ", _jsx("span", { children: "Trusted Local Experts" })] }), _jsx("p", { className: "hero-subtitle", children: "Connect directly with experienced trip planners who know the routes, sacred darshans, hidden gems, and local logistics inside out." }), _jsx("div", { className: "search-card-wrapper", children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "search-grid", children: [_jsxs("div", { className: "search-field", children: [_jsxs("label", { className: "field-label", htmlFor: "origin-input", children: [_jsx(MapPin, { size: 12 }), " Origin / Starting City"] }), _jsxs("div", { className: "input-with-icon", children: [_jsx(Compass, { size: 17, className: "input-icon" }), _jsx("input", { id: "origin-input", type: "text", className: "text-input", placeholder: "e.g. Visakhapatnam, Delhi, Kochi", value: origin, onChange: (e) => setOrigin(e.target.value) })] })] }), _jsxs("div", { className: "search-field", children: [_jsxs("label", { className: "field-label", htmlFor: "dest-input", children: [_jsx(MapPin, { size: 12 }), " Destination / Pilgrimage"] }), _jsxs("div", { className: "input-with-icon", children: [_jsx(MapPin, { size: 17, className: "input-icon" }), _jsx("input", { id: "dest-input", type: "text", className: "text-input", placeholder: "e.g. Kasi (Varanasi), Munnar, Manali", value: destination, onChange: (e) => setDestination(e.target.value) })] })] }), _jsxs("div", { className: "search-field", children: [_jsxs("label", { className: "field-label", htmlFor: "date-input", children: [_jsx(Calendar, { size: 12 }), " Travel Date"] }), _jsxs("div", { className: "input-with-icon", children: [_jsx(Calendar, { size: 17, className: "input-icon" }), _jsx("input", { id: "date-input", type: "date", className: "text-input", value: travelDate, onChange: (e) => setTravelDate(e.target.value) })] })] }), _jsxs("button", { type: "submit", id: "search-button", className: "search-submit-btn", disabled: loading, children: [_jsx(Search, { size: 18 }), loading ? 'Searching...' : 'Search Plans'] })] }), isKasiSearch && (_jsxs("div", { className: "alias-banner", children: [_jsx(Sparkles, { size: 16, color: "#16a34a" }), _jsxs("span", { children: [_jsx("strong", { children: "Pilgrimage Synonym Recognized:" }), " Searching for both ", _jsx("strong", { children: "Kasi" }), " and ", _jsx("strong", { children: "Varanasi (Banaras / Kashi)" }), " routes and darshan specialists."] })] })), _jsxs("div", { className: "secondary-filters-bar", children: [_jsxs("button", { type: "button", onClick: () => setShowFilters(!showFilters), style: {
                                            background: 'none',
                                            border: 'none',
                                            color: '#0f766e',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            cursor: 'pointer'
                                        }, children: [_jsx(Filter, { size: 14 }), showFilters ? 'Hide Advanced Filters' : 'More Filters (Budget, Language)'] }), showFilters && (_jsxs("div", { className: "filters-group", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.4rem' }, children: [_jsx(IndianRupee, { size: 14, color: "#64748b" }), _jsxs("select", { className: "filter-select", value: maxPrice, onChange: (e) => setMaxPrice(e.target.value), children: [_jsx("option", { value: "", children: "Any Budget" }), _jsx("option", { value: "15000", children: "Under \u20B915,000" }), _jsx("option", { value: "20000", children: "Under \u20B920,000" }), _jsx("option", { value: "30000", children: "Under \u20B930,000" })] })] }), _jsxs("select", { className: "filter-select", value: languages, onChange: (e) => setLanguages(e.target.value), children: [_jsx("option", { value: "", children: "All Guide Languages" }), _jsx("option", { value: "Telugu", children: "Telugu Guide" }), _jsx("option", { value: "Hindi", children: "Hindi Guide" }), _jsx("option", { value: "English", children: "English Guide" }), _jsx("option", { value: "Malayalam", children: "Malayalam Guide" })] }), (origin || destination || maxPrice || languages) && (_jsx("button", { type: "button", onClick: () => {
                                                    setOrigin('');
                                                    setDestination('');
                                                    setTravelDate('');
                                                    setMaxPrice('');
                                                    setLanguages('');
                                                    onSearch({ origin: '', destination: '', travel_date: '', max_price: '', languages: '' });
                                                }, style: {
                                                    background: '#f1f5f9',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '6px',
                                                    padding: '0.35rem 0.65rem',
                                                    fontSize: '0.8rem',
                                                    cursor: 'pointer'
                                                }, children: "Reset All" }))] }))] })] }) }), _jsxs("div", { className: "quick-tags-container", children: [_jsx("span", { className: "quick-tag-label", children: "Popular Searches:" }), _jsxs("button", { className: "quick-tag-btn", id: "quick-vizag-kasi", onClick: () => handleQuickRoute('Visakhapatnam', 'Kasi'), children: [_jsx(Sparkles, { size: 12, color: "#0f766e" }), " Visakhapatnam to Kasi (Varanasi)"] }), _jsx("button", { className: "quick-tag-btn", onClick: () => handleQuickRoute('Visakhapatnam', 'Varanasi'), children: "Vizag to Varanasi" }), _jsx("button", { className: "quick-tag-btn", onClick: () => handleQuickRoute('Kochi', 'Munnar'), children: "Kochi to Munnar" }), _jsx("button", { className: "quick-tag-btn", onClick: () => handleQuickRoute('Delhi', 'Manali'), children: "Delhi to Manali" }), _jsx("button", { className: "quick-tag-btn", onClick: () => handleQuickRoute('Jaipur', 'Jaisalmer'), children: "Jaipur to Jaisalmer" })] })] }) }));
};
