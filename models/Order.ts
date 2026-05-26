import mongoose, { Schema, model, models } from 'mongoose';

const orderItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new Schema({
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  products: [orderItemSchema],
  totalAmount: { type: Number, required: true }, // The Final Gross Total before wallet deduction
  paidAmount: { type: Number, default: 0 }, // The actual amount paid via online/COD
  walletAmount: { type: Number, default: 0 }, // Amount deducted from wallet
  taxAmount: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Shipped', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  tracking: [{
    stage: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }],
  paymentMethod: { type: String, default: 'COD' },
  pincode: String,
  expectedDelivery: { type: String, default: '' },
  userId: { type: String, required: true },
  courierName: { type: String, default: '' },
  courierTrackingId: { type: String, default: '' },
}, { timestamps: true });

export const Order = models.Order || model('Order', orderSchema);
