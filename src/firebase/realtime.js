/**
 * TeaRoute Firebase Realtime Database Telemetry Service
 * Live GPS sync for deliveryLocations/{partnerUid} & trackingSessions/{orderId}
 */
import { ref, set, onValue, off } from 'firebase/database';
import { rtdb, isFirebaseConfigured } from './config.js';

export const realtimeService = {
  /**
   * Update delivery partner GPS in Realtime Database
   */
  async updatePartnerLocation(partnerUid, locationPayload) {
    if (!partnerUid) return;

    if (isFirebaseConfigured && rtdb) {
      const locRef = ref(rtdb, `deliveryLocations/${partnerUid}`);
      await set(locRef, {
        latitude: locationPayload.lat,
        longitude: locationPayload.lng,
        accuracy: locationPayload.accuracy || 0,
        heading: locationPayload.heading || 0,
        speed: locationPayload.speed || 0,
        updatedAt: Date.now(),
        isOnline: true
      });
    } else {
      // Local broadcast
      window.dispatchEvent(
        new CustomEvent('tearoute:realtimeLocation', {
          detail: { partnerUid, ...locationPayload }
        })
      );
    }
  },

  /**
   * Subscribe to live partner location
   */
  subscribePartnerLocation(partnerUid, callback) {
    if (!partnerUid) return () => {};

    if (isFirebaseConfigured && rtdb) {
      const locRef = ref(rtdb, `deliveryLocations/${partnerUid}`);
      const listener = onValue(locRef, (snapshot) => {
        const val = snapshot.val();
        if (val && callback) callback(val);
      });
      return () => off(locRef, 'value', listener);
    } else {
      const handler = (e) => {
        if (e.detail && e.detail.partnerUid === partnerUid) {
          callback({
            latitude: e.detail.lat,
            longitude: e.detail.lng,
            accuracy: e.detail.accuracy,
            heading: e.detail.heading,
            speed: e.detail.speed,
            updatedAt: e.detail.timestamp
          });
        }
      };
      window.addEventListener('tearoute:realtimeLocation', handler);
      return () => window.removeEventListener('tearoute:realtimeLocation', handler);
    }
  }
};
