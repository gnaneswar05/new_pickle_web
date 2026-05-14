import mongoose, { Schema, model, models } from 'mongoose';

const walletTransactionSchema = new Schema({
  userId: { type: String, required: true }, // Explicitly String to avoid cast issues with auth store IDs
  amount: { type: Number, required: true },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  description: { type: String, required: true },
}, { timestamps: true });

export const WalletTransaction = models.WalletTransaction || model('WalletTransaction', walletTransactionSchema);
