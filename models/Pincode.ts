import mongoose, { Schema, model, models } from 'mongoose';

const pincodeSchema = new Schema({
  code: { type: String, required: true, unique: true },
  city: { type: String, required: true },
  deliveryCharge: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  expectedDelivery: { type: String, default: '3-5 Days' },
}, { timestamps: true });

export const Pincode = models.Pincode || model('Pincode', pincodeSchema);
