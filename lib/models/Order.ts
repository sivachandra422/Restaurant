import mongoose from 'mongoose';

// Order item schema
const orderItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  isVeg: { type: Boolean, default: false },
  category: { type: String, required: true },
  subtotal: { type: Number, required: true },
  specialInstructions: { type: String },
}, { _id: false });

// Order schema
const orderSchema = new mongoose.Schema({
  orderId: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  tableNumber: { 
    type: String, 
    required: true 
  },
  items: [orderItemSchema],
  totalAmount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'card', 'phonepe', 'gpay', 'upi'],
    default: 'cash'
  },
  customerName: { type: String },
  customerPhone: { type: String },
  specialInstructions: { type: String },
  timestamp: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  estimatedTime: { type: Number }, // in minutes
  notes: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
}, {
  timestamps: true,
  indexes: [
    { orderId: 1 },
    { status: 1 },
    { paymentStatus: 1 },
    { tableNumber: 1 },
    { createdAt: -1 },
    { timestamp: -1 }
  ]
});

// Virtual for order summary
orderSchema.virtual('orderSummary').get(function() {
  const itemCount = this.items.length;
  const grandTotal = this.totalAmount;
  const vegItems = this.items.filter(item => item.isVeg).length;
  const nonVegItems = itemCount - vegItems;
  
  return {
    itemCount,
    grandTotal,
    vegItems,
    nonVegItems,
    averageItemPrice: itemCount > 0 ? grandTotal / itemCount : 0
  };
});

// Ensure virtuals are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema); 