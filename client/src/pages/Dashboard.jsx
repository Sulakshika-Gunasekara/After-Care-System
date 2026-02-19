import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="loading-spinner" /></div>;
  if (!data) return <div className="empty-state"><p>Failed to load dashboard</p></div>;

  const { overview, monthly, loyaltyDistribution, topStones, topCategories, recentOrders, upcomingReminders, avgFeedback, activeCampaigns, revenueTrend } = data;

  const orderColumns = [
    { key: 'customer_name', label: 'Customer', cellStyle: { fontWeight: 500 } },
    { key: 'total_amount', label: 'Amount', render: (val) => `Rs. ${val?.toLocaleString()}` },
    { key: 'order_date', label: 'Date', render: (val) => <span className="text-gray text-sm">{new Date(val).toLocaleDateString()}</span> },
    { key: 'channel', label: 'Channel', render: (val) => <Badge variant={val === 'online' ? 'blue' : 'amber'}>{val}</Badge> }
  ];

  const reminderColumns = [
    { key: 'customer_name', label: 'Customer', cellStyle: { fontWeight: 500 } },
    { key: 'type', label: 'Type', render: (val) => <Badge variant={getTypeBadge(val).replace('badge-', '')}>{formatType(val)}</Badge> },
    { key: 'send_date', label: 'Date', render: (val) => <span className="text-gray text-sm">{new Date(val).toLocaleDateString()}</span> }
  ];

  const campaignColumns = [
    { key: 'name', label: 'Campaign', cellStyle: { fontWeight: 500 } },
    { key: 'type', label: 'Type' },
    { key: 'scheduled_date', label: 'Scheduled', render: (val) => <span className="text-sm text-gray">{val ? new Date(val).toLocaleDateString() : '—'}</span> },
    { key: 'status', label: 'Status', render: (val) => <Badge variant={val === 'scheduled' ? 'blue' : 'amber'}>{val}</Badge> }
  ];

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatsCard icon="👥" label="Total Customers" value={overview.totalCustomers} sub={`+${monthly.newCustomers} this month`} />
        <StatsCard icon="📦" label="Total Orders" value={overview.totalOrders} sub={`${monthly.orders} this month`} />
        <StatsCard icon="💰" label="Revenue" value={`Rs. ${overview.totalRevenue?.toLocaleString()}`} sub={`Rs. ${monthly.revenue?.toLocaleString()} this month`} />
        <StatsCard icon="💎" label="Products" value={overview.totalProducts} />
        <StatsCard icon="🔔" label="Pending Reminders" value={overview.pendingReminders} />
        <StatsCard icon="📨" label="Messages Sent" value={overview.messagesSent} />
      </div>

      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h3>📦 Recent Orders</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <DataTable columns={orderColumns} data={recentOrders} emptyMessage="No recent orders" />
          </div>
        </div>

        {/* Upcoming Reminders */}
        <div className="card">
          <div className="card-header">
            <h3>🔔 Upcoming Reminders</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <DataTable columns={reminderColumns} data={upcomingReminders} emptyMessage="No upcoming reminders" />
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
                <Badge variant="gold">{s.count} sold</Badge>
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
            <DataTable columns={campaignColumns} data={activeCampaigns} />
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
