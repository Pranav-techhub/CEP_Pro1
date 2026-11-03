/**
 * TeaRoute Client-Side Security & Route Guard
 * Enforces role access, protects dashboard pages, sanitizes input.
 */
import { store } from '../services/store.js';

export const securityGuard = {
  /**
   * Protect a dashboard route by checking user session and role
   * @param {string|string[]} allowedRoles - Role or array of allowed roles
   */
  requireAuth(allowedRoles = []) {
    const user = store.getCurrentUser();
    if (!user) {
      window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }

    if (allowedRoles.length > 0) {
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      if (!roles.includes(user.role)) {
        console.warn(`Access denied: User role '${user.role}' not permitted on this page.`);
        // Redirect to their own dashboard
        switch (user.role) {
          case 'hotel': window.location.href = '/hotel/dashboard.html'; break;
          case 'shopkeeper': window.location.href = '/shopkeeper/dashboard.html'; break;
          case 'delivery': window.location.href = '/delivery/dashboard.html'; break;
          case 'admin': window.location.href = '/admin/dashboard.html'; break;
          default: window.location.href = '/customer/dashboard.html'; break;
        }
        return false;
      }
    }
    return true;
  },

  /**
   * Escape HTML to prevent XSS in rendered templates
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
