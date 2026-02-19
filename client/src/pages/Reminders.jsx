import { useState, useEffect } from 'react';
import { remindersAPI } from '../utils/api';

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const load = () => {
    setLoading(true);
    remindersAPI.getAll(filter ? `status=${filter}` : '').then(d => { setReminders(d.reminders); setStats(d.stats); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const processNow = async () => {
    setProcessing(true);
    try {
      const result = await remindersAPI.process();
      alert(`✅ Processed ${result.processed}/${result.total} reminders`);
      load();
    } finally {
      setProcessing(false);
    }
  };

  const typeColors = {
    review_request: 'badge-purple', cleaning_reminder: 'badge-blue', maintenance_reminder: 'badge-amber',
    cross_sell: 'badge-gold', birthday_offer: 'badge-red', tarnish_alert: 'badge-amber'
  };

  const typeIcons = {
    review_request: '⭐', cleaning_reminder: '🧹', maintenance_reminder: '🔧',
    cross_sell: '💎', birthday_offer: '🎂', tarnish_alert: '⚠️'
  };

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card" onClick={() => setFilter('')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Total</div>
          <div className="stat-value">{stats.total || 0}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('pending')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending || 0}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('sent')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">✅</div>
          <div className="stat-label">Sent</div>
          <div className="stat-value">{stats.sent || 0}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('failed')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">❌</div>
          <div className="stat-label">Failed</div>
          <div className="stat-value">{stats.failed || 0}</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <div className="flex gap-2">
          {['', 'pending', 'sent', 'failed'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
              {f || 'All'}
            </button>
          ))}
        </div>
        <button className="btn btn-gold" onClick={processNow} disabled={processing}>
          {processing ? '⏳ Processing...' : '⚡ Process Pending Now'}
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div className="loading"><div className="loading-spinner" /></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Customer</th>
                  <th>Title</th>
                  <th>Send Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reminders.map(r => (
                  <tr key={r.id}>
                    <td><span className={`badge ${typeColors[r.type] || 'badge-blue'}`}>{typeIcons[r.type] || '🔔'} {r.type?.replace(/_/g, ' ')}</span></td>
                    <td style={{ fontWeight: 500 }}>{r.customer_name}</td>
                    <td className="text-sm">{r.title}</td>
                    <td className="text-sm text-gray">{new Date(r.send_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${r.status === 'sent' ? 'badge-green' : r.status === 'failed' ? 'badge-red' : 'badge-amber'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={async () => { await remindersAPI.delete(r.id); load(); }}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
