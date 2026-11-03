/**
 * TeaRoute Map Configuration
 * High-performance OpenFreeMap & OpenStreetMap vector styles.
 * NO Google Maps required. 100% Free & Open-Source GIS.
 */

export const MAP_CONFIG = {
  // Free vector tile style hosted by OpenFreeMap (Liberty style)
  styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  
  // Public OSRM routing endpoint for driving directions
  osrmEndpoint: 'https://router.project-osrm.org/route/v1/driving',

  // Default coordinate center: Koramangala, Bengaluru [lng, lat]
  defaultCenter: [77.6245, 12.9352],
  defaultZoom: 14.5,
  defaultPitch: 45, // 3D tilted map perspective
  defaultBearing: -15,

  // Route styling
  routeGlowColor: '#FF6B00',
  routeLineColor: '#F59E0B',
  routeLineWidth: 5,
  routeGlowWidth: 10,

  // Proximity threshold
  proximityThresholdMeters: 1000 // 1 KM
};
