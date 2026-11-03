/**
 * TeaRoute Map Markers & Visual Pins
 * Renders animated HTML/SVG markers directly on MapLibre GL.
 */
import * as maplibregl from 'maplibre-gl';

export const markersFactory = {
  /**
   * Create animated delivery partner scooter marker
   * @param {[number, number]} coordinates
   * @param {number} bearing - Heading in degrees
   * @returns {maplibregl.Marker}
   */
  createScooterMarker(coordinates, bearing = 0) {
    const el = document.createElement('div');
    el.className = 'marker-scooter';
    el.title = 'TeaRoute Delivery Partner';
    el.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="18.5" cy="17.5" r="3.5"/>
        <circle cx="5.5" cy="17.5" r="3.5"/>
        <circle cx="15" cy="5" r="1"/>
        <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
      </svg>
    `;
    el.style.transform = `rotate(${bearing}deg)`;

    const marker = new maplibregl.Marker({ element: el, rotationAlignment: 'map' })
      .setLngLat(coordinates);

    return marker;
  },

  /**
   * Create Store / Vendor pickup marker
   * @param {[number, number]} coordinates
   * @param {string} storeName
   * @returns {maplibregl.Marker}
   */
  createStoreMarker(coordinates, storeName = 'Vendor Pickup') {
    const el = document.createElement('div');
    el.className = 'marker-store';
    el.title = storeName;
    el.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    `;

    const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
      .setHTML(`<div style="padding: 4px 8px; font-weight: 700; color: #0F172A;">${storeName}</div>`);

    return new maplibregl.Marker({ element: el })
      .setLngLat(coordinates)
      .setPopup(popup);
  },

  /**
   * Create Customer destination marker
   * @param {[number, number]} coordinates
   * @param {string} label
   * @param {number|null} stopNumber - If part of multi-stop batch
   * @returns {maplibregl.Marker}
   */
  createCustomerMarker(coordinates, label = 'Customer Delivery', stopNumber = null) {
    const el = document.createElement('div');
    el.className = 'marker-customer';
    el.title = label;
    el.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      ${stopNumber !== null ? `<div class="marker-stop-number">${stopNumber}</div>` : ''}
    `;

    const popup = new maplibregl.Popup({ offset: 25, closeButton: false })
      .setHTML(`<div style="padding: 4px 8px; font-weight: 700; color: #0F172A;">${label}</div>`);

    return new maplibregl.Marker({ element: el })
      .setLngLat(coordinates)
      .setPopup(popup);
  }
};
