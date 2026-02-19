import { useState, useEffect } from 'react';
import { feedbackAPI } from '../utils/api';

export default function Feedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    feedbackAPI.getAll().then(d => { setFeedbackList(d.feedback); setStats(d.stats); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>;

  const renderStars = (val) => {
    if (!val) return '—';
    return '★'.repeat(Math.round(val)) + '☆'.repeat(5 - Math.round(val));
  };

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-label">Total Reviews</div>
          <div className="stat-value">{stats.total || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">😊</div>
          <div className="stat-label">Satisfaction</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.avg_satisfaction || '—'}/5</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-label">Stone Quality</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.avg_stone_quality || '—'}/5</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">Packaging</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.avg_packaging || '—'}/5</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-label">Delivery</div>
          <div className="stat-value" style={{ color: 'var(--gold)' }}>{stats.avg_delivery || '—'}/5</div>
        </div>
      </div>

      {/* Review Cards */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {feedbackList.map(f => (
          <div key={f.id} className="card">
            <div className="card-body">
              <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>{f.customer_name}</h4>
                  <p className="text-sm text-gray">{new Date(f.created_at).toLocaleDateString()}</p>
                </div>
                <button className="btn btn-danger btn-sm" onClick={async () => { await feedbackAPI.delete(f.id); load(); }}>🗑</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <RatingBox label="Satisfaction" value={f.satisfaction} />
                <RatingBox label="Stone Quality" value={f.stone_quality} />
                <RatingBox label="Packaging" value={f.packaging} />
                <RatingBox label="Delivery" value={f.delivery} />
              </div>

              {f.comments && (
                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '14px', fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--gray-600)' }}>
                  "{f.comments}"
                </div>
              )}

              {f.discount_code && (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-gray">Discount code:</span>
                  <span className="badge badge-green" style={{ fontFamily: 'monospace' }}>{f.discount_code}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {feedbackList.length === 0 && (
          <div className="empty-state">
            <div className="icon">⭐</div>
            <p>No feedback yet. Reviews will appear here after customers submit them.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function RatingBox({ label, value }) {
  const color = !value ? 'var(--gray-400)' : value >= 4 ? 'var(--green)' : value >= 3 ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ textAlign: 'center', padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)' }}>
      <p className="text-sm" style={{ marginBottom: '4px', fontWeight: 500 }}>{label}</p>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color }}>
        {value || '—'}
      </div>
      <div style={{ color: 'var(--gold)', fontSize: '0.75rem', letterSpacing: '1px' }}>
        {value ? '★'.repeat(Math.round(value)) + '☆'.repeat(5 - Math.round(value)) : ''}
      </div>
    </div>
  );
}
