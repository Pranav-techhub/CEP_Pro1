/**
 * TeaRoute Smart Multi-Order Batching Engine
 * Core differentiator: Heuristic clustering & intelligent multi-drop dispatch.
 */
import { store } from './store.js';
import { distanceCalculator } from '../maps/distanceCalculator.js';
import { routeOptimizer } from '../maps/routeOptimization.js';
import { routingService } from '../maps/routing.js';

export const batchingEngine = {
  // Constraints
  MAX_BATCH_CAPACITY: 5, // Maximum orders per partner batch
  MAX_CLUSTER_RADIUS_KM: 3.0, // Maximum distance between grouped customer stops
  MAX_DEADLINE_SPREAD_MINS: 30, // Compatible delivery window spread

  /**
   * Analyze unassigned orders for a specific business and propose smart batches
   * @param {string} businessId
   * @returns {Promise<Array<{ batchId: string, name: string, orders: Array, pickup: Array, stops: Array, totalDistanceKm: number, estDurationMins: number, suggestedRiderId: string|null }>>}
   */
  async generateSuggestedBatches(businessId) {
    const business = store.getBusinessById(businessId);
    if (!business) return [];

    // Step 1 & 2: Orders from same business ready or preparing
    const orders = store.getOrders(businessId).filter(
      o => (o.status === 'Ready for Pickup' || o.status === 'Preparing') && !o.batchId
    );

    if (orders.length === 0) return [];

    const pickupCoord = business.coordinates;
    const candidates = orders.map(o => ({
      orderId: o.id,
      customerName: o.customerName,
      address: o.customerAddress,
      coordinates: o.customerCoordinates,
      itemsCount: o.items.reduce((s, i) => s + i.quantity, 0),
      rawOrder: o
    }));

    // Step 4 & 5: Group geographically compatible clusters
    const clusters = [];
    const visited = new Set();

    for (let i = 0; i < candidates.length; i++) {
      if (visited.has(candidates[i].orderId)) continue;

      const currentCluster = [candidates[i]];
      visited.add(candidates[i].orderId);

      for (let j = i + 1; j < candidates.length; j++) {
        if (visited.has(candidates[j].orderId)) continue;
        if (currentCluster.length >= this.MAX_BATCH_CAPACITY) break;

        // Check distance to existing cluster members
        const isClose = currentCluster.every(member => {
          const d = distanceCalculator.getDistance(member.coordinates, candidates[j].coordinates);
          return d <= this.MAX_CLUSTER_RADIUS_KM;
        });

        if (isClose) {
          currentCluster.push(candidates[j]);
          visited.add(candidates[j].orderId);
        }
      }

      clusters.push(currentCluster);
    }

    // Step 6, 7 & 8: Sequence stops and calculate road routing
    const suggestedBatches = [];
    const availableRiders = store.getRiders().filter(r => r.isOnline && !r.activeBatchId);

    for (let cIdx = 0; cIdx < clusters.length; cIdx++) {
      const cluster = clusters[cIdx];
      const stopTargets = cluster.map(c => ({
        id: c.orderId,
        coordinates: c.coordinates,
        name: c.customerName,
        address: c.address,
        rawOrder: c.rawOrder
      }));

      // Sequence stops using TSP 2-opt heuristic
      const { sequence, totalDistanceKm } = routeOptimizer.optimizeSequence(pickupCoord, stopTargets);

      // Estimate road route
      const fullPathCoords = [pickupCoord, ...sequence.map(s => s.coordinates)];
      let roadData;
      try {
        roadData = await routingService.getRoadRoute(fullPathCoords);
      } catch {
        roadData = {
          geometry: { type: 'LineString', coordinates: fullPathCoords },
          distanceKm: totalDistanceKm,
          durationMins: distanceCalculator.estimateDurationMinutes(totalDistanceKm)
        };
      }

      const assignedRider = availableRiders[cIdx] || null;

      suggestedBatches.push({
        id: `BATCH-${Date.now().toString().slice(-4)}-${cIdx + 1}`,
        businessId: business.id,
        businessName: business.name,
        pickupCoordinates: pickupCoord,
        pickupAddress: business.address,
        stops: sequence.map((stop, idx) => ({
          stopNumber: idx + 1,
          orderId: stop.id,
          customerName: stop.name,
          address: stop.address,
          coordinates: stop.coordinates,
          isDelivered: false,
          deliveredAt: null
        })),
        orderIds: sequence.map(s => s.id),
        totalOrders: sequence.length,
        totalDistanceKm: roadData.distanceKm || totalDistanceKm,
        estDurationMins: roadData.durationMins || distanceCalculator.estimateDurationMinutes(totalDistanceKm),
        routeGeometry: roadData.geometry,
        status: 'SUGGESTED',
        assignedRiderId: assignedRider ? assignedRider.id : null,
        assignedRiderName: assignedRider ? assignedRider.name : null,
        createdAt: new Date().toISOString()
      });
    }

    return suggestedBatches;
  },

  /**
   * Commit a suggested batch into active delivery
   * @param {any} batch
   * @param {string} riderId
   */
  confirmBatchDispatch(batch, riderId) {
    const rider = store.getRiderById(riderId);
    if (!rider) throw new Error('Selected delivery partner not found.');

    batch.status = 'DISPATCHED';
    batch.assignedRiderId = rider.id;
    batch.assignedRiderName = rider.name;
    batch.dispatchedAt = new Date().toISOString();

    // Update each order in the batch
    for (const stop of batch.stops) {
      const order = store.getOrderById(stop.orderId);
      if (order) {
        order.batchId = batch.id;
        order.deliveryPartnerId = rider.id;
        order.deliveryPartnerName = rider.name;
        order.status = 'Delivery Partner Assigned';
        store.saveOrder(order);
      }
    }

    // Update rider
    rider.activeBatchId = batch.id;
    const allRiders = store.getRiders();
    const rIdx = allRiders.findIndex(r => r.id === rider.id);
    if (rIdx >= 0) {
      allRiders[rIdx] = rider;
      localStorage.setItem('tearoute_riders', JSON.stringify(allRiders));
    }

    // Save batch in store
    store.saveBatch(batch);
    return batch;
  },

  /**
   * Mark an individual stop in a batch as delivered
   * @param {string} batchId
   * @param {string} orderId
   */
  markStopDelivered(batchId, orderId) {
    const batches = store.getBatches();
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return null;

    const stop = batch.stops.find(s => s.orderId === orderId);
    if (stop) {
      stop.isDelivered = true;
      stop.deliveredAt = new Date().toISOString();
    }

    // Update the specific order
    const order = store.getOrderById(orderId);
    if (order) {
      order.status = 'Delivered';
      order.deliveredAt = new Date().toISOString();
      store.saveOrder(order);
    }

    // If all stops are completed, mark batch as COMPLETED and free rider
    const allDone = batch.stops.every(s => s.isDelivered);
    if (allDone) {
      batch.status = 'COMPLETED';
      batch.completedAt = new Date().toISOString();

      if (batch.assignedRiderId) {
        const riders = store.getRiders();
        const r = riders.find(rd => rd.id === batch.assignedRiderId);
        if (r) {
          r.activeBatchId = null;
          r.completedTrips = (r.completedTrips || 0) + 1;
          localStorage.setItem('tearoute_riders', JSON.stringify(riders));
        }
      }
    }

    store.saveBatch(batch);
    return batch;
  }
};
