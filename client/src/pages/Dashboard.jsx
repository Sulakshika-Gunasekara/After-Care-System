import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>;
  if (!data) return <div className="empty-state"><p>Failed to load dashboard</p></div>;

  const { overview, monthly, loyaltyDistribution, topStones, topCategories, recentOrders, upcomingReminders, avgFeedback, activeCampaigns, revenueTrend } = data;

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{overview.totalCustomers}</div>
          <div className="stat-sub">+{monthly.newCustomers} this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{overview.totalOrders}</div>
          <div className="stat-sub">{monthly.orders} this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Revenue</div>
          <div className="stat-value">Rs. {overview.totalRevenue?.toLocaleString()}</div>
          <div className="stat-sub">Rs. {monthly.revenue?.toLocaleString()} this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💎</div>
          <div className="stat-label">Products</div>
          <div className="stat-value">{overview.totalProducts}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-label">Pending Reminders</div>
          <div className="stat-value">{overview.pendingReminders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📨</div>
          <div className="stat-label">Messages Sent</div>
          <div className="stat-value">{overview.messagesSent}</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h3>📦 Recent Orders</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Channel</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders?.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500 }}>{o.customer_name}</td>
                    <td>Rs. {o.total_amount?.toLocaleString()}</td>
                    <td className="text-gray text-sm">{new Date(o.order_date).toLocaleDateString()}</td>
                    <td><span className={`badge ${o.channel === 'online' ? 'badge-blue' : 'badge-amber'}`}>{o.channel}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="card-header">
            <h3>🔔 Upcoming Reminders</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {upcomingReminders?.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 500 }}>{r.customer_name}</td>
                    <td><span className={`badge ${getTypeBadge(r.type)}`}>{formatType(r.type)}</span></td>
                    <td className="text-gray text-sm">{new Date(r.send_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid-3 mt-3">
        {/* Loyalty Distribution */}
        <div className="card">
          <div className="card-header"><h3>🏆 Loyalty Tiers</h3></div>
          <div className="card-body">
            {loyaltyDistribution?.map(t => (
              <div key={t.loyalty_level} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span className={`tier-badge ${getTierClass(t.loyalty_level)}`}>
                  {getTierIcon(t.loyalty_level)} {t.loyalty_level || 'Regular'}
                </span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Stones */}
        <div className="card">
          <div className="card-header"><h3>💎 Top Stones</h3></div>
          <div className="card-body">
            {topStones?.map((s, i) => (
              <div key={s.stone_type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                <span>{getStoneEmoji(s.stone_type)} {s.stone_type}</span>
                <span className="badge badge-gold">{s.count} sold</span>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div className="card">
          <div className="card-header"><h3>⭐ Avg Feedback</h3></div>
          <div className="card-body">
            {avgFeedback && (
              <>
                <FeedbackBar label="Satisfaction" value={avgFeedback.satisfaction} />
                <FeedbackBar label="Stone Quality" value={avgFeedback.stone_quality} />
                <FeedbackBar label="Packaging" value={avgFeedback.packaging} />
                <FeedbackBar label="Delivery" value={avgFeedback.delivery} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Active Campaigns */}
      {activeCampaigns?.length > 0 && (
        <div className="card mt-3">
          <div className="card-header"><h3>📣 Active Campaigns</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr><th>Campaign</th><th>Type</th><th>Scheduled</th><th>Status</th></tr>
              </thead>
              <tbody>
                {activeCampaigns.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.type}</td>
                    <td className="text-sm text-gray">{c.scheduled_date ? new Date(c.scheduled_date).toLocaleDateString() : '—'}</td>
                    <td><span className={`badge ${c.status === 'scheduled' ? 'badge-blue' : 'badge-amber'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackBar({ label, value }) {
  const pct = ((value || 0) / 5) * 100;
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span className="text-sm" style={{ fontWeight: 500 }}>{label}</span>
        <span className="text-sm" style={{ fontWeight: 700, color: 'var(--gold)' }}>{value || '—'}/5</span>
      </div>
      <div style={{ background: 'var(--gray-200)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--red), var(--gold))', borderRadius: '6px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function getTypeBadge(type) {
  const map = { review_request: 'badge-purple', cleaning_reminder: 'badge-blue', maintenance_reminder: 'badge-amber', cross_sell: 'badge-gold', birthday_offer: 'badge-red', tarnish_alert: 'badge-amber' };
  return map[type] || 'badge-blue';
}

function formatType(type) {
  return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || type;
}

function getTierClass(tier) {
  if (tier?.includes('Sapphire')) return 'tier-sapphire';
  if (tier?.includes('Ruby')) return 'tier-ruby';
  if (tier?.includes('Silver')) return 'tier-silver';
  return 'tier-none';
}

function getTierIcon(tier) {
  if (tier?.includes('Sapphire')) return '🥇';
  if (tier?.includes('Ruby')) return '🥈';
  if (tier?.includes('Silver')) return '🥉';
  return '⚪';
}

function getStoneEmoji(stone) {
  const map = { Emerald: '💚', Ruby: '❤️', Sapphire: '💙', Pearl: '🤍', Diamond: '💎', Amethyst: '💜', Garnet: '🔴', Topaz: '🧡', Opal: '⚪', Tanzanite: '🔵', Peridot: '💛' };
  return map[stone] || '💎';
}
