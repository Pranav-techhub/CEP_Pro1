/**
 * TeaRoute Cloud Firestore Operations
 * Collections: users, businesses, products, orders, deliveryBatches, invoices, coupons
 */
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config.js';
import { store } from '../services/store.js';

export const firestoreService = {
  // Orders
  async createOrder(orderData) {
    if (isFirebaseConfigured && db) {
      const orderRef = doc(collection(db, 'orders'));
      const payload = {
        ...orderData,
        id: orderRef.id,
        createdAt: serverTimestamp()
      };
      await setDoc(orderRef, payload);
      store.saveOrder(payload);
      return payload;
    }
    return store.saveOrder(orderData);
  },

  async getOrdersForBusiness(businessId) {
    if (isFirebaseConfigured && db) {
      const q = query(
        collection(db, 'orders'),
        where('businessId', '==', businessId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    return store.getOrders(businessId);
  },

  async updateOrderStatus(orderId, status) {
    if (isFirebaseConfigured && db) {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp()
      });
    }
    return store.updateOrderStatus(orderId, status);
  },

  // Batches
  async saveBatch(batchData) {
    if (isFirebaseConfigured && db) {
      const batchRef = doc(db, 'deliveryBatches', batchData.id);
      await setDoc(batchRef, {
        ...batchData,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    return store.saveBatch(batchData);
  }
};
