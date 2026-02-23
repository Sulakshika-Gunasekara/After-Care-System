import { useState, useEffect } from 'react';
import { remindersAPI } from '../utils/api';
import StatsCard from '../components/StatsCard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';

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

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (type) => (
        <Badge variant={(typeColors[type] || 'badge-blue').replace('badge-', '')}>
          {typeIcons[type] || '🔔'} {type?.replace(/_/g, ' ')}
        </Badge>
      )
    },
    { key: 'customer_name', label: 'Customer', cellStyle: { fontWeight: 500 } },
    { key: 'title', label: 'Title', cellStyle: { fontSize: '0.85rem' } },
    {
      key: 'send_date',
      label: 'Send Date',
      render: (date) => <span className="text-gray text-sm">{new Date(date).toLocaleDateString()}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (status) => (
        <Badge variant={status === 'sent' ? 'green' : status === 'failed' ? 'red' : 'amber'}>
          {status}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button className="btn btn-danger btn-sm" onClick={async (e) => { e.stopPropagation(); await remindersAPI.delete(row.id); load(); }}>🗑</button>
      )
    }
  ];

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <StatsCard label="Total" value={stats.total || 0} onClick={() => setFilter('')} style={{ cursor: 'pointer' }} />
        <StatsCard icon="⏳" label="Pending" value={stats.pending || 0} onClick={() => setFilter('pending')} style={{ cursor: 'pointer' }} />
        <StatsCard icon="✅" label="Sent" value={stats.sent || 0} onClick={() => setFilter('sent')} style={{ cursor: 'pointer' }} />
        <StatsCard icon="❌" label="Failed" value={stats.failed || 0} onClick={() => setFilter('failed')} style={{ cursor: 'pointer' }} />
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
          <DataTable
            columns={columns}
            data={reminders}
            loading={loading}
            emptyMessage="No reminders found"
          />
        </div>
      </div>
    </div>
  );
}
