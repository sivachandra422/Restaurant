import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isVeg: { type: Boolean, required: true },
  specialNotes: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  sessionId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  tableNumber: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [orderItemSchema],
  specialInstructions: { type: String },
  totalAmount: { type: Number, required: true },
  estimatedTime: { type: String, required: true },
  priority: { type: String, default: 'NORMAL' },
  quantityValidation: {
    totalItems: { type: Number, required: true },
    maxItemsPerOrder: { type: Number, required: true },
    hasBulkItems: { type: Boolean, required: true },
    bulkItemsCount: { type: Number, required: true }
  },
  status: { type: String, default: 'pending' },
  paymentMethod: { type: String },
  paymentStatus: { type: String, default: 'pending' },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema); 