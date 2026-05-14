import mongoose, { Schema, model, models } from 'mongoose';

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  icon: { type: String }, // e.g. "🥭"
}, { timestamps: true });

export const Category = models.Category || model('Category', categorySchema);
