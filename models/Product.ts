import mongoose, { Schema, model, models } from 'mongoose';

const productSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  isTopSelling: { type: Boolean, default: false },
  rating: { type: Number, default: 4.9 },
  spiceLevel: { type: String, enum: ['Mild', 'Medium', 'Hot'], default: 'Medium' },
  variants: [{
    weight: String,
    price: Number
  }],
  images: { type: [String], default: [] }
}, { timestamps: true });

export const Product = models.Product || model('Product', productSchema);
