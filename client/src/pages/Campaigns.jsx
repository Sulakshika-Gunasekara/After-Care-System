import { useState, useEffect } from 'react';
import { campaignsAPI } from '../utils/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = () => {
    setLoading(true);
    campaignsAPI.getAll().then(d => setCampaigns(d.campaigns)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSend = async (id) => {
    if (!confirm('Send this campaign to all target customers?')) return;
    try {
      const result = await campaignsAPI.send(id);
      alert(`✅ Campaign sent to ${result.sentCount} customers!`);
      load();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleSave = async (form) => {
    await campaignsAPI.create(form);
    setShowModal(false);
    load();
  };

  const statusColors = { draft: 'amber', scheduled: 'blue', sent: 'green' };
  const typeIcons = { seasonal: '🌸', birthday: '🎂', announcement: '📣', promotional: '🏷️' };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Campaign</button>
      </div>

      {loading ? <div className="loading"><div className="loading-spinner" /></div> : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {campaigns.map(c => (
            <div key={c.id} className="card">
              <div className="card-body">
                <div className="flex justify-between items-center" style={{ marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {typeIcons[c.type] || '📣'} {c.name}
                    </h3>
                    <p className="text-sm text-gray mt-1">
                      {c.scheduled_date ? `Scheduled: ${new Date(c.scheduled_date).toLocaleDateString()}` : 'No schedule set'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Badge variant={statusColors[c.status] || 'amber'}>{c.status}</Badge>
                    {c.status === 'sent' && <Badge variant="green">{c.sent_count} sent</Badge>}
                  </div>
                </div>

                {c.subject && <p style={{ fontWeight: 500, marginBottom: '8px' }}>📧 {c.subject}</p>}

                <div style={{ background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', padding: '14px', marginBottom: '12px', fontSize: '0.85rem', color: 'var(--gray-600)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {c.message_template}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    {(() => {
                      const tags = JSON.parse(c.target_tags || '[]');
                      return tags.length > 0
                        ? tags.map(t => <Badge key={t} variant="red" style={{ marginRight: '6px' }}>{t}</Badge>)
                        : <Badge variant="purple">All customers</Badge>;
                    })()}
                  </div>
                  {c.status !== 'sent' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-gold btn-sm" onClick={() => handleSend(c.id)}>🚀 Send Now</button>
                      <button className="btn btn-danger btn-sm" onClick={async () => { await campaignsAPI.delete(c.id); load(); }}>🗑</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <CampaignModal onSave={handleSave} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function CampaignModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    name: '', type: 'seasonal', subject: '', message_template: '',
    target_tags: [], scheduled_date: ''
  });

  const tagOptions = ['Valentine Customer', 'Romantic Buyer', 'Gift Buyer', 'Birthday Shopper', 'Anniversary Shopper', 'Wedding Shopper'];

  const toggleTag = (tag) => {
    setForm(f => ({
      ...f,
      target_tags: f.target_tags.includes(tag) ? f.target_tags.filter(t => t !== tag) : [...f.target_tags, tag]
    }));
  };

  const footer = (
    <>
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onSave(form)}>📣 Create Campaign</button>
    </>
  );

  return (
    <Modal title="📣 New Campaign" onClose={onClose} footer={footer}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Campaign Name *</label>
          <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
            <option value="seasonal">Seasonal</option>
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="promotional">Promotional</option>
            <option value="announcement">Announcement</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Subject Line</label>
        <input className="form-input" placeholder="Email subject..." value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
      </div>
      <div className="form-group">
        <label className="form-label">Message Template *</label>
        <textarea className="form-textarea" style={{ minHeight: '120px' }} placeholder="Use {name} and {preferred_stone} for personalization..." value={form.message_template} onChange={e => setForm(f => ({ ...f, message_template: e.target.value }))} />
        <p className="text-sm text-gray mt-1">Variables: {'{name}'}, {'{preferred_stone}'}</p>
      </div>
      <div className="form-group">
        <label className="form-label">Target Audience</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tagOptions.map(tag => (
            <button key={tag} className={`btn btn-sm ${form.target_tags.includes(tag) ? 'btn-primary' : 'btn-secondary'}`} onClick={() => toggleTag(tag)}>
              {tag}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray mt-1">{form.target_tags.length === 0 ? 'All customers will be targeted' : `${form.target_tags.length} tag(s) selected`}</p>
      </div>
      <div className="form-group">
        <label className="form-label">Scheduled Date</label>
        <input className="form-input" type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} />
      </div>
    </Modal>
  );
}
