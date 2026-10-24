import React from 'react';
import { MapPin, Calendar, Clock, Star, ShieldCheck, PhoneCall, ChevronRight, Check } from 'lucide-react';
import { TripCard } from '../types';

interface TripCardItemProps {
  card: TripCard;
  onSelectContact: (card: TripCard) => void;
  onViewDetails: (card: TripCard) => void;
}

export const TripCardItem: React.FC<TripCardItemProps> = ({ card, onSelectContact, onViewDetails }) => {
  const servicesList = card.included_services
    ? card.included_services.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <article className="trip-card" id={`trip-card-${card.id}`}>
      {/* Top Route Banner */}
      <div className="card-top-bar">
        <div className="route-pill">
          <MapPin size={14} color="#5eead4" />
          <span>{card.origin}</span>
          <span style={{ opacity: 0.6 }}>→</span>
          <span>{card.destination}</span>
        </div>
        <div className="duration-pill">
          <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
          {card.duration}
        </div>
      </div>

      <div className="card-body">
        {/* Destination Alias / Pilgrimage Info */}
        {card.destination_aliases && (
          <div className="alias-tag">
            Also covers: {card.destination_aliases}
          </div>
        )}

        <h3 className="card-title" onClick={() => onViewDetails(card)} style={{ cursor: 'pointer' }}>
          {card.title}
        </h3>

        {/* Itinerary Preview */}
        <p className="itinerary-preview">
          {card.itinerary}
        </p>

        {/* Included Services Chips */}
        {servicesList.length > 0 && (
          <div className="services-tags">
            {servicesList.slice(0, 3).map((srv, i) => (
              <span key={i} className="service-chip">
                <Check size={11} color="#0d9488" style={{ display: 'inline', marginRight: '3px' }} />
                {srv}
              </span>
            ))}
            {servicesList.length > 3 && (
              <span className="service-chip" style={{ background: '#e2e8f0', color: '#475569' }}>
                +{servicesList.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Planner Info Box */}
        <div className="card-planner-box" onClick={() => onViewDetails(card)} style={{ cursor: 'pointer' }}>
          <div className="planner-avatar-wrap">
            <img
              src={card.planner_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
              alt={card.planner_name || 'Trip Planner'}
              className="planner-avatar"
            />
            {card.planner_verified && (
              <div className="verified-icon" title="Verified Local Trip Planner">
                <ShieldCheck size={12} />
              </div>
            )}
          </div>
          <div className="planner-meta">
            <div className="planner-name">
              {card.planner_name || 'Local Expert'}
            </div>
            <div className="planner-location">
              {card.planner_location || card.origin}
            </div>
          </div>
          {card.planner_rating && (
            <div className="rating-badge">
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
              <span>{card.planner_rating.toFixed(1)}</span>
              {card.planner_reviews_count ? (
                <span style={{ fontSize: '0.7rem', color: '#78350f', fontWeight: 500 }}>
                  ({card.planner_reviews_count})
                </span>
              ) : null}
            </div>
          )}
        </div>

        {/* Departure dates */}
        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
          <Calendar size={13} color="#0d9488" />
          <span>{card.travel_dates || 'Flexible departures'}</span>
        </div>

        {/* Card Footer with Price & Contact Button */}
        <div className="card-footer">
          <div className="price-box">
            <span className="price-label">Pricing</span>
            <span className="price-value">{card.price_display}</span>
          </div>

          <button
            className="contact-btn"
            id={`contact-btn-${card.id}`}
            onClick={() => onSelectContact(card)}
          >
            <PhoneCall size={14} />
            Contact Planner
          </button>
        </div>
      </div>
    </article>
  );
};
