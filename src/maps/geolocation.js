/**
 * TeaRoute Geolocation & Live GPS Tracker
 * Handles real hardware GPS via navigator.geolocation.watchPosition
 * and a distinctly labeled DEMO SIMULATOR for testing without physical travel.
 */

export class GeolocationTracker {
  constructor(options = {}) {
    this.watchId = null;
    this.isTracking = false;
    this.isDemoMode = false;
    this.simulationInterval = null;
    this.lastPosition = null;
    this.listeners = new Set();
    this.options = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
      ...options
    };
  }

  /**
   * Start genuine hardware GPS tracking
   * @param {(pos: { lng: number, lat: number, accuracy: number, heading: number|null, speed: number|null, timestamp: number, isDemo: boolean }) => void} callback
   */
  startRealTracking(callback) {
    if (this.isTracking) return;

    if (!('geolocation' in navigator)) {
      throw new Error('Geolocation API is not supported by your browser or environment.');
    }

    this.isDemoMode = false;
    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const payload = {
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
          accuracy: Math.round(pos.coords.accuracy),
          heading: pos.coords.heading || null,
          speed: pos.coords.speed !== null ? Math.round(pos.coords.speed * 3.6) : null, // km/h
          timestamp: pos.timestamp,
          isDemo: false
        };
        this.lastPosition = payload;
        if (callback) callback(payload);
        this.emit(payload);
      },
      (err) => {
        console.error('GPS Watch Error:', err.message);
        const errPayload = {
          error: err.message,
          code: err.code,
          timestamp: Date.now()
        };
        this.emitError(errPayload);
      },
      this.options
    );
  }

  /**
   * Start Demo / Simulation Mode along a set of route coordinates
   * Clearly identified with isDemo: true
   * @param {Array<[number, number]>} routeCoordinates
   * @param {number} speedIntervalMs
   */
  startDemoSimulation(routeCoordinates, speedIntervalMs = 1200) {
    this.stopTracking();
    if (!routeCoordinates || routeCoordinates.length === 0) return;

    this.isDemoMode = true;
    this.isTracking = true;
    let stepIndex = 0;

    this.simulationInterval = setInterval(() => {
      if (stepIndex >= routeCoordinates.length) {
        stepIndex = 0; // Loop or reach destination
      }

      const coord = routeCoordinates[stepIndex];
      const nextCoord = routeCoordinates[(stepIndex + 1) % routeCoordinates.length];

      // Approximate bearing
      const dLng = nextCoord[0] - coord[0];
      const dLat = nextCoord[1] - coord[1];
      const heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

      const payload = {
        lng: coord[0],
        lat: coord[1],
        accuracy: 5,
        heading: heading,
        speed: 28, // km/h
        timestamp: Date.now(),
        isDemo: true
      };

      this.lastPosition = payload;
      this.emit(payload);
      stepIndex++;
    }, speedIntervalMs);
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.simulationInterval !== null) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isTracking = false;
    this.isDemoMode = false;
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  emit(data) {
    for (const fn of this.listeners) {
      try { fn(data); } catch (e) { console.error(e); }
    }
  }

  emitError(err) {
    for (const fn of this.listeners) {
      try { if (fn.onError) fn.onError(err); } catch (e) { console.error(e); }
    }
  }
}

export const gpsTracker = new GeolocationTracker();
