import mongoose, { Schema, model, models } from 'mongoose';

const settingsSchema = new Schema({
  cgst: { type: Number, default: 0 },
  sgst: { type: Number, default: 0 },
  igst: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  aboutUs: { type: String, default: '' },
  ourMission: { type: String, default: 'Our mission is to preserve the authentic flavors of Godavari and deliver them to pickle lovers across the globe. We believe in quality without compromise, using only the finest ingredients sourced directly from local farmers.' },
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
  productsPerPage: { type: Number, default: 8 },
  contactPhone: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactAddress: { type: String, default: '' },
  fssaiNumber: { type: String, default: '' },
  instagramUrl: { type: String, default: '' },
  whatsappUrl: { type: String, default: '' },
  trustFeatures: {
    type: [{
      icon: { type: String, default: 'Sparkles' },
      title: { type: String, default: '' },
      description: { type: String, default: '' }
    }],
    default: [
      { icon: 'Sparkles', title: 'Traditional Recipes', description: 'Handed down through generations, cooked with authentic Godavari spices, sun-dried ingredients, and traditional cold-pressed oils.' },
      { icon: 'Leaf', title: '100% Natural & Pure', description: 'No chemical preservatives, zero artificial colors, and no MSG. We only pack pure, wholesome flavor inspired by nature.' },
      { icon: 'Truck', title: 'Express Fresh Delivery', description: 'Directly shipped from our kitchen in Visakhapatnam to your home. Double-sealed premium glass jars ensure freshness.' }
    ]
  }
}, { timestamps: true });

export const Settings = models.Settings || model('Settings', settingsSchema);
