/**
 * TeaRoute Multi-Stop Route Optimizer
 * Transparent TSP heuristic: Nearest-Neighbor heuristic + 2-opt swap refinement.
 * Calculates practical delivery sequence from pickup hub to customer drop-offs.
 */
import { distanceCalculator } from './distanceCalculator.js';

export const routeOptimizer = {
  /**
   * Sequence delivery stops starting from pickup hub
   * @param {[number, number]} startCoord - Business pickup location [lng, lat]
   * @param {Array<{ id: string, coordinates: [number, number], [key: string]: any }>} stops - Customer drop locations
   * @returns {{ sequence: Array<any>, totalDistanceKm: number }}
   */
  optimizeSequence(startCoord, stops) {
    if (!stops || stops.length === 0) {
      return { sequence: [], totalDistanceKm: 0 };
    }
    if (stops.length === 1) {
      const d = distanceCalculator.getDistance(startCoord, stops[0].coordinates);
      return { sequence: [stops[0]], totalDistanceKm: d };
    }

    // Step 1: Nearest Neighbor Heuristic
    const remaining = [...stops];
    const ordered = [];
    let currentCoord = startCoord;

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const d = distanceCalculator.getDistance(currentCoord, remaining[i].coordinates);
        if (d < minDistance) {
          minDistance = d;
          nearestIdx = i;
        }
      }

      const nextStop = remaining.splice(nearestIdx, 1)[0];
      ordered.push(nextStop);
      currentCoord = nextStop.coordinates;
    }

    // Step 2: 2-opt Swap Refinement for up to 15 stops
    let improved = true;
    let iteration = 0;
    while (improved && iteration < 20) {
      improved = false;
      iteration++;

      for (let i = 0; i < ordered.length - 1; i++) {
        for (let k = i + 1; k < ordered.length; k++) {
          const currentDist = this.calculateTotalDistance(startCoord, ordered);
          
          // Reverse sub-segment [i...k]
          const newRoute = [
            ...ordered.slice(0, i),
            ...ordered.slice(i, k + 1).reverse(),
            ...ordered.slice(k + 1)
          ];
          const newDist = this.calculateTotalDistance(startCoord, newRoute);

          if (newDist < currentDist - 0.001) {
            ordered.splice(0, ordered.length, ...newRoute);
            improved = true;
          }
        }
      }
    }

    const totalDistanceKm = this.calculateTotalDistance(startCoord, ordered);
    return {
      sequence: ordered,
      totalDistanceKm: Number(totalDistanceKm.toFixed(2))
    };
  },

  calculateTotalDistance(startCoord, stops) {
    if (stops.length === 0) return 0;
    let total = distanceCalculator.getDistance(startCoord, stops[0].coordinates);
    for (let i = 0; i < stops.length - 1; i++) {
      total += distanceCalculator.getDistance(stops[i].coordinates, stops[i + 1].coordinates);
    }
    return total;
  }
};
