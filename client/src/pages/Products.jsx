import { useState, useEffect } from 'react';
import { productsAPI } from '../utils/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({});
  const [activeFilter, setActiveFilter] = useState({ stone_type: '', category: '' });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const load = () => {
    setLoading(true);
    const params = Object.entries(activeFilter).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join('&');
    productsAPI.getAll(params).then(d => { setProducts(d.products); setFilters(d.filters || {}); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [activeFilter]);

  const handleSave = async (formData) => {
    if (editData?.id) await productsAPI.update(editData.id, formData);
    else await productsAPI.create(formData);
    setShowModal(false);
    setEditData(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await productsAPI.delete(id);
    load();
  };

  const stoneEmoji = { Emerald: '💚', Ruby: '❤️', Sapphire: '💙', Pearl: '🤍', Diamond: '💎', Amethyst: '💜', Garnet: '🔴', Topaz: '🧡', Opal: '⚪', Tanzanite: '🔵', Peridot: '💛' };

  return (
    <div>
      <div className="search-bar">
        <select className="form-select" style={{ maxWidth: '200px' }} value={activeFilter.stone_type} onChange={e => setActiveFilter(f => ({ ...f, stone_type: e.target.value }))}>
          <option value="">All Stones</option>
          {filters.stoneTypes?.map(s => <option key={s} value={s}>{stoneEmoji[s] || '💎'} {s}</option>)}
        </select>
        <select className="form-select" style={{ maxWidth: '200px' }} value={activeFilter.category} onChange={e => setActiveFilter(f => ({ ...f, category: e.target.value }))}>
          <option value="">All Categories</option>
          {filters.categories?.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => { setEditData({}); setShowModal(true); }}>+ Add Product</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {loading ? <div className="loading"><div className="loading-spinner" /></div> :
          products.map(p => (
            <div key={p.id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', background: 'linear-gradient(135deg, var(--red-bg), var(--white))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', marginBottom: '4px' }}>{p.name}</h4>
                    <p className="text-sm text-gray">{p.collection || 'No collection'}</p>
                  </div>
                  <span style={{ fontSize: '1.8rem' }}>{stoneEmoji[p.stone_type] || '💎'}</span>
                </div>
              </div>
              <div style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  {p.stone_type && <span className="badge badge-gold">{p.stone_type}</span>}
                  <span className="badge badge-blue">{p.category}</span>
                  <span className="badge badge-purple">{p.metal_finish}</span>
                </div>
                <p className="text-sm text-gray" style={{ marginBottom: '12px' }}>{p.description || 'No description'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Playfair Display', fontSize: '1.3rem', fontWeight: 700, color: 'var(--red)' }}>
                    Rs. {p.price?.toLocaleString()}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditData(p); setShowModal(true); }}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑</button>
                  </div>
                </div>
                <div className="mt-1">
                  <span className={`badge ${p.in_stock ? 'badge-green' : 'badge-red'}`}>{p.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showModal && <ProductModal data={editData} onSave={handleSave} onClose={() => { setShowModal(false); setEditData(null); }} />}
    </div>
  );
}

function ProductModal({ data, onSave, onClose }) {
  const [form, setForm] = useState({
    name: data?.name || '', stone_type: data?.stone_type || '', collection: data?.collection || '',
    category: data?.category || '', price: data?.price || '', description: data?.description || '',
    metal_finish: data?.metal_finish || 'Silver', in_stock: data?.in_stock ?? 1
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{data?.id ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stone Type</label>
              <select className="form-select" value={form.stone_type} onChange={e => set('stone_type', e.target.value)}>
                <option value="">None</option>
                {['Emerald','Ruby','Sapphire','Pearl','Diamond','Amethyst','Garnet','Topaz','Opal','Tanzanite','Peridot'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select...</option>
                {['Earrings','Necklace','Ring','Bracelet','Set','Pendant','Anklet'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price (Rs.) *</label>
              <input className="form-input" type="number" value={form.price} onChange={e => set('price', Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Collection</label>
              <input className="form-input" value={form.collection} onChange={e => set('collection', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Metal Finish</label>
              <input className="form-input" value={form.metal_finish} onChange={e => set('metal_finish', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">In Stock</label>
              <select className="form-select" value={form.in_stock} onChange={e => set('in_stock', Number(e.target.value))}>
                <option value={1}>Yes</option>
                <option value={0}>No</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSave(form)}>💎 Save Product</button>
        </div>
      </div>
    </div>
  );
}
