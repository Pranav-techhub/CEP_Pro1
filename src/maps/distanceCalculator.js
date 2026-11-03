/**
 * Turf.js Distance and Travel Calculator
 */
import * as turf from '@turf/turf';

export const distanceCalculator = {
  /**
   * Calculate distance between two coordinates in kilometers or meters
   * @param {[number, number]} from - [lng, lat]
   * @param {[number, number]} to - [lng, lat]
   * @param {'kilometers' | 'meters'} units
   * @returns {number}
   */
  getDistance(from, to, units = 'kilometers') {
    if (!from || !to) return 0;
    const point1 = turf.point(from);
    const point2 = turf.point(to);
    return turf.distance(point1, point2, { units });
  },

  /**
   * Format distance into human-friendly string (e.g. "850 m" or "2.4 km")
   */
  formatDistance(km) {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  },

  /**
   * Estimate travel duration in minutes assuming average city delivery speed (25 km/h)
   * if OSRM duration is not available.
   */
  estimateDurationMinutes(km, avgSpeedKmh = 24) {
    const hours = km / avgSpeedKmh;
    const mins = Math.ceil(hours * 60);
    return Math.max(mins, 2);
  },

  /**
   * Format duration into "14 mins" or "1 hr 10 mins"
   */
  formatDuration(mins) {
    if (mins < 60) return `${mins} mins`;
    const hrs = Math.floor(mins / 60);
    const remainder = mins % 60;
    return remainder > 0 ? `${hrs} hr ${remainder} mins` : `${hrs} hr`;
  },

  /**
   * Calculate compass bearing between two points
   */
  getBearing(from, to) {
    const point1 = turf.point(from);
    const point2 = turf.point(to);
    return turf.bearing(point1, point2);
  }
};
