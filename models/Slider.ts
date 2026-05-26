import mongoose, { Schema, model, models } from 'mongoose';

const sliderSchema = new Schema({
  image: { type: String, required: true },
  title: { type: String },
  subtitle: { type: String },
  description: { type: String },
  link: { type: String },
  buttonText: { type: String },
}, { timestamps: true });

export const Slider = models.Slider || model('Slider', sliderSchema);
