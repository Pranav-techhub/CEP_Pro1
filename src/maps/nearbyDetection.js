/**
 * TeaRoute 1-KM Proximity Arrival Detection Engine
 * Uses Turf.js straight-line geodesic distance calculation with single-fire locks.
 */
import * as turf from '@turf/turf';
import { notifications } from '../services/notificationService.js';
import { MAP_CONFIG } from './mapConfig.js';

class ProximityDetector {
  constructor() {
    // Set of order IDs that have already fired the 1-KM alert to prevent duplicate triggers
    this.triggeredOrders = new Set(
      JSON.parse(localStorage.getItem('tearoute_triggered_proximity_orders') || '[]')
    );
  }

  /**
   * Check distance between delivery partner current coordinate and customer destination coordinate.
   * If <= 1000 meters (1 KM) and not triggered before, fires alerts.
   * 
   * @param {string} orderId
   * @param {[number, number]} riderCoord - [lng, lat]
   * @param {[number, number]} destCoord - [lng, lat]
   * @param {string} roleContext - 'customer' | 'delivery' | 'shopkeeper'
   * @returns {{ distanceMeters: number, isWithin1Km: boolean, triggeredNow: boolean }}
   */
  evaluateProximity(orderId, riderCoord, destCoord, roleContext = 'customer') {
    if (!orderId || !riderCoord || !destCoord) {
      return { distanceMeters: Infinity, isWithin1Km: false, triggeredNow: false };
    }

    const pRider = turf.point(riderCoord);
    const pDest = turf.point(destCoord);
    const distanceMeters = Math.round(turf.distance(pRider, pDest, { units: 'meters' }));

    const isWithin1Km = distanceMeters <= MAP_CONFIG.proximityThresholdMeters;
    let triggeredNow = false;

    if (isWithin1Km && !this.triggeredOrders.has(orderId)) {
      this.triggeredOrders.add(orderId);
      localStorage.setItem(
        'tearoute_triggered_proximity_orders',
        JSON.stringify(Array.from(this.triggeredOrders))
      );
      triggeredNow = true;

      // Broadcast event so UI banners and audio can react
      window.dispatchEvent(
        new CustomEvent('tearoute:proximityArrival', {
          detail: { orderId, distanceMeters, roleContext }
        })
      );

      // Context-aware notifications as per specification
      if (roleContext === 'customer') {
        notifications.showToast(
          'Your delivery partner is just 1 KM away! (Straight-line proximity)',
          'proximity',
          '⚡ Arriving Soon!'
        );
      } else if (roleContext === 'delivery') {
        notifications.showToast(
          'You are within 1 KM of the delivery destination. Prepare for drop-off.',
          'proximity',
          '⚡ Near Destination'
        );
      } else if (roleContext === 'shopkeeper' || roleContext === 'hotel') {
        notifications.showToast(
          `Delivery partner for order #${orderId} is approaching customer (under 1 KM).`,
          'info',
          '⚡ Approaching Customer'
        );
      }
    }

    return { distanceMeters, isWithin1Km, triggeredNow };
  }

  hasTriggered(orderId) {
    return this.triggeredOrders.has(orderId);
  }

  resetOrder(orderId) {
    this.triggeredOrders.delete(orderId);
    localStorage.setItem(
      'tearoute_triggered_proximity_orders',
      JSON.stringify(Array.from(this.triggeredOrders))
    );
  }
}

export const proximityDetector = new ProximityDetector();
