/**
 * TeaRoute Universal Navigation Bar
 * Handles brand header, role badges, cart indicator, and fast role-switching tester.
 */
import { store } from '../services/store.js';

export function renderNavbar(targetContainerId = 'app-nav') {
  const container = document.getElementById(targetContainerId);
  if (!container) return;

  const user = store.getCurrentUser();
  const cart = store.getCart();
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const roleLabels = {
    customer: 'Customer',
    hotel: 'Hotel Partner',
    shopkeeper: 'Shopkeeper',
    delivery: 'Delivery Partner',
    admin: 'Administrator'
  };

  const roleHomeLinks = {
    customer: '/customer/dashboard.html',
    hotel: '/hotel/dashboard.html',
    shopkeeper: '/shopkeeper/dashboard.html',
    delivery: '/delivery/dashboard.html',
    admin: '/admin/dashboard.html'
  };

  const homeHref = user ? (roleHomeLinks[user.role] || '/') : '/';

  container.innerHTML = `
    <header class="landing-nav" id="main-header">
      <div class="container" style="height: 100%; display: flex; align-items: center; justify-content: space-between;">
        <a href="${homeHref}" class="nav-brand">
          <div class="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <span>TEA<span style="color: var(--primary-gold);">ROUTE</span></span>
        </a>

        <ul class="nav-links">
          <li><a href="/" class="nav-link">Home</a></li>
          <li><a href="/how-it-works.html" class="nav-link">How It Works</a></li>
          <li><a href="/about.html" class="nav-link">About Us</a></li>
          <li><a href="/customer/explore.html" class="nav-link">Explore Hub</a></li>
        </ul>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <!-- Cart Button for Customers -->
          <a href="/customer/cart.html" class="btn btn-secondary btn-sm" style="position: relative;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            ${cartCount > 0 ? `<span class="badge badge-orange" style="margin-left: 4px;">${cartCount}</span>` : ''}
          </a>

          ${user ? `
            <!-- Role Switcher & Profile -->
            <div style="position: relative; display: inline-block;">
              <button id="user-menu-btn" class="btn btn-secondary btn-sm" style="gap: 0.6rem;">
                <span class="status-dot active"></span>
                <span>${user.name}</span>
                <span class="badge badge-gold">${roleLabels[user.role] || user.role}</span>
              </button>
              
              <div id="user-menu-dropdown" class="card" style="display: none; position: absolute; right: 0; top: 110%; width: 230px; padding: 0.75rem; z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.7);">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); padding: 0.4rem 0.5rem; text-transform: uppercase;">
                  Switch Active Role:
                </div>
                <a href="/customer/dashboard.html" class="nav-link role-switch-btn" data-role="customer" style="display: block; padding: 0.45rem 0.5rem; border-radius: 6px;">Customer Portal</a>
                <a href="/hotel/dashboard.html" class="nav-link role-switch-btn" data-role="hotel" style="display: block; padding: 0.45rem 0.5rem; border-radius: 6px;">Hotel / Restaurant</a>
                <a href="/shopkeeper/dashboard.html" class="nav-link role-switch-btn" data-role="shopkeeper" style="display: block; padding: 0.45rem 0.5rem; border-radius: 6px;">Shopkeeper Vendor</a>
                <a href="/delivery/dashboard.html" class="nav-link role-switch-btn" data-role="delivery" style="display: block; padding: 0.45rem 0.5rem; border-radius: 6px;">Delivery Partner</a>
                <a href="/admin/dashboard.html" class="nav-link role-switch-btn" data-role="admin" style="display: block; padding: 0.45rem 0.5rem; border-radius: 6px;">Admin Command</a>
                <hr style="border: 0; border-top: 1px solid var(--border-subtle); margin: 0.5rem 0;">
                <button id="logout-btn" class="btn btn-sm" style="width: 100%; color: var(--accent-red); justify-content: flex-start; padding: 0.45rem 0.5rem;">
                  Sign Out
                </button>
              </div>
            </div>
          ` : `
            <a href="/login.html" class="btn btn-secondary btn-sm">Sign In</a>
            <a href="/register.html" class="btn btn-primary btn-sm">Join TeaRoute</a>
          `}
        </div>
      </div>
    </header>
  `;

  // Attach dropdown listeners
  const menuBtn = document.getElementById('user-menu-btn');
  const menuDropdown = document.getElementById('user-menu-dropdown');
  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menuDropdown.style.display = menuDropdown.style.display === 'block' ? 'none' : 'block';
    });
    document.addEventListener('click', () => {
      menuDropdown.style.display = 'none';
    });
  }

  // Role switch helper
  document.querySelectorAll('.role-switch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetRole = btn.getAttribute('data-role');
      const u = store.getCurrentUser() || {};
      u.role = targetRole;
      if (targetRole === 'hotel') u.name = 'Vikram Oberoi';
      else if (targetRole === 'shopkeeper') u.name = 'Ramesh Sharma';
      else if (targetRole === 'delivery') u.name = 'Amit Verma';
      else if (targetRole === 'admin') u.name = 'System Administrator';
      else u.name = 'Rahul Sharma';
      store.setCurrentUser(u);
    });
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      store.logout();
      window.location.href = '/login.html';
    });
  }

  // Scroll styling
  window.addEventListener('scroll', () => {
    const hdr = document.getElementById('main-header');
    if (hdr) {
      if (window.scrollY > 40) {
        hdr.classList.add('scrolled');
      } else {
        hdr.classList.remove('scrolled');
      }
    }
  });
}
