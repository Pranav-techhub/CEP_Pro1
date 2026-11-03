/**
 * TeaRoute Central State Store & Mock Business Engine
 * Powers application state, role sessions, and pre-seeded realistic business datasets.
 */

// Safe storage wrapper supporting browser localStorage and memory fallback for tests
const memoryStore = new Map();
const safeStorage = {
  getItem(key) {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
    return memoryStore.get(key) || null;
  },
  setItem(key, val) {
    if (typeof localStorage !== 'undefined') { localStorage.setItem(key, val); return; }
    memoryStore.set(key, val);
  },
  removeItem(key) {
    if (typeof localStorage !== 'undefined') { localStorage.removeItem(key); return; }
    memoryStore.delete(key);
  }
};

function emitStoreEvent(name, detail) {
  if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

// Coordinates centered around Koramangala, Bengaluru (Silicon Valley delivery hub)
export const DEFAULT_HUB_COORDS = [77.6245, 12.9352]; // [lng, lat] for MapLibre

const SEED_BUSINESSES = [
  {
    id: 'biz_sharma_chai',
    name: 'Sharmaji Chai & Nashta',
    category: 'Chai & Snacks',
    ownerName: 'Ramesh Sharma',
    email: 'shopkeeper@tearoute.io',
    phone: '+91 98765 43210',
    address: 'Shop 14, 80 Feet Road, 4th Block Koramangala, Bengaluru',
    coordinates: [77.6255, 12.9348],
    rating: 4.9,
    reviewsCount: 342,
    isOpen: true,
    openingTime: '06:30 AM',
    closingTime: '10:30 PM',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    description: 'Fresh kulhad chai, steaming hot poha, crispy vada pav and morning snacks cooked fresh every 15 minutes.'
  },
  {
    id: 'biz_royal_darbar',
    name: 'The Royal Darbar Gourmet',
    category: 'Restaurant & Fine Dining',
    ownerName: 'Vikram Oberoi',
    email: 'hotel@tearoute.io',
    phone: '+91 98765 43211',
    address: 'Plot 42, 100 Feet Rd, Indiranagar, Bengaluru',
    coordinates: [77.6412, 12.9719],
    rating: 4.8,
    reviewsCount: 512,
    isOpen: true,
    openingTime: '11:00 AM',
    closingTime: '11:30 PM',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
    description: 'Authentic royal dum biryani, butter chicken, garlic naan and decadent Indian sweets.'
  },
  {
    id: 'biz_green_bakery',
    name: 'Artisan Bakery & Cafe',
    category: 'Bakery & Desserts',
    ownerName: 'Ananya Roy',
    email: 'bakery@tearoute.io',
    phone: '+91 98765 43212',
    address: '22, Sony World Signal, Koramangala, Bengaluru',
    coordinates: [77.6288, 12.9360],
    rating: 4.7,
    reviewsCount: 220,
    isOpen: true,
    openingTime: '08:00 AM',
    closingTime: '10:00 PM',
    status: 'approved',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: 'Sourdough breads, croissants, customized cheesecakes and cold brewed coffee.'
  }
];

const SEED_PRODUCTS = [
  // Sharmaji Chai & Nashta Products
  {
    id: 'prod_chai_kulhad',
    businessId: 'biz_sharma_chai',
    name: 'Special Masala Kulhad Chai',
    category: 'Chai & Beverages',
    price: 35,
    description: 'Brewed with cardamom, ginger, cloves, whole milk and served in eco-friendly terracotta kulhad.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80',
    prepTimeMins: 5,
    isAvailable: true,
    inStock: true
  },
  {
    id: 'prod_poha_indori',
    businessId: 'biz_sharma_chai',
    name: 'Indori Poha with Sev',
    category: 'Breakfast',
    price: 60,
    description: 'Fluffy steamed poha garnished with fresh coriander, pomegranate, roasted peanuts and Ratlami sev.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=400&q=80',
    prepTimeMins: 8,
    isAvailable: true,
    inStock: true
  },
  {
    id: 'prod_vada_pav',
    businessId: 'biz_sharma_chai',
    name: 'Mumbai Style Vada Pav (2 Pcs)',
    category: 'Snacks',
    price: 70,
    description: 'Crispy spiced potato dumpling encased in soft pav bun with garlic chutney and fried salted green chillies.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    prepTimeMins: 7,
    isAvailable: true,
    inStock: true
  },
  {
    id: 'prod_combo_breakfast',
    businessId: 'biz_sharma_chai',
    name: 'Morning Executive Breakfast Combo',
    category: 'Breakfast Combos',
    price: 130,
    description: '1 Hot Masala Chai + 1 Indori Poha + 2 Warm Samosas with mint chutney.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    prepTimeMins: 10,
    isAvailable: true,
    inStock: true
  },
  {
    id: 'prod_samosa_pair',
    businessId: 'biz_sharma_chai',
    name: 'Punjabi Crispy Samosa (2 Pcs)',
    category: 'Snacks',
    price: 50,
    description: 'Golden crust filled with spiced potatoes, green peas and whole coriander seeds.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80',
    prepTimeMins: 5,
    isAvailable: true,
    inStock: true
  },
  {
    id: 'prod_upma',
    businessId: 'biz_sharma_chai',
    name: 'South Indian Rava Upma',
    category: 'Breakfast',
    price: 65,
    description: 'Semolina cooked with mustard seeds, curry leaves, ginger, cashew nuts and served with coconut chutney.',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
    prepTimeMins: 8,
    isAvailable: true,
    inStock: true
  },

  // Royal Darbar Products
  {
    id: 'prod_royal_biryani',
    businessId: 'biz_royal_darbar',
    name: 'Awadhi Chicken Dum Biryani',
    category: 'Main Course',
    price: 360,
    description: 'Slow-cooked fragrant long-grain basmati rice with marinated chicken, saffron, and fried onions.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80',
    prepTimeMins: 20,
    isAvailable: true,
    inStock: true
  },
  {
    id: 'prod_butter_chicken',
    businessId: 'biz_royal_darbar',
    name: 'Old Delhi Butter Chicken',
    category: 'Main Course',
    price: 380,
    description: 'Charcoal grilled chicken tikka simmered in creamy makhani gravy with fenugreek leaves.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80',
    prepTimeMins: 18,
    isAvailable: true,
    inStock: true
  }
];

// Pre-seeded 5 morning orders from Sharmaji Chai & Nashta ready for Smart Batching test
const SEED_ORDERS = [
  {
    id: 'ORD-7001',
    businessId: 'biz_sharma_chai',
    businessName: 'Sharmaji Chai & Nashta',
    pickupCoordinates: [77.6255, 12.9348],
    customerId: 'cust_01',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 99887 76655',
    customerAddress: 'Flat 302, Prestige Pine Wood, Koramangala 3rd Block',
    customerCoordinates: [77.6280, 12.9372], // ~450m away
    items: [
      { id: 'prod_chai_kulhad', name: 'Special Masala Kulhad Chai', price: 35, quantity: 2 },
      { id: 'prod_poha_indori', name: 'Indori Poha with Sev', price: 60, quantity: 1 }
    ],
    subtotal: 130,
    discountAmount: 0,
    deliveryFee: 25,
    taxAmount: 6.5,
    totalAmount: 161.5,
    status: 'Ready for Pickup',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    promisedDeliveryTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    batchId: null,
    deliveryPartnerId: null
  },
  {
    id: 'ORD-7002',
    businessId: 'biz_sharma_chai',
    businessName: 'Sharmaji Chai & Nashta',
    pickupCoordinates: [77.6255, 12.9348],
    customerId: 'cust_02',
    customerName: 'Sneha Patel',
    customerPhone: '+91 98112 33445',
    customerAddress: 'Villa 12, Raheja Residency, 7th Block Koramangala',
    customerCoordinates: [77.6225, 12.9330], // ~500m away
    items: [
      { id: 'prod_chai_kulhad', name: 'Special Masala Kulhad Chai', price: 35, quantity: 1 },
      { id: 'prod_vada_pav', name: 'Mumbai Style Vada Pav (2 Pcs)', price: 70, quantity: 1 }
    ],
    subtotal: 105,
    discountAmount: 0,
    deliveryFee: 25,
    taxAmount: 5.25,
    totalAmount: 135.25,
    status: 'Ready for Pickup',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    promisedDeliveryTime: new Date(Date.now() + 26 * 60 * 1000).toISOString(),
    batchId: null,
    deliveryPartnerId: null
  },
  {
    id: 'ORD-7003',
    businessId: 'biz_sharma_chai',
    businessName: 'Sharmaji Chai & Nashta',
    pickupCoordinates: [77.6255, 12.9348],
    customerId: 'cust_03',
    customerName: 'Aditya Nair',
    customerPhone: '+91 97400 11223',
    customerAddress: 'WeWork Salarpuria Tower, Koramangala 4th Block',
    customerCoordinates: [77.6295, 12.9335], // ~600m away
    items: [
      { id: 'prod_combo_breakfast', name: 'Morning Executive Breakfast Combo', price: 130, quantity: 1 }
    ],
    subtotal: 130,
    discountAmount: 20,
    deliveryFee: 25,
    taxAmount: 5.5,
    totalAmount: 140.5,
    status: 'Ready for Pickup',
    paymentStatus: 'PAID',
    paymentMethod: 'CARD',
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    promisedDeliveryTime: new Date(Date.now() + 28 * 60 * 1000).toISOString(),
    batchId: null,
    deliveryPartnerId: null
  },
  {
    id: 'ORD-7004',
    businessId: 'biz_sharma_chai',
    businessName: 'Sharmaji Chai & Nashta',
    pickupCoordinates: [77.6255, 12.9348],
    customerId: 'cust_04',
    customerName: 'Priya Iyer',
    customerPhone: '+91 96321 88990',
    customerAddress: 'House 88, 5th Cross, 5th Block Koramangala',
    customerCoordinates: [77.6240, 12.9385], // ~700m away
    items: [
      { id: 'prod_chai_kulhad', name: 'Special Masala Kulhad Chai', price: 35, quantity: 2 },
      { id: 'prod_samosa_pair', name: 'Punjabi Crispy Samosa (2 Pcs)', price: 50, quantity: 1 }
    ],
    subtotal: 120,
    discountAmount: 0,
    deliveryFee: 25,
    taxAmount: 6.0,
    totalAmount: 151.0,
    status: 'Ready for Pickup',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    promisedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    batchId: null,
    deliveryPartnerId: null
  },
  {
    id: 'ORD-7005',
    businessId: 'biz_sharma_chai',
    businessName: 'Sharmaji Chai & Nashta',
    pickupCoordinates: [77.6255, 12.9348],
    customerId: 'cust_05',
    customerName: 'Karthik Rao',
    customerPhone: '+91 95355 44332',
    customerAddress: 'Apt 4B, Silver Oak Residency, 6th Block Koramangala',
    customerCoordinates: [77.6210, 12.9365], // ~800m away
    items: [
      { id: 'prod_chai_kulhad', name: 'Special Masala Kulhad Chai', price: 35, quantity: 1 },
      { id: 'prod_upma', name: 'South Indian Rava Upma', price: 65, quantity: 1 }
    ],
    subtotal: 100,
    discountAmount: 0,
    deliveryFee: 25,
    taxAmount: 5.0,
    totalAmount: 130.0,
    status: 'Ready for Pickup',
    paymentStatus: 'PAID',
    paymentMethod: 'ONLINE_UPI',
    createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    promisedDeliveryTime: new Date(Date.now() + 32 * 60 * 1000).toISOString(),
    batchId: null,
    deliveryPartnerId: null
  }
];

const SEED_RIDERS = [
  {
    id: 'rider_01',
    name: 'Amit Verma',
    phone: '+91 98450 12345',
    vehicleType: 'Electric Scooter',
    vehicleNumber: 'KA-01-EQ-9874',
    rating: 4.9,
    completedTrips: 1248,
    isOnline: true,
    currentCoordinates: [77.6250, 12.9340],
    activeBatchId: null
  },
  {
    id: 'rider_02',
    name: 'Deepak Kumar',
    phone: '+91 98450 54321',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'KA-05-MK-1234',
    rating: 4.8,
    completedTrips: 870,
    isOnline: true,
    currentCoordinates: [77.6270, 12.9360],
    activeBatchId: null
  }
];

class Store {
  constructor() {
    this.init();
  }

  init() {
    if (!safeStorage.getItem('tearoute_businesses')) {
      safeStorage.setItem('tearoute_businesses', JSON.stringify(SEED_BUSINESSES));
    }
    if (!safeStorage.getItem('tearoute_products')) {
      safeStorage.setItem('tearoute_products', JSON.stringify(SEED_PRODUCTS));
    }
    if (!safeStorage.getItem('tearoute_orders')) {
      safeStorage.setItem('tearoute_orders', JSON.stringify(SEED_ORDERS));
    }
    if (!safeStorage.getItem('tearoute_riders')) {
      safeStorage.setItem('tearoute_riders', JSON.stringify(SEED_RIDERS));
    }
    if (!safeStorage.getItem('tearoute_batches')) {
      safeStorage.setItem('tearoute_batches', JSON.stringify([]));
    }
  }

  // Current session management
  getCurrentUser() {
    const raw = safeStorage.getItem('tearoute_current_user');
    if (raw) {
      try { return JSON.parse(raw); } catch { return null; }
    }
    // Default demo session: Customer
    return {
      uid: 'cust_01',
      name: 'Rahul Sharma',
      email: 'customer@tearoute.io',
      role: 'customer',
      address: 'Flat 302, Prestige Pine Wood, Koramangala 3rd Block',
      coordinates: [77.6280, 12.9372]
    };
  }

  setCurrentUser(user) {
    safeStorage.setItem('tearoute_current_user', JSON.stringify(user));
    emitStoreEvent('tearoute:authChange', user);
  }

  logout() {
    safeStorage.removeItem('tearoute_current_user');
    emitStoreEvent('tearoute:authChange', null);
  }

  // Businesses
  getBusinesses() {
    return JSON.parse(safeStorage.getItem('tearoute_businesses') || '[]');
  }

  getBusinessById(id) {
    return this.getBusinesses().find(b => b.id === id);
  }

  // Products
  getProducts(businessId = null) {
    const all = JSON.parse(safeStorage.getItem('tearoute_products') || '[]');
    return businessId ? all.filter(p => p.businessId === businessId) : all;
  }

  saveProduct(product) {
    const products = this.getProducts();
    const idx = products.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      products[idx] = product;
    } else {
      product.id = 'prod_' + Date.now();
      products.push(product);
    }
    safeStorage.setItem('tearoute_products', JSON.stringify(products));
    return product;
  }

  // Orders
  getOrders(businessId = null) {
    const all = JSON.parse(safeStorage.getItem('tearoute_orders') || '[]');
    return businessId ? all.filter(o => o.businessId === businessId) : all;
  }

  getOrderById(id) {
    return this.getOrders().find(o => o.id === id);
  }

  saveOrder(order) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === order.id);
    if (idx >= 0) {
      orders[idx] = order;
    } else {
      orders.unshift(order);
    }
    safeStorage.setItem('tearoute_orders', JSON.stringify(orders));
    emitStoreEvent('tearoute:orderUpdated', order);
    return order;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.getOrderById(orderId);
    if (order) {
      order.status = newStatus;
      order.updatedAt = new Date().toISOString();
      return this.saveOrder(order);
    }
    return null;
  }

  // Batches
  getBatches() {
    return JSON.parse(safeStorage.getItem('tearoute_batches') || '[]');
  }

  saveBatch(batch) {
    const batches = this.getBatches();
    const idx = batches.findIndex(b => b.id === batch.id);
    if (idx >= 0) {
      batches[idx] = batch;
    } else {
      batches.unshift(batch);
    }
    safeStorage.setItem('tearoute_batches', JSON.stringify(batches));
    emitStoreEvent('tearoute:batchUpdated', batch);
    return batch;
  }

  // Riders
  getRiders() {
    return JSON.parse(safeStorage.getItem('tearoute_riders') || '[]');
  }

  getRiderById(id) {
    return this.getRiders().find(r => r.id === id);
  }

  // Cart
  getCart() {
    return JSON.parse(safeStorage.getItem('tearoute_cart') || '[]');
  }

  addToCart(product, quantity = 1, instructions = '') {
    const cart = this.getCart();
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({ product, quantity, instructions });
    }
    safeStorage.setItem('tearoute_cart', JSON.stringify(cart));
    emitStoreEvent('tearoute:cartUpdated', cart);
    return cart;
  }

  removeFromCart(productId) {
    const cart = this.getCart().filter(item => item.product.id !== productId);
    safeStorage.setItem('tearoute_cart', JSON.stringify(cart));
    emitStoreEvent('tearoute:cartUpdated', cart);
    return cart;
  }

  updateCartQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find(i => i.product.id === productId);
    if (item) {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }
      item.quantity = quantity;
      safeStorage.setItem('tearoute_cart', JSON.stringify(cart));
      emitStoreEvent('tearoute:cartUpdated', cart);
    }
    return cart;
  }

  clearCart() {
    safeStorage.setItem('tearoute_cart', JSON.stringify([]));
    emitStoreEvent('tearoute:cartUpdated', []);
  }
}

export const store = new Store();
