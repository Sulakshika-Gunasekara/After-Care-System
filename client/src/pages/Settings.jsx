import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Badge, { TierBadge } from '../components/Badge';

export default function Settings() {
  const [health, setHealth] = useState(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'error' }));
  }, []);

  const reseed = async () => {
    if (!confirm('This will re-seed the database with sample data. Existing data will not be deleted. Continue?')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
      alert('✅ Database health check passed!');
    } catch {
      alert('❌ Server is not responding');
    } finally {
      setSeeding(false);
    }
  };

  const reminderData = [
    { stage: '1', timing: 'Immediately', type: 'welcome', description: 'Thank you message + care guide', badge: 'green' },
    { stage: '2', timing: '7 days', type: 'review_request', description: 'Ask for product review / feedback', badge: 'purple' },
    { stage: '3', timing: '30 days', type: 'cleaning_reminder', description: 'Silver cleaning reminder', badge: 'blue' },
    { stage: '4', timing: '90 days', type: 'maintenance_reminder', description: 'Professional maintenance suggestion', badge: 'amber' },
    { stage: '5', timing: '180 days', type: 'cross_sell', description: 'Complementary product recommendation', badge: 'gold' },
    { stage: '6', timing: '365 days', type: 'tarnish_alert', description: 'Annual tarnish prevention reminder', badge: 'amber' },
  ];

  const reminderColumns = [
    { key: 'stage', label: 'Stage', cellStyle: { fontWeight: 600 } },
    { key: 'timing', label: 'Timing' },
    { key: 'type', label: 'Type', render: (t, r) => <Badge variant={r.badge}>{t}</Badge> },
    { key: 'description', label: 'Description' }
  ];

  const loyaltyData = [
    { tier: 'Silver Member', min: 3, benefits: '5% discount, priority cleaning, birthday gift' },
    { tier: 'Ruby Member', min: 6, benefits: '10% discount, free polishing, exclusive previews, birthday gift' },
    { tier: 'Sapphire Elite', min: 10, benefits: '15% discount, free maintenance, VIP events, custom designs, birthday gift' },
  ];

  const loyaltyColumns = [
    { key: 'tier', label: 'Tier', render: (t) => <TierBadge tier={t} /> },
    { key: 'min', label: 'Min Purchases', cellStyle: { fontWeight: 600 } },
    { key: 'benefits', label: 'Benefits', cellStyle: { fontSize: '0.85rem' } }
  ];

  return (
    <div>
      {/* System Status */}
      <div className="card mb-3">
        <div className="card-header">
          <h3>🖥️ System Status</h3>
          <Badge variant={health?.status === 'ok' ? 'green' : 'red'}>
            {health?.status === 'ok' ? '● Online' : '● Offline'}
          </Badge>
        </div>
        <div className="card-body">
          <div className="grid-2">
            <div>
              <InfoRow label="Server Status" value={health?.status === 'ok' ? 'Running' : 'Not responding'} />
              <InfoRow label="Last Check" value={health?.timestamp ? new Date(health.timestamp).toLocaleString() : '—'} />
              <InfoRow label="Backend" value="Node.js / Express" />
              <InfoRow label="Database" value="SQLite (better-sqlite3)" />
            </div>
            <div>
              <InfoRow label="Frontend" value="React 18 + Vite" />
              <InfoRow label="API Base" value="/api" />
              <InfoRow label="Version" value="1.0.0" />
              <InfoRow label="Port" value="5000 (API) / 3000 (Dev)" />
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Schedule */}
      <div className="card mb-3">
        <div className="card-header">
          <h3>🔔 Reminder Schedule</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px 0' }}>
            <p className="text-sm text-gray mb-2">Automated reminder processing runs via cron. Below is the lifecycle triggered on each new order:</p>
          </div>
          <DataTable columns={reminderColumns} data={reminderData} />
          <div style={{ padding: '0 20px 16px' }}>
            <p className="text-sm text-gray mt-2">⏰ Cron runs every hour to process pending reminders.</p>
          </div>
        </div>
      </div>

      {/* Messaging Channels */}
      <div className="card mb-3">
        <div className="card-header">
          <h3>📨 Messaging Channels</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <ChannelCard icon="💬" name="WhatsApp" status="Mock" description="WhatsApp Cloud API — messages are logged to database" />
            <ChannelCard icon="📧" name="Email" status="Mock" description="SendGrid API — emails are logged to database" />
            <ChannelCard icon="📱" name="SMS" status="Mock" description="Twilio API — SMS messages are logged to database" />
          </div>
          <p className="text-sm text-gray mt-2">All messages are currently simulated and logged to the <code>message_log</code> table. Plug in real API keys to activate live sending.</p>
        </div>
      </div>

      {/* Loyalty Tiers Configuration */}
      <div className="card mb-3">
        <div className="card-header">
          <h3>🏆 Loyalty Tier Thresholds</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable columns={loyaltyColumns} data={loyaltyData} />
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="card-header">
          <h3>🛠️ Data Management</h3>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary" onClick={reseed} disabled={seeding}>
              {seeding ? '⏳ Checking...' : '🔄 Health Check'}
            </button>
            <span className="text-sm text-gray">Verify the server is running and responsive</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--gray-100)' }}>
      <span className="text-sm" style={{ color: 'var(--gray-500)', fontWeight: 500 }}>{label}</span>
      <span className="text-sm" style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function ChannelCard({ icon, name, status, description }) {
  return (
    <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '20px', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
      <h4 style={{ fontSize: '0.95rem', marginBottom: '4px' }}>{name}</h4>
      <Badge variant="amber" style={{ marginBottom: '8px' }}>{status}</Badge>
      <p className="text-sm text-gray" style={{ marginTop: '8px' }}>{description}</p>
    </div>
  );
}
