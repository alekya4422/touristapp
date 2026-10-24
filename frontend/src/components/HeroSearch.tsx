import React, { useState } from 'react';
import { Search, MapPin, Calendar, Compass, Sparkles, Filter, IndianRupee } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (params: {
    origin: string;
    destination: string;
    travel_date: string;
    max_price: string;
    languages: string;
  }) => void;
  loading: boolean;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearch, loading }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [languages, setLanguages] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      origin,
      destination,
      travel_date: travelDate,
      max_price: maxPrice,
      languages
    });
  };

  const handleQuickRoute = (orig: string, dest: string) => {
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

  const isKasiSearch =
    destination.toLowerCase().includes('kasi') ||
    destination.toLowerCase().includes('varanasi') ||
    destination.toLowerCase().includes('banaras') ||
    destination.toLowerCase().includes('kashi');

  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-badge">
          <Sparkles size={14} color="#059669" />
          <span>Verified Local Travel Planners & Custom Itineraries</span>
        </div>

        <h1 className="hero-title">
          Plan Your Next Journey With <span>Trusted Local Experts</span>
        </h1>

        <p className="hero-subtitle">
          Connect directly with experienced trip planners who know the routes, sacred darshans, hidden gems, and local logistics inside out.
        </p>

        {/* Search Card */}
        <div className="search-card-wrapper">
          <form onSubmit={handleSubmit}>
            <div className="search-grid">
              {/* Origin */}
              <div className="search-field">
                <label className="field-label" htmlFor="origin-input">
                  <MapPin size={12} /> Origin / Starting City
                </label>
                <div className="input-with-icon">
                  <Compass size={17} className="input-icon" />
                  <input
                    id="origin-input"
                    type="text"
                    className="text-input"
                    placeholder="e.g. Visakhapatnam, Delhi, Kochi"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                  />
                </div>
              </div>

              {/* Destination */}
              <div className="search-field">
                <label className="field-label" htmlFor="dest-input">
                  <MapPin size={12} /> Destination / Pilgrimage
                </label>
                <div className="input-with-icon">
                  <MapPin size={17} className="input-icon" />
                  <input
                    id="dest-input"
                    type="text"
                    className="text-input"
                    placeholder="e.g. Kasi (Varanasi), Munnar, Manali"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                  />
                </div>
              </div>

              {/* Travel Date */}
              <div className="search-field">
                <label className="field-label" htmlFor="date-input">
                  <Calendar size={12} /> Travel Date
                </label>
                <div className="input-with-icon">
                  <Calendar size={17} className="input-icon" />
                  <input
                    id="date-input"
                    type="date"
                    className="text-input"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="search-button"
                className="search-submit-btn"
                disabled={loading}
              >
                <Search size={18} />
                {loading ? 'Searching...' : 'Search Plans'}
              </button>
            </div>

            {/* Smart Synonym Recognition Alert */}
            {isKasiSearch && (
              <div className="alias-banner">
                <Sparkles size={16} color="#16a34a" />
                <span>
                  <strong>Pilgrimage Synonym Recognized:</strong> Searching for both <strong>Kasi</strong> and <strong>Varanasi (Banaras / Kashi)</strong> routes and darshan specialists.
                </span>
              </div>
            )}

            {/* Secondary Filters Toggle */}
            <div className="secondary-filters-bar">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0f766e',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  cursor: 'pointer'
                }}
              >
                <Filter size={14} />
                {showFilters ? 'Hide Advanced Filters' : 'More Filters (Budget, Language)'}
              </button>

              {showFilters && (
                <div className="filters-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <IndianRupee size={14} color="#64748b" />
                    <select
                      className="filter-select"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    >
                      <option value="">Any Budget</option>
                      <option value="15000">Under ₹15,000</option>
                      <option value="20000">Under ₹20,000</option>
                      <option value="30000">Under ₹30,000</option>
                    </select>
                  </div>

                  <select
                    className="filter-select"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                  >
                    <option value="">All Guide Languages</option>
                    <option value="Telugu">Telugu Guide</option>
                    <option value="Hindi">Hindi Guide</option>
                    <option value="English">English Guide</option>
                    <option value="Malayalam">Malayalam Guide</option>
                  </select>

                  {(origin || destination || maxPrice || languages) && (
                    <button
                      type="button"
                      onClick={() => {
                        setOrigin('');
                        setDestination('');
                        setTravelDate('');
                        setMaxPrice('');
                        setLanguages('');
                        onSearch({ origin: '', destination: '', travel_date: '', max_price: '', languages: '' });
                      }}
                      style={{
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '0.35rem 0.65rem',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Reset All
                    </button>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Quick Example Searches */}
        <div className="quick-tags-container">
          <span className="quick-tag-label">Popular Searches:</span>
          <button
            className="quick-tag-btn"
            id="quick-vizag-kasi"
            onClick={() => handleQuickRoute('Visakhapatnam', 'Kasi')}
          >
            <Sparkles size={12} color="#0f766e" /> Visakhapatnam to Kasi (Varanasi)
          </button>
          <button
            className="quick-tag-btn"
            onClick={() => handleQuickRoute('Visakhapatnam', 'Varanasi')}
          >
            Vizag to Varanasi
          </button>
          <button
            className="quick-tag-btn"
            onClick={() => handleQuickRoute('Kochi', 'Munnar')}
          >
            Kochi to Munnar
          </button>
          <button
            className="quick-tag-btn"
            onClick={() => handleQuickRoute('Delhi', 'Manali')}
          >
            Delhi to Manali
          </button>
          <button
            className="quick-tag-btn"
            onClick={() => handleQuickRoute('Jaipur', 'Jaisalmer')}
          >
            Jaipur to Jaisalmer
          </button>
        </div>
      </div>
    </section>
  );
};
