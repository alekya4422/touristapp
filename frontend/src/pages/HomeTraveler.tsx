import React, { useState, useEffect } from 'react';
import { HeroSearch } from '../components/HeroSearch';
import { TripCardItem } from '../components/TripCardItem';
import { ContactModal } from '../components/ContactModal';
import { TripDetailModal } from '../components/TripDetailModal';
import { TripCard } from '../types';
import { Compass, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const HomeTraveler: React.FC = () => {
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedContactCard, setSelectedContactCard] = useState<TripCard | null>(null);
  const [selectedDetailCard, setSelectedDetailCard] = useState<TripCard | null>(null);
  const [currentSearchParams, setCurrentSearchParams] = useState<{
    origin: string;
    destination: string;
    travel_date: string;
    max_price: string;
    languages: string;
  }>({
    origin: '',
    destination: '',
    travel_date: '',
    max_price: '',
    languages: ''
  });

  const fetchTrips = async (params: {
    origin: string;
    destination: string;
    travel_date: string;
    max_price: string;
    languages: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (params.origin) query.append('origin', params.origin);
      if (params.destination) query.append('destination', params.destination);
      if (params.travel_date) query.append('travel_date', params.travel_date);
      if (params.max_price) query.append('max_price', params.max_price);
      if (params.languages) query.append('languages', params.languages);

      const res = await fetch(`/api/trips/search?${query.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to retrieve trip plans from server.');
      }
      const data = await res.json();
      setTrips(data.trips || []);
      setCurrentSearchParams(params);
    } catch (err: any) {
      setError(err.message || 'Error connecting to the travel network.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch of popular/featured trip plans
    fetchTrips(currentSearchParams);
  }, []);

  const hasSearchFilter = Boolean(
    currentSearchParams.origin || currentSearchParams.destination || currentSearchParams.max_price || currentSearchParams.languages
  );

  return (
    <div>
      {/* Hero with Interactive Search */}
      <HeroSearch onSearch={fetchTrips} loading={loading} />

      {/* Main Trip Results Section */}
      <main className="main-content">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              {hasSearchFilter ? (
                <>
                  Matching Trip Plans{' '}
                  {currentSearchParams.origin && `from ${currentSearchParams.origin}`}{' '}
                  {currentSearchParams.destination && `to ${currentSearchParams.destination}`}
                </>
              ) : (
                'Featured Planner Itineraries & Pilgrimages'
              )}
            </h2>
            <p className="section-subtitle">
              {loading
                ? 'Searching verified itineraries...'
                : `Showing ${trips.length} expert-crafted travel options with direct planner assistance.`}
            </p>
          </div>

          {hasSearchFilter && (
            <button
              className="btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
              onClick={() => {
                const emptyParams = { origin: '', destination: '', travel_date: '', max_price: '', languages: '' };
                fetchTrips(emptyParams);
              }}
            >
              <RefreshCw size={14} style={{ display: 'inline', marginRight: '5px' }} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.75rem' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} style={{ background: '#fff', borderRadius: '14px', height: '360px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'pulse 1.5s infinite' }}>
                <div style={{ height: '30px', background: '#f1f5f9', borderRadius: '6px' }} />
                <div style={{ height: '24px', background: '#f1f5f9', width: '70%', borderRadius: '4px' }} />
                <div style={{ height: '70px', background: '#f8fafc', borderRadius: '8px' }} />
                <div style={{ height: '50px', background: '#f1f5f9', borderRadius: '8px', marginTop: 'auto' }} />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="state-box">
            <div className="state-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <AlertCircle size={28} />
            </div>
            <h3 className="state-title">Unable to load trip plans</h3>
            <p className="state-desc">{error}</p>
            <button className="btn-primary" onClick={() => fetchTrips(currentSearchParams)}>
              Try Again
            </button>
          </div>
        )}

        {/* Empty Results State */}
        {!loading && !error && trips.length === 0 && (
          <div className="state-box" id="empty-results-box">
            <div className="state-icon">
              <Compass size={28} />
            </div>
            <h3 className="state-title">No matching trip cards found</h3>
            <p className="state-desc">
              We couldn't find itineraries matching "{currentSearchParams.origin ? currentSearchParams.origin + ' → ' : ''}{currentSearchParams.destination}".
              Try searching popular routes like <strong>Visakhapatnam to Kasi</strong>, <strong>Kochi to Munnar</strong>, or clear your filters.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                fetchTrips({ origin: 'Visakhapatnam', destination: 'Kasi', travel_date: '', max_price: '', languages: '' });
              }}
            >
              <Sparkles size={16} /> Search "Visakhapatnam to Kasi"
            </button>
          </div>
        )}

        {/* Trip Cards Grid */}
        {!loading && !error && trips.length > 0 && (
          <div className="cards-grid" id="trip-cards-grid">
            {trips.map((card) => (
              <TripCardItem
                key={card.id}
                card={card}
                onSelectContact={(c) => setSelectedContactCard(c)}
                onViewDetails={(c) => setSelectedDetailCard(c)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Contact Planner Modal */}
      {selectedContactCard && (
        <ContactModal
          card={selectedContactCard}
          onClose={() => setSelectedContactCard(null)}
        />
      )}

      {/* Trip Details Modal */}
      {selectedDetailCard && (
        <TripDetailModal
          card={selectedDetailCard}
          onClose={() => setSelectedDetailCard(null)}
          onContact={(c) => {
            setSelectedDetailCard(null);
            setSelectedContactCard(c);
          }}
        />
      )}
    </div>
  );
};
