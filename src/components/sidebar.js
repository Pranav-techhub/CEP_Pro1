/**
 * TeaRoute Role-Specific Sidebar & Shell Manager
 * Injects responsive sidebar, mobile bottom navigation, and topbar profile chips.
 */
import { store } from '../services/store.js';

export function renderDashboardSidebar(role = 'customer', activePage = 'dashboard') {
  const sidebarContainer = document.getElementById('dashboard-sidebar');
  if (!sidebarContainer) return;

  const user = store.getCurrentUser() || { name: 'Demo User', role };

  const menusByRole = {
    customer: [
      { id: 'dashboard', label: 'My Dashboard', href: '/customer/dashboard.html', icon: 'grid' },
      { id: 'explore', label: 'Explore Hub', href: '/customer/explore.html', icon: 'compass' },
      { id: 'cart', label: 'My Cart', href: '/customer/cart.html', icon: 'shopping-cart' },
      { id: 'orders', label: 'Order History', href: '/customer/orders.html', icon: 'package' },
      { id: 'tracking', label: 'Live GPS Tracking', href: '/customer/tracking.html', icon: 'map-pin' }
    ],
    hotel: [
      { id: 'dashboard', label: 'Hotel Dashboard', href: '/hotel/dashboard.html', icon: 'grid' },
      { id: 'orders', label: 'Kitchen Orders', href: '/hotel/orders.html', icon: 'utensils' },
      { id: 'menu', label: 'Menu & Stock', href: '/hotel/menu.html', icon: 'book-open' },
      { id: 'analytics', label: 'Sales & Revenue', href: '/hotel/analytics.html', icon: 'bar-chart-2' }
    ],
    shopkeeper: [
      { id: 'dashboard', label: 'Shop Dashboard', href: '/shopkeeper/dashboard.html', icon: 'grid' },
      { id: 'orders', label: 'Chai & Snacks Orders', href: '/shopkeeper/orders.html', icon: 'coffee' },
      { id: 'products', label: 'Product Inventory', href: '/shopkeeper/products.html', icon: 'layers' },
      { id: 'route-planner', label: 'Smart Route Planner', href: '/shopkeeper/route-planner.html', icon: 'navigation', badge: 'Core' },
      { id: 'delivery-batches', label: 'Dispatch Batches', href: '/shopkeeper/delivery-batches.html', icon: 'truck' }
    ],
    delivery: [
      { id: 'dashboard', label: 'Rider Console', href: '/delivery/dashboard.html', icon: 'activity' },
      { id: 'assignments', label: 'Assigned Batches', href: '/delivery/assignments.html', icon: 'list' },
      { id: 'navigation', label: 'Turn-by-Turn GPS', href: '/delivery/navigation.html', icon: 'map', badge: 'Live' },
      { id: 'earnings', label: 'My Earnings', href: '/delivery/earnings.html', icon: 'dollar-sign' }
    ],
    admin: [
      { id: 'dashboard', label: 'Admin Command', href: '/admin/dashboard.html', icon: 'shield' },
      { id: 'users', label: 'User Directory', href: '/admin/users.html', icon: 'users' },
      { id: 'businesses', label: 'Merchant Approvals', href: '/admin/businesses.html', icon: 'check-square' },
      { id: 'deliveries', label: 'Fleet Telemetry', href: '/admin/deliveries.html', icon: 'globe' },
      { id: 'analytics', label: 'Platform Reports', href: '/admin/analytics.html', icon: 'pie-chart' }
    ]
  };

  const navItems = menusByRole[role] || menusByRole.customer;

  const menuHtml = navItems.map(item => {
    const isActive = item.id === activePage;
    return `
      <li class="sidebar-item ${isActive ? 'active' : ''}">
        <a href="${item.href}">
          <span style="font-size: 1.1rem; line-height: 1;">✦</span>
          <span>${item.label}</span>
          ${item.badge ? `<span class="item-badge">${item.badge}</span>` : ''}
        </a>
      </li>
    `;
  }).join('');

  sidebarContainer.innerHTML = `
    <div class="sidebar-header">
      <a href="/" class="sidebar-brand">
        <div class="brand-icon-box" style="width: 32px; height: 32px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
          </svg>
        </div>
        <span>TEA<span style="color: var(--primary-gold);">ROUTE</span></span>
      </a>
      <span class="sidebar-brand-badge">${role}</span>
    </div>

    <ul class="sidebar-menu">
      <li class="sidebar-section-title">Navigation</li>
      ${menuHtml}

      <li class="sidebar-section-title" style="margin-top: 1rem;">Role Switcher (Fast QA)</li>
      <li class="sidebar-item"><a href="/customer/dashboard.html"><span>👤</span> Customer</a></li>
      <li class="sidebar-item"><a href="/hotel/dashboard.html"><span>🏨</span> Hotel Owner</a></li>
      <li class="sidebar-item"><a href="/shopkeeper/dashboard.html"><span>☕</span> Chai Shopkeeper</a></li>
      <li class="sidebar-item"><a href="/delivery/dashboard.html"><span>🛵</span> Delivery Partner</a></li>
      <li class="sidebar-item"><a href="/admin/dashboard.html"><span>🛡️</span> Admin Console</a></li>
    </ul>

    <div class="sidebar-footer">
      <div class="user-profile-widget">
        <div class="user-avatar">${(user.name || 'U').charAt(0)}</div>
        <div class="user-info">
          <div class="user-name">${user.name}</div>
          <div class="user-role-label">${user.email || role}</div>
        </div>
        <button id="sidebar-logout" title="Sign Out" class="btn btn-icon btn-secondary btn-sm" style="margin-left: auto;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  // Attach logout handler
  const logoutBtn = document.getElementById('sidebar-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.logout();
      window.location.href = '/login.html';
    });
  }

  // Render Mobile Bottom Bar if missing
  let mobileBar = document.getElementById('mobile-bottom-bar');
  if (!mobileBar) {
    mobileBar = document.createElement('nav');
    mobileBar.id = 'mobile-bottom-bar';
    mobileBar.className = 'mobile-bottom-nav';
    document.body.appendChild(mobileBar);
  }

  mobileBar.innerHTML = navItems.slice(0, 4).map(item => `
    <a href="${item.href}" class="mobile-nav-link ${item.id === activePage ? 'active' : ''}">
      <span style="font-size: 1.15rem;">✦</span>
      <span>${item.label.split(' ')[0]}</span>
    </a>
  `).join('');
}
