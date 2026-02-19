import { useState, useEffect } from 'react';

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

  return (
    <div>
      {/* System Status */}
      <div className="card mb-3">
        <div className="card-header">
          <h3>🖥️ System Status</h3>
          <span className={`badge ${health?.status === 'ok' ? 'badge-green' : 'badge-red'}`}>
            {health?.status === 'ok' ? '● Online' : '● Offline'}
          </span>
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
        <div className="card-body">
          <p className="text-sm text-gray mb-2">Automated reminder processing runs via cron. Below is the lifecycle triggered on each new order:</p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Timing</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ fontWeight: 600 }}>1</td><td>Immediately</td><td><span className="badge badge-green">welcome</span></td><td>Thank you message + care guide</td></tr>
              <tr><td style={{ fontWeight: 600 }}>2</td><td>7 days</td><td><span className="badge badge-purple">review_request</span></td><td>Ask for product review / feedback</td></tr>
              <tr><td style={{ fontWeight: 600 }}>3</td><td>30 days</td><td><span className="badge badge-blue">cleaning_reminder</span></td><td>Silver cleaning reminder</td></tr>
              <tr><td style={{ fontWeight: 600 }}>4</td><td>90 days</td><td><span className="badge badge-amber">maintenance_reminder</span></td><td>Professional maintenance suggestion</td></tr>
              <tr><td style={{ fontWeight: 600 }}>5</td><td>180 days</td><td><span className="badge badge-gold">cross_sell</span></td><td>Complementary product recommendation</td></tr>
              <tr><td style={{ fontWeight: 600 }}>6</td><td>365 days</td><td><span className="badge badge-amber">tarnish_alert</span></td><td>Annual tarnish prevention reminder</td></tr>
            </tbody>
          </table>
          <p className="text-sm text-gray mt-2">⏰ Cron runs every hour to process pending reminders.</p>
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
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr><th>Tier</th><th>Min Purchases</th><th>Benefits</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="tier-badge tier-silver">🥉 Silver Member</span></td>
                <td style={{ fontWeight: 600 }}>3</td>
                <td className="text-sm">5% discount, priority cleaning, birthday gift</td>
              </tr>
              <tr>
                <td><span className="tier-badge tier-ruby">🥈 Ruby Member</span></td>
                <td style={{ fontWeight: 600 }}>6</td>
                <td className="text-sm">10% discount, free polishing, exclusive previews, birthday gift</td>
              </tr>
              <tr>
                <td><span className="tier-badge tier-sapphire">🥇 Sapphire Elite</span></td>
                <td style={{ fontWeight: 600 }}>10</td>
                <td className="text-sm">15% discount, free maintenance, VIP events, custom designs, birthday gift</td>
              </tr>
            </tbody>
          </table>
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
      <span className="badge badge-amber" style={{ marginBottom: '8px' }}>{status}</span>
      <p className="text-sm text-gray" style={{ marginTop: '8px' }}>{description}</p>
    </div>
  );
}
