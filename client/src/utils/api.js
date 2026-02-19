const API_BASE = '/api';

async function api(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, config);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const dashboardAPI = {
  getStats: () => api('/dashboard/stats'),
};

export const customersAPI = {
  getAll: (params = '') => api(`/customers?${params}`),
  getOne: (id) => api(`/customers/${id}`),
  create: (data) => api('/customers', { method: 'POST', body: data }),
  update: (id, data) => api(`/customers/${id}`, { method: 'PUT', body: data }),
  delete: (id) => api(`/customers/${id}`, { method: 'DELETE' }),
  getRecommendations: (id) => api(`/customers/${id}/recommendations`),
};

export const ordersAPI = {
  getAll: (params = '') => api(`/orders?${params}`),
  getOne: (id) => api(`/orders/${id}`),
  create: (data) => api('/orders', { method: 'POST', body: data }),
  update: (id, data) => api(`/orders/${id}`, { method: 'PUT', body: data }),
  delete: (id) => api(`/orders/${id}`, { method: 'DELETE' }),
};

export const productsAPI = {
  getAll: (params = '') => api(`/products?${params}`),
  getOne: (id) => api(`/products/${id}`),
  create: (data) => api('/products', { method: 'POST', body: data }),
  update: (id, data) => api(`/products/${id}`, { method: 'PUT', body: data }),
  delete: (id) => api(`/products/${id}`, { method: 'DELETE' }),
};

export const remindersAPI = {
  getAll: (params = '') => api(`/reminders?${params}`),
  process: () => api('/reminders/process', { method: 'POST' }),
  create: (data) => api('/reminders', { method: 'POST', body: data }),
  update: (id, data) => api(`/reminders/${id}`, { method: 'PUT', body: data }),
  delete: (id) => api(`/reminders/${id}`, { method: 'DELETE' }),
};

export const campaignsAPI = {
  getAll: (params = '') => api(`/campaigns?${params}`),
  getOne: (id) => api(`/campaigns/${id}`),
  create: (data) => api('/campaigns', { method: 'POST', body: data }),
  send: (id) => api(`/campaigns/${id}/send`, { method: 'POST' }),
  update: (id, data) => api(`/campaigns/${id}`, { method: 'PUT', body: data }),
  delete: (id) => api(`/campaigns/${id}`, { method: 'DELETE' }),
};

export const loyaltyAPI = {
  getOverview: () => api('/loyalty'),
  getHistory: () => api('/loyalty/history'),
  getCustomer: (id) => api(`/loyalty/customer/${id}`),
  recalculate: (id) => api(`/loyalty/recalculate/${id}`, { method: 'POST' }),
};

export const feedbackAPI = {
  getAll: (params = '') => api(`/feedback?${params}`),
  create: (data) => api('/feedback', { method: 'POST', body: data }),
  delete: (id) => api(`/feedback/${id}`, { method: 'DELETE' }),
};
