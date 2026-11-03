/**
 * TeaRoute Billing, Invoicing & Financial Accounting Service
 * Handles tax calculation (GST 5%), coupons, delivery fees, printable A4 invoices, and CSV export.
 */

export const billingService = {
  TAX_RATE: 0.05, // 5% GST
  BASE_DELIVERY_FEE: 25,
  FREE_DELIVERY_THRESHOLD: 400,

  /**
   * Calculate full breakdown for an order
   */
  calculateBill(items, couponCode = null, distanceKm = 1.5) {
    const subtotal = items.reduce((sum, item) => {
      const price = item.product ? item.product.price : item.price;
      const qty = item.quantity || 1;
      return sum + (price * qty);
    }, 0);

    // Coupon discount logic
    let discountAmount = 0;
    let appliedCoupon = null;
    if (couponCode) {
      const code = couponCode.trim().toUpperCase();
      if (code === 'TEAROUTE20') {
        discountAmount = Math.round(subtotal * 0.20);
        appliedCoupon = { code: 'TEAROUTE20', discountPercent: 20, description: '20% Welcome Discount' };
      } else if (code === 'CHAI10') {
        discountAmount = Math.min(50, Math.round(subtotal * 0.10));
        appliedCoupon = { code: 'CHAI10', discountPercent: 10, description: '10% Chai Lover Special' };
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = Number((discountedSubtotal * this.TAX_RATE).toFixed(2));

    let deliveryFee = this.BASE_DELIVERY_FEE;
    if (subtotal >= this.FREE_DELIVERY_THRESHOLD) {
      deliveryFee = 0;
    } else if (distanceKm > 4) {
      deliveryFee += Math.round((distanceKm - 4) * 8); // Extra per km beyond 4km
    }

    const totalAmount = Number((discountedSubtotal + taxAmount + deliveryFee).toFixed(2));

    return {
      subtotal,
      discountAmount,
      appliedCoupon,
      taxAmount,
      deliveryFee,
      totalAmount
    };
  },

  /**
   * Generate A4 printable invoice HTML markup
   */
  generateInvoiceHtml(order) {
    const invoiceNum = 'INV-' + (order.id || Date.now().toString().slice(-6));
    const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    const itemsRows = (order.items || []).map((item, idx) => {
      const name = item.product ? item.product.name : item.name;
      const price = item.product ? item.product.price : item.price;
      const qty = item.quantity || 1;
      const itemTotal = price * qty;
      return `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${name}</strong></td>
          <td>₹${price.toFixed(2)}</td>
          <td>${qty}</td>
          <td style="text-align: right; font-weight: 600;">₹${itemTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div class="invoice-container">
        <div class="invoice-header">
          <div>
            <div class="invoice-brand-title">TEAROUTE</div>
            <div style="font-size: 0.85rem; color: #64748B; margin-top: 4px;">Smart Logistics & On-Demand Delivery</div>
            <div style="font-size: 0.85rem; color: #64748B;">GSTIN: 29AABCT1337Q1Z8</div>
          </div>
          <div class="invoice-meta">
            <h3 style="color: #0F172A; margin-bottom: 4px;">TAX INVOICE</h3>
            <div><strong>${invoiceNum}</strong></div>
            <div>Date: ${invoiceDate}</div>
            <div style="color: #10B981; font-weight: 700; margin-top: 4px;">Status: ${order.paymentStatus || 'PAID'}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; font-size: 0.9rem;">
          <div>
            <div style="color: #64748B; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">Billed From (Vendor)</div>
            <div style="font-weight: 700; color: #0F172A; margin-top: 4px;">${order.businessName || 'TeaRoute Merchant Hub'}</div>
            <div style="color: #475569;">${order.businessAddress || 'Koramangala 4th Block, Bengaluru'}</div>
          </div>
          <div>
            <div style="color: #64748B; font-weight: 700; font-size: 0.75rem; text-transform: uppercase;">Delivered To (Customer)</div>
            <div style="font-weight: 700; color: #0F172A; margin-top: 4px;">${order.customerName || 'Valued Customer'}</div>
            <div style="color: #475569;">${order.customerAddress || 'Delivery Address'}</div>
            <div style="color: #475569;">Phone: ${order.customerPhone || 'N/A'}</div>
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Item Description</th>
              <th>Unit Price</th>
              <th>Qty</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="invoice-totals">
          <div class="invoice-total-row">
            <span>Item Subtotal:</span>
            <span>₹${(order.subtotal || 0).toFixed(2)}</span>
          </div>
          ${order.discountAmount > 0 ? `
          <div class="invoice-total-row" style="color: #10B981;">
            <span>Coupon Discount:</span>
            <span>- ₹${order.discountAmount.toFixed(2)}</span>
          </div>` : ''}
          <div class="invoice-total-row">
            <span>GST Tax (5%):</span>
            <span>₹${(order.taxAmount || 0).toFixed(2)}</span>
          </div>
          <div class="invoice-total-row">
            <span>Delivery & Packaging:</span>
            <span>₹${(order.deliveryFee || 0).toFixed(2)}</span>
          </div>
          <div class="invoice-total-row invoice-grand-total">
            <span>Grand Total:</span>
            <span>₹${(order.totalAmount || 0).toFixed(2)}</span>
          </div>
          <div style="margin-top: 0.75rem; font-size: 0.8rem; color: #64748B; text-align: right;">
            Payment Method: <strong>${order.paymentMethod || 'UPI / Online'}</strong>
          </div>
        </div>

        <div style="margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid #E2E8F0; text-align: center; font-size: 0.8rem; color: #94A3B8;">
          Thank you for choosing TeaRoute. For questions, contact support@tearoute.io
        </div>
      </div>
    `;
  },

  /**
   * Export array of orders to CSV file download
   */
  exportOrdersToCsv(orders, filename = 'tearoute-orders.csv') {
    const headers = ['Order ID', 'Date', 'Customer', 'Items Count', 'Subtotal (INR)', 'Discount', 'Tax', 'Delivery Fee', 'Total (INR)', 'Payment Status', 'Delivery Status'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.createdAt).toISOString(),
      `"${o.customerName || ''}"`,
      o.items ? o.items.length : 1,
      o.subtotal || 0,
      o.discountAmount || 0,
      o.taxAmount || 0,
      o.deliveryFee || 0,
      o.totalAmount || 0,
      o.paymentStatus || 'PAID',
      o.status || 'Pending'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
