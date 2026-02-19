import { useState, useEffect } from 'react';
import { ordersAPI, customersAPI, productsAPI } from '../utils/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState(null);

  const load = () => {
    setLoading(true);
    ordersAPI.getAll().then(d => setOrders(d.orders)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Order</button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>📦 All Orders ({orders.length})</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div className="loading"><div className="loading-spinner" /></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Occasion</th>
                  <th>Channel</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>#{o.id}</td>
                    <td style={{ fontWeight: 500 }}>{o.customer_name}</td>
                    <td className="text-sm text-gray">{o.item_names || '—'}</td>
                    <td style={{ fontWeight: 600 }}>Rs. {o.total_amount?.toLocaleString()}</td>
                    <td>{o.occasion ? <span className="badge badge-purple">{o.occasion}</span> : '—'}</td>
                    <td><span className={`badge ${o.channel === 'online' ? 'badge-blue' : 'badge-amber'}`}>{o.channel}</span></td>
                    <td className="text-sm text-gray">{new Date(o.order_date).toLocaleDateString()}</td>
                    <td><span className="badge badge-green">{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && <OrderModal onClose={() => { setShowModal(false); setResult(null); }} onResult={r => { setResult(r); load(); }} />}
      {result && <OrderResult data={result} onClose={() => setResult(null)} />}
    </div>
  );
}

function OrderModal({ onClose, onResult }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ customer_id: '', items: [], occasion: '', gift_for: '', channel: 'offline' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    customersAPI.getAll('limit=500').then(d => setCustomers(d.customers));
    productsAPI.getAll('limit=500').then(d => setProducts(d.products));
  }, []);

  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }));
  const updateItem = (i, k, v) => setForm(f => { const items = [...f.items]; items[i] = { ...items[i], [k]: v }; return { ...f, items }; });
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const handleSubmit = async () => {
    if (!form.customer_id || form.items.length === 0) return alert('Select a customer and add at least one item');
    setSubmitting(true);
    try {
      const result = await ordersAPI.create({
        customer_id: Number(form.customer_id),
        items: form.items.map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
        occasion: form.occasion || undefined,
        gift_for: form.gift_for || undefined,
        channel: form.channel
      });
      onResult(result);
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📦 New Order</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select className="form-select" value={form.customer_id} onChange={e => setForm(f => ({ ...f, customer_id: e.target.value }))}>
              <option value="">Select customer...</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>)}
            </select>
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="form-label" style={{ margin: 0 }}>Items *</label>
              <button className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
            </div>
            {form.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <select className="form-select" style={{ flex: 1 }} value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} — Rs. {p.price?.toLocaleString()}</option>)}
                </select>
                <input className="form-input" style={{ width: '70px' }} type="number" min="1" value={item.quantity} onChange={e => updateItem(i, 'quantity', e.target.value)} />
                <button className="btn btn-danger btn-sm" onClick={() => removeItem(i)}>✕</button>
              </div>
            ))}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Occasion</label>
              <select className="form-select" value={form.occasion} onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))}>
                <option value="">None</option>
                {["Valentine's", 'Birthday', 'Anniversary', 'Wedding', 'Christmas', 'Other'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Gift For</label>
              <input className="form-input" placeholder="Self, Partner, etc." value={form.gift_for} onChange={e => setForm(f => ({ ...f, gift_for: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Channel</label>
            <select className="form-select" value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
              <option value="offline">Offline (In-store)</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
            {submitting ? 'Processing...' : '💎 Create Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderResult({ data, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✅ Order Created Successfully!</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
            <h4>Order #{data.order?.id}</h4>
            <p className="text-gray mt-1">Amount: Rs. {data.order?.total_amount?.toLocaleString()}</p>
          </div>

          {data.automation && (
            <div style={{ background: 'var(--green-bg)', borderRadius: 'var(--radius-sm)', padding: '16px', marginTop: '16px' }}>
              <h4 style={{ color: 'var(--green)', marginBottom: '8px' }}>🤖 Automation Triggered</h4>
              <p className="text-sm">✅ Welcome message sent</p>
              <p className="text-sm">✅ {data.automation.reminders_scheduled} reminders scheduled</p>
              {data.automation.loyalty_update?.changed && (
                <p className="text-sm">🏆 Loyalty upgraded: {data.automation.loyalty_update.previous} → <strong>{data.automation.loyalty_update.current}</strong></p>
              )}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
