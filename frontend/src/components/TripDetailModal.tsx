import React, { useEffect, useState } from 'react';
import { X, MapPin, Clock, Calendar, Star, ShieldCheck, Check, PhoneCall, User } from 'lucide-react';
import { TripCard, PlannerProfile } from '../types';

interface TripDetailModalProps {
  card: TripCard;
  onClose: () => void;
  onContact: (card: TripCard) => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({ card, onClose, onContact }) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [planner, setPlanner] = useState<PlannerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetails() {
      try {
        const res = await fetch(`/api/trips/${card.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data.reviews || []);
          setPlanner(data.planner || null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [card.id]);

  const itineraryDays = card.itinerary.split('\n').filter(Boolean);
  const services = card.included_services ? card.included_services.split(',').map(s => s.trim()) : [];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <span className="route-pill" style={{ background: '#0f766e', color: '#fff', padding: '0.15rem 0.6rem', borderRadius: '4px' }}>
                {card.origin} → {card.destination}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                <Clock size={12} style={{ display: 'inline', marginRight: '3px' }} />
                {card.duration}
              </span>
            </div>
            <h3 className="modal-title" style={{ fontSize: '1.25rem' }}>{card.title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Planner summary box */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <img
                src={card.planner_avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'}
                alt={card.planner_name}
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{card.planner_name}</strong>
                  {card.planner_verified && <ShieldCheck size={16} color="#0284c7" />}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {card.planner_location} • {card.languages || card.planner_languages}
                </div>
                {card.planner_rating && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: '#b45309', marginTop: '2px' }}>
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <strong>{card.planner_rating.toFixed(1)}</strong> ({card.planner_reviews_count || reviews.length} reviews)
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Starting from</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f766e' }}>{card.price_display}</div>
            </div>
          </div>

          {/* Planner Bio if present */}
          {planner?.bio && (
            <div style={{ marginBottom: '1.5rem', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '0.85rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', fontWeight: 700, color: '#0f766e', marginBottom: '0.25rem' }}>
                About the Planner
              </div>
              <p style={{ fontSize: '0.86rem', color: '#134e4a', lineHeight: 1.5 }}>{planner.bio}</p>
            </div>
          )}

          {/* Full Itinerary Breakdown */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#0f766e" /> Complete Day-by-Day Itinerary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {itineraryDays.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.85rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 0.9rem' }}>
                  <div style={{ minWidth: '32px', height: '32px', borderRadius: '50%', background: '#f0fdfa', color: '#0f766e', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5 }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Included Services */}
          {services.length > 0 && (
            <div style={{ marginBottom: '1.75rem' }}>
              <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.65rem' }}>
                Included Amenities & Services
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                {services.map((srv, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: '#334155' }}>
                    <Check size={14} color="#059669" />
                    <span>{srv}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews section */}
          {reviews.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={16} fill="#f59e0b" color="#f59e0b" /> Traveler Feedback & Reviews ({reviews.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {reviews.map((r) => (
                  <div key={r.id} style={{ background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.85rem', color: '#1e293b' }}>{r.reviewer_name}</strong>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} size={11} fill="#f59e0b" color="#f59e0b" />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#475569', fontStyle: 'italic' }}>
                      "{r.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Departure Schedule</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{card.travel_dates}</div>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                onClose();
                onContact(card);
              }}
            >
              <PhoneCall size={16} /> Contact {card.planner_name?.split(' ')[0] || 'Planner'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
