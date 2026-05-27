import mongoose, { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String },
  otp: { type: String },
  otpExpires: { type: Date },
  isVerified: { type: Boolean, default: false },
  walletBalance: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true });

export const User = models.User || model('User', userSchema);
