/**
 * TeaRoute OSRM Road Routing Engine
 * Fetches true road routes, turn coordinates, and renders glowing MapLibre paths.
 */
import { MAP_CONFIG } from './mapConfig.js';

export const routingService = {
  /**
   * Fetch true road route from OSRM
   * @param {Array<[number, number]>} coordinates - Array of [lng, lat] points
   * @returns {Promise<{ geometry: any, distanceKm: number, durationMins: number, steps: Array }>}
   */
  async getRoadRoute(coordinates) {
    if (!coordinates || coordinates.length < 2) {
      throw new Error('At least 2 points are required to compute a route.');
    }

    const coordsString = coordinates.map(c => `${c[0]},${c[1]}`).join(';');
    const url = `${MAP_CONFIG.osrmEndpoint}/${coordsString}?overview=full&geometries=geojson&steps=true`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`OSRM HTTP error: ${response.status}`);
      }
      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No road route found between selected points.');
      }

      const bestRoute = data.routes[0];
      const distanceKm = bestRoute.distance / 1000;
      const durationMins = Math.ceil(bestRoute.duration / 60);

      return {
        geometry: bestRoute.geometry,
        distanceKm,
        durationMins,
        steps: bestRoute.legs ? bestRoute.legs.flatMap(l => l.steps) : []
      };
    } catch (err) {
      console.warn('OSRM road routing fallback active:', err.message);
      // Fallback straight-line GeoJSON geometry if public demo server is throttled
      const fallbackGeometry = {
        type: 'LineString',
        coordinates: coordinates
      };
      return {
        geometry: fallbackGeometry,
        distanceKm: 0,
        durationMins: 0,
        steps: [],
        isFallback: true
      };
    }
  },

  /**
   * Draw or update route layer on MapLibre instance
   * @param {maplibregl.Map} map
   * @param {any} geojsonGeometry
   * @param {string} sourceId
   */
  renderRouteOnMap(map, geojsonGeometry, sourceId = 'tearoute-path') {
    if (!map || !geojsonGeometry) return;

    const sourceData = {
      type: 'Feature',
      properties: {},
      geometry: geojsonGeometry
    };

    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData(sourceData);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: sourceData
      });

      // Ambient glow layer beneath main line
      map.addLayer({
        id: `${sourceId}-glow`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': MAP_CONFIG.routeGlowColor,
          'line-width': MAP_CONFIG.routeGlowWidth,
          'line-opacity': 0.35,
          'line-blur': 4
        }
      });

      // Sharp primary route line
      map.addLayer({
        id: `${sourceId}-main`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': MAP_CONFIG.routeLineColor,
          'line-width': MAP_CONFIG.routeLineWidth,
          'line-opacity': 0.95
        }
      });
    }
  },

  /**
   * Remove route layer and source from map
   */
  clearRoute(map, sourceId = 'tearoute-path') {
    if (!map) return;
    if (map.getLayer(`${sourceId}-main`)) map.removeLayer(`${sourceId}-main`);
    if (map.getLayer(`${sourceId}-glow`)) map.removeLayer(`${sourceId}-glow`);
    if (map.getSource(sourceId)) map.removeSource(sourceId);
  }
};
