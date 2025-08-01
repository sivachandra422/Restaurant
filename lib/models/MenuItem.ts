import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: false },
  isSignature: { type: Boolean, default: false },
  isSpecial: { type: Boolean, default: false },
  image: { type: String, required: true },
  maxQuantity: { type: Number },
  minQuantity: { type: Number },
  bulkPricing: [{
    quantity: { type: Number },
    price: { type: Number }
  }],
  preparationTime: { type: Number },
  popularity: { type: Number, default: 0 },
  trending: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
menuItemSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', menuItemSchema); 