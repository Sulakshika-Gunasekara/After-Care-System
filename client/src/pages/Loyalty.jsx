import { useState, useEffect } from 'react';
import { loyaltyAPI } from '../utils/api';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';

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

  const upgradeColumns = [
    { key: 'name', label: 'Customer', cellStyle: { fontWeight: 500 } },
    { key: 'loyalty_level', label: 'Current', render: (val) => val || 'Regular', cellStyle: { fontSize: '0.85rem' } },
    { key: 'next_tier', label: 'Next Tier', render: (val) => <Badge variant="gold">{val}</Badge> },
    {
      key: 'purchases_needed',
      label: 'Needed',
      render: (val) => (
        <>
          <span style={{ fontWeight: 700, color: 'var(--red)' }}>{val}</span>
          <span className="text-sm text-gray"> purchase{val > 1 ? 's' : ''}</span>
        </>
      )
    }
  ];

  const historyColumns = [
    { key: 'customer_name', label: 'Customer', cellStyle: { fontWeight: 500 } },
    {
      key: 'new_tier',
      label: 'Change',
      render: (val, row) => (
        <span className="text-sm">
          {row.previous_tier || 'None'} → <strong style={{ color: 'var(--green)' }}>{val}</strong>
        </span>
      )
    },
    { key: 'changed_at', label: 'Date', cellStyle: { color: 'var(--gray)', fontSize: '0.85rem' }, render: (val) => new Date(val).toLocaleDateString() }
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
            <DataTable columns={upgradeColumns} data={data.upcomingUpgrades} emptyMessage="No upcoming upgrades" />
          </div>
        </div>

        {/* Tier Change History */}
        <div className="card">
          <div className="card-header">
            <h3>📜 Tier History</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <DataTable columns={historyColumns} data={history} emptyMessage="No tier changes yet" />
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
