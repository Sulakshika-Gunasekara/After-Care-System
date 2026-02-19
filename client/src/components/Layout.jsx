import { NavLink, Outlet, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { section: 'Main' },
  { path: '/',          icon: '📊', label: 'Dashboard' },
  { path: '/customers', icon: '👥', label: 'Customers' },
  { path: '/orders',    icon: '📦', label: 'Orders' },
  { path: '/products',  icon: '💎', label: 'Products' },
  { section: 'Automation' },
  { path: '/reminders', icon: '🔔', label: 'Reminders' },
  { path: '/campaigns', icon: '📣', label: 'Campaigns' },
  { section: 'Engagement' },
  { path: '/loyalty',   icon: '🏆', label: 'Loyalty' },
  { path: '/feedback',  icon: '⭐', label: 'Feedback' },
  { section: 'System' },
  { path: '/settings',  icon: '⚙️', label: 'Settings' },
];

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/customers': 'Customer Management',
  '/orders': 'Order Management',
  '/products': 'Product Catalog',
  '/reminders': 'Smart Reminders',
  '/campaigns': 'Campaign Automation',
  '/loyalty': 'Loyalty & VIP Program',
  '/feedback': 'Feedback & Reviews',
  '/settings': 'Settings',
};

export default function Layout() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <h1>💎 Chamathka</h1>
          <div className="subtitle">Care+ System</div>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item, i) =>
            item.section ? (
              <div key={i} className="nav-section-title">{item.section}</div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="icon">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          )}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.75rem', color: 'var(--gray-500)' }}>
          © 2026 Chamathka Jewellers
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <h2>{pageTitle}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>Admin</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--red)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.9rem' }}>A</div>
          </div>
        </header>
        <div className="page-content animate-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
