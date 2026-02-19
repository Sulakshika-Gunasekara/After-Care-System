import { useState, useEffect } from 'react';
import { loyaltyAPI } from '../utils/api';

export default function Loyalty() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    Promise.all([
      loyaltyAPI.getOverview(),
      loyaltyAPI.getHistory()
    ]).then(([overview, hist]) => {
      setData(overview);
      setHistory(hist.history);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>;
  if (!data) return <div className="empty-state"><p>Failed to load loyalty data</p></div>;

  const tierConfig = [
    { name: 'None', icon: '⚪', color: 'var(--gray-400)', bg: 'var(--gray-100)' },
    { name: 'Silver Member', icon: '🥉', color: '#666', bg: '#f0f0f0' },
    { name: 'Ruby Member', icon: '🥈', color: '#c62828', bg: '#fce4ec' },
    { name: 'Sapphire Elite', icon: '🥇', color: '#1565c0', bg: '#e3f2fd' }
  ];

  return (
    <div>
      {/* Tier Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {data.tiers?.map((tier, i) => (
          <div key={tier.name} className="card" style={{ textAlign: 'center', padding: '28px 20px', background: tierConfig[i]?.bg, border: `2px solid ${tierConfig[i]?.color}20` }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{tierConfig[i]?.icon}</div>
            <h3 style={{ fontSize: '1rem', color: tierConfig[i]?.color, marginBottom: '4px' }}>{tier.name === 'None' ? 'Regular' : tier.name}</h3>
            <div style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', fontWeight: 700, color: tierConfig[i]?.color }}>
              {tier.count}
            </div>
            <p className="text-sm text-gray" style={{ marginTop: '4px' }}>
              {tier.min > 0 ? `${tier.min}+ purchases` : 'All customers'}
            </p>
            {tier.benefits?.length > 0 && (
              <div style={{ marginTop: '12px', textAlign: 'left' }}>
                {tier.benefits.map(b => (
                  <p key={b} className="text-sm" style={{ color: tierConfig[i]?.color, padding: '2px 0' }}>✓ {b}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Upcoming Upgrades */}
        <div className="card">
          <div className="card-header">
            <h3>🚀 Near Upgrade</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Current</th><th>Next Tier</th><th>Needed</th></tr>
              </thead>
              <tbody>
                {data.upcomingUpgrades?.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td className="text-sm">{c.loyalty_level || 'Regular'}</td>
                    <td><span className="badge badge-gold">{c.next_tier}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--red)' }}>{c.purchases_needed}</span>
                      <span className="text-sm text-gray"> purchase{c.purchases_needed > 1 ? 's' : ''}</span>
                    </td>
                  </tr>
                ))}
                {(!data.upcomingUpgrades || data.upcomingUpgrades.length === 0) && (
                  <tr><td colSpan={4} className="text-center text-gray">No upcoming upgrades</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tier Change History */}
        <div className="card">
          <div className="card-header">
            <h3>📜 Tier History</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr><th>Customer</th><th>Change</th><th>Date</th></tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight: 500 }}>{h.customer_name}</td>
                    <td className="text-sm">
                      {h.previous_tier || 'None'} → <strong style={{ color: 'var(--green)' }}>{h.new_tier}</strong>
                    </td>
                    <td className="text-sm text-gray">{new Date(h.changed_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr><td colSpan={3} className="text-center text-gray">No tier changes yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tier Benefits Info */}
      <div className="card mt-3">
        <div className="card-header"><h3>💎 How It Works</h3></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🛍️</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Make Purchases</h4>
              <p className="text-sm text-gray">Every purchase counts towards your loyalty tier</p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>⬆️</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Tier Upgrade</h4>
              <p className="text-sm text-gray">Automatically upgrade when you reach the threshold</p>
            </div>
            <div>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎁</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>Enjoy Benefits</h4>
              <p className="text-sm text-gray">Unlock exclusive discounts, free services, and VIP access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
