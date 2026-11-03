/**
 * TeaRoute MapLibre GL Instance Factory
 * Sets up the 3D vector map, layers, controls and camera utilities.
 */
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAP_CONFIG } from './mapConfig.js';

export function createTearouteMap(containerId, options = {}) {
  const container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
  if (!container) {
    throw new Error(`Map container #${containerId} was not found in the DOM.`);
  }

  const map = new maplibregl.Map({
    container: container,
    style: MAP_CONFIG.styleUrl,
    center: options.center || MAP_CONFIG.defaultCenter,
    zoom: options.zoom || MAP_CONFIG.defaultZoom,
    pitch: options.pitch !== undefined ? options.pitch : MAP_CONFIG.defaultPitch,
    bearing: options.bearing !== undefined ? options.bearing : MAP_CONFIG.defaultBearing,
    attributionControl: false,
    ...options
  });

  // Navigation controls (Zoom + Compass)
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

  // Fullscreen control
  map.addControl(new maplibregl.FullscreenControl(), 'top-right');

  // OpenStreetMap & OpenFreeMap attribution
  map.addControl(new maplibregl.AttributionControl({
    compact: true,
    customAttribution: '© <a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
  }), 'bottom-right');

  // Responsive resize
  window.addEventListener('resize', () => {
    map.resize();
  });

  return map;
}

/**
 * Fit map viewport to encompass all given coordinates
 */
export function fitCoordinates(map, coordsList, padding = 60) {
  if (!map || !coordsList || coordsList.length === 0) return;

  const bounds = new maplibregl.LngLatBounds();
  coordsList.forEach(coord => bounds.extend(coord));

  map.fitBounds(bounds, {
    padding: padding,
    maxZoom: 16.5,
    duration: 1200
  });
}
