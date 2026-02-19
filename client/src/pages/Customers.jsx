import { useState, useEffect } from 'react';
import { customersAPI } from '../utils/api';
import CareGuide from '../components/CareGuide';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge, { TierBadge } from '../components/Badge';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = () => {
    setLoading(true);
    customersAPI.getAll(`search=${search}`).then(d => { setCustomers(d.customers); setTotal(d.total); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const handleSave = async (formData) => {
    if (editData?.id) await customersAPI.update(editData.id, formData);
    else await customersAPI.create(formData);
    setShowModal(false);
    setEditData(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return;
    await customersAPI.delete(id);
    load();
  };

  const openDetail = async (id) => {
    const d = await customersAPI.getOne(id);
    setDetail(d);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (name, row) => (
        <span style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--red)' }} onClick={() => openDetail(row.id)}>
          {name}
        </span>
      )
    },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email', cellStyle: { color: 'var(--gray)', fontSize: '0.85rem' } },
    {
      key: 'preferred_stone',
      label: 'Preferred Stone',
      render: (stone) => stone && <Badge variant="gold">{stone}</Badge>
    },
    { key: 'total_purchases', label: 'Purchases', cellStyle: { fontWeight: 600 } },
    {
      key: 'loyalty_level',
      label: 'Loyalty',
      render: (tier) => <TierBadge tier={tier} />
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { setEditData(row); setShowModal(true); }}>✏️</button>
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>🗑</button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="search-bar">
        <div className="search-input-wrap" style={{ flex: 1 }}>
          <span className="icon">🔍</span>
          <input className="form-input" style={{ paddingLeft: '40px' }} placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditData({}); setShowModal(true); }}>+ Add Customer</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>👥 All Customers ({total})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <DataTable
            columns={columns}
            data={customers}
            loading={loading}
          />
        </div>
      </div>

      {showModal && <CustomerModal data={editData} onSave={handleSave} onClose={() => { setShowModal(false); setEditData(null); }} />}
      {detail && <CustomerDetail data={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}

function CustomerModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({
    name: data?.name || '', phone: data?.phone || '', email: data?.email || '',
    birthday: data?.birthday || '', anniversary: data?.anniversary || '',
    preferred_stone: data?.preferred_stone || '', preferred_jewellery_type: data?.preferred_jewellery_type || '',
    communication_preference: data?.communication_preference || 'email',
    tags: Array.isArray(data?.tags) ? data.tags : JSON.parse(data?.tags || '[]')
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const footer = (
    <>
      <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      <button className="btn btn-primary" onClick={() => onSave(form)}>💎 Save Customer</button>
    </>
  );

  return (
    <Modal title={data?.id ? 'Edit Customer' : 'Add New Customer'} onClose={onClose} footer={footer}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone *</label>
          <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Birthday</label>
          <input className="form-input" type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Anniversary</label>
          <input className="form-input" type="date" value={form.anniversary} onChange={e => set('anniversary', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Preferred Stone</label>
          <select className="form-select" value={form.preferred_stone} onChange={e => set('preferred_stone', e.target.value)}>
            <option value="">Select...</option>
            {['Emerald','Ruby','Sapphire','Pearl','Diamond','Amethyst','Garnet','Topaz','Opal','Tanzanite','Peridot'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Communication</label>
          <select className="form-select" value={form.communication_preference} onChange={e => set('communication_preference', e.target.value)}>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="sms">SMS</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Preferred Jewellery Type</label>
        <select className="form-select" value={form.preferred_jewellery_type} onChange={e => set('preferred_jewellery_type', e.target.value)}>
          <option value="">Select...</option>
          {['Earrings','Necklace','Ring','Bracelet','Set','Pendant','Anklet'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Customer Tags</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Valentine Customer', 'Romantic Buyer', 'Gift Buyer', 'Birthday Shopper', 'Anniversary Shopper', 'Wedding Shopper', 'VIP'].map(tag => (
            <button
              key={tag}
              type="button"
              className={`btn btn-sm ${form.tags.includes(tag) ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => set('tags', form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag])}
            >
              {tag}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray mt-1">{form.tags.length === 0 ? 'No tags selected' : `${form.tags.length} tag(s) selected`}</p>
      </div>
    </Modal>
  );
}

function CustomerDetail({ data, onClose }) {
  const { customer, orders, reminders, messages, feedback } = data;
  const tags = Array.isArray(customer.tags) ? customer.tags : JSON.parse(customer.tags || '[]');
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    customersAPI.getRecommendations(customer.id)
      .then(r => setRecommendations(r.recommendations || []))
      .catch(() => setRecommendations([]))
      .finally(() => setLoadingRecs(false));
  }, [customer.id]);

  const orderColumns = [
    { key: 'order_date', label: 'Date', render: (val) => <span className="text-sm">{new Date(val).toLocaleDateString()}</span> },
    { key: 'items', label: 'Items', cellStyle: { fontSize: '0.85rem' }, render: (val) => val || '—' },
    { key: 'total_amount', label: 'Amount', render: (val) => `Rs. ${val?.toLocaleString()}` },
    { key: 'occasion', label: 'Occasion', render: (val) => val ? <Badge variant="purple">{val}</Badge> : '—' }
  ];

  return (
    <Modal title={`💎 ${customer.name}`} onClose={onClose} maxWidth="750px">
      <div className="grid-2 mb-3">
        <div>
          <p><strong>Phone:</strong> {customer.phone}</p>
          <p><strong>Email:</strong> {customer.email || '—'}</p>
          <p><strong>Birthday:</strong> {customer.birthday || '—'}</p>
          <p><strong>Anniversary:</strong> {customer.anniversary || '—'}</p>
        </div>
        <div>
          <p><strong>Preferred Stone:</strong> {customer.preferred_stone || '—'}</p>
          <p><strong>Total Purchases:</strong> {customer.total_purchases}</p>
          <p><strong>Total Spent:</strong> Rs. {customer.total_spent?.toLocaleString()}</p>
          <p><strong>Loyalty:</strong> <TierBadge tier={customer.loyalty_level} /></p>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="mb-2">
          <strong>Tags: </strong>
          {tags.map(t => <Badge key={t} variant="red" style={{ marginRight: '6px' }}>{t}</Badge>)}
        </div>
      )}

      {orders?.length > 0 && (
        <div className="mb-3">
          <h4 style={{ marginBottom: '8px' }}>📦 Order History ({orders.length})</h4>
          <DataTable columns={orderColumns} data={orders} />
        </div>
      )}

      {reminders?.length > 0 && (
        <div className="mb-3">
          <h4 style={{ marginBottom: '8px' }}>🔔 Pending Reminders ({reminders.length})</h4>
          {reminders.map(r => (
            <div key={r.id} style={{ padding: '8px 12px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '6px', fontSize: '0.85rem' }}>
              <strong>{r.title}</strong> — {new Date(r.send_date).toLocaleDateString()}
            </div>
          ))}
        </div>
      )}

      {/* Cross-sell Recommendations */}
      <div className="mb-3">
        <h4 style={{ marginBottom: '8px' }}>💡 Recommended Products</h4>
        {loadingRecs ? (
          <div className="loading" style={{ padding: '16px' }}><div className="loading-spinner" /></div>
        ) : recommendations.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {recommendations.slice(0, 6).map(p => (
              <div key={p.id} style={{ padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>{p.name}</div>
                <div className="text-sm text-gray">{p.stone_type} • {p.category}</div>
                <div style={{ fontWeight: 700, color: 'var(--red)', marginTop: '4px' }}>Rs. {p.price?.toLocaleString()}</div>
                {p.reason && <div className="text-sm" style={{ color: 'var(--gold)', marginTop: '2px' }}>{p.reason}</div>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray">No recommendations available</p>
        )}
      </div>

      {/* Care Guide */}
      {customer.preferred_stone && (
        <div className="mb-3">
          <CareGuide stoneType={customer.preferred_stone} />
        </div>
      )}
    </Modal>
  );
}
