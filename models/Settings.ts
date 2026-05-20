import mongoose, { Schema, model, models } from 'mongoose';

const settingsSchema = new Schema({
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  aboutUs: { type: String, default: '' },
  termsConditions: { type: String, default: '' },
  cancellationPolicy: { type: String, default: '' },
  refundPolicy: { type: String, default: '' },
  privacyPolicy: { type: String, default: '' },
  maxCodAmount: { type: Number, default: 2000 }, // Default 2000
  razorpayKeyId: { type: String, default: '' },
  razorpayKeySecret: { type: String, default: '' },
  isCodEnabled: { type: Boolean, default: true },
  isRazorpayEnabled: { type: Boolean, default: true },
  topBannerText: { type: String, default: 'Authentic Godavari • Global Shipping Available' },
  defaultProductImage: { type: String, default: 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000' },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactAddress: { type: String, default: '' },
}, { timestamps: true });

export const Settings = models.Settings || model('Settings', settingsSchema);
