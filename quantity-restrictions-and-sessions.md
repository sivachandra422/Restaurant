# Quantity Restrictions & Session Management Guide

## 🎯 **Overview**
Your restaurant menu system now includes advanced quantity restrictions and session-based order management to handle multiple orders from different tables efficiently.

## 📊 **Quantity Restrictions**

### **Item-Specific Limits**
Each menu item now has configurable quantity limits:

| Category | Item Type | Max Quantity | Reason |
|----------|-----------|--------------|---------|
| **Biryani** | Premium (Mughlai) | 3 | High-value, limited preparation |
| **Biryani** | Regular | 5 | Standard limit |
| **Curries** | Premium (Dragon, Kaju) | 6 | Premium ingredients |
| **Curries** | Regular | 8 | Standard limit |
| **Rice/Noodles** | Regular | 12-15 | Higher limit for staple items |
| **Breads** | Pulka | 50 | High limit with bulk pricing |

### **Bulk Pricing for High-Quantity Items**
- **Pulkas**: 5+ = ₹18 each, 10+ = ₹16 each, 20+ = ₹15 each
- **Rice Items**: Higher limits for family orders
- **Bread Items**: Designed for bulk orders

### **Validation Features**
- ✅ **Real-time validation** during cart updates
- ✅ **Visual indicators** when max quantity reached
- ✅ **Error messages** for quantity violations
- ✅ **Bulk pricing** automatically applied

## 🔄 **Session Management**

### **Table-Specific Sessions**
Each table gets a unique session ID:
```
Table 1: table-1-1703123456789
Table 5: table-5-1703123456790
```

### **Session Features**
- ✅ **Isolated carts** per table
- ✅ **Order history** tracking
- ✅ **Session persistence** across page reloads
- ✅ **Table number** capture from QR codes
- ✅ **Concurrent orders** from multiple tables

### **Session Data Structure**
```typescript
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  tableNumber: number | null;
  sessionId: string | null;
  orderHistory: OrderHistoryItem[];
}
```

## 🛒 **Cart Management**

### **Quantity Controls**
- **Add to Cart**: Respects item-specific limits
- **Increase Quantity**: Stops at max limit
- **Decrease Quantity**: Removes item when reaches 0
- **Bulk Pricing**: Automatically calculated

### **Visual Feedback**
- **Max Quantity Warning**: Red badge when limit reached
- **Bulk Pricing Display**: Shows tiered pricing
- **Quantity Limits**: Displayed on menu cards
- **Session Info**: Shows table and session details

## 📱 **QR Code Integration**

### **Table-Specific URLs**
```
Table 1: https://sri-kanya-restaurant-menu.onrender.com/menu?table=1
Table 5: https://sri-kanya-restaurant-menu.onrender.com/menu?table=5
```

### **Automatic Session Creation**
- QR code scan → Table number captured
- New session ID generated
- Cart cleared for fresh start
- Order history maintained

## 🍽️ **Order Processing**

### **Enhanced Order Data**
```typescript
interface OrderData {
  orderId: string;
  sessionId: string;
  tableNumber: number;
  items: Array<{
    maxQuantity?: number;
    bulkPricing?: { quantity: number; price: number }[];
  }>;
  quantityValidation: {
    totalItems: number;
    maxItemsPerOrder: number;
    hasBulkItems: boolean;
    bulkItemsCount: number;
  };
}
```

### **Validation Checks**
- ✅ **Item quantity limits** enforced
- ✅ **Total order limits** (50 items max)
- ✅ **Bulk item tracking** for analytics
- ✅ **Session validation** for security

## 📊 **Analytics & Reporting**

### **Quantity Analytics**
- **Popular items** by quantity
- **Bulk order patterns**
- **Table-specific** ordering trends
- **Peak time** analysis

### **Session Analytics**
- **Table utilization** tracking
- **Order frequency** per table
- **Session duration** analysis
- **Customer behavior** patterns

## 🔧 **Technical Implementation**

### **Menu Data Structure**
```typescript
interface MenuItem {
  id: string;
  name: string;
  price: number;
  maxQuantity?: number;
  bulkPricing?: { quantity: number; price: number }[];
}
```

### **Cart Context Functions**
```typescript
const {
  getMaxQuantity,    // Get item-specific limit
  getBulkPrice,      // Calculate bulk pricing
  addOrderToHistory, // Track order history
  setTableNumber,    // Set table and session
} = useCart();
```

### **API Validation**
```typescript
// Server-side validation
for (const item of data.items) {
  if (item.maxQuantity && item.quantity > item.maxQuantity) {
    return `Quantity exceeds limit for ${item.name}`;
  }
}
```

## 🎯 **Benefits**

### **For Restaurant**
- **Prevent over-ordering** of premium items
- **Manage kitchen capacity** efficiently
- **Track table-specific** ordering patterns
- **Optimize pricing** with bulk discounts
- **Handle multiple tables** simultaneously

### **For Customers**
- **Clear quantity limits** prevent confusion
- **Bulk pricing** saves money on large orders
- **Session isolation** prevents order mixing
- **Order history** for reference
- **Real-time validation** prevents errors

### **For Staff**
- **Kitchen notifications** with quantity details
- **Table-specific** order tracking
- **Bulk order** identification
- **Session management** for order history
- **Analytics** for business insights

## 🚀 **Usage Examples**

### **Scenario 1: Family Order**
- **Table 5** scans QR code
- **Orders 20 pulkas** (gets bulk pricing)
- **Orders 3 biryanis** (within limits)
- **Session tracks** complete order history

### **Scenario 2: Multiple Tables**
- **Table 1** places order (Session A)
- **Table 3** places order (Session B)
- **Table 5** places order (Session C)
- **All orders** processed independently

### **Scenario 3: Quantity Limits**
- **Customer tries** to order 10 Mughlai Biryani
- **System limits** to 3 (premium item)
- **Shows warning** and prevents order
- **Suggests alternatives** or smaller quantities

## 📋 **Configuration**

### **Environment Variables**
```env
# Optional: API key for order security
ORDER_API_KEY=your-secure-api-key

# Webhook URLs for order processing
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
KITCHEN_WEBHOOK_URL=https://your-kitchen-system.com/webhook
POS_WEBHOOK_URL=https://your-pos-system.com/webhook
ANALYTICS_WEBHOOK_URL=https://your-analytics.com/webhook
```

### **Menu Configuration**
```typescript
// Example: Premium biryani with low limit
{
  id: 'mughlai_biryani',
  name: 'Mughlai Biryani',
  price: 300,
  maxQuantity: 3, // Premium limit
  isSignature: true,
}

// Example: Bread with bulk pricing
{
  id: 'pulka',
  name: 'Pulka',
  price: 20,
  maxQuantity: 50, // High limit
  bulkPricing: [
    { quantity: 5, price: 18 },
    { quantity: 10, price: 16 },
    { quantity: 20, price: 15 },
  ],
}
```

## ✅ **Testing Checklist**

### **Quantity Restrictions**
- [ ] **Test max quantities** for each item type
- [ ] **Verify bulk pricing** calculations
- [ ] **Check visual indicators** for limits
- [ ] **Test error messages** for violations

### **Session Management**
- [ ] **Test QR code** table number capture
- [ ] **Verify session isolation** between tables
- [ ] **Check order history** persistence
- [ ] **Test concurrent orders** from multiple tables

### **Order Processing**
- [ ] **Validate order data** with quantity limits
- [ ] **Test webhook delivery** with session info
- [ ] **Verify analytics** data collection
- [ ] **Check error handling** for invalid orders

Your restaurant system is now fully equipped to handle complex ordering scenarios with proper quantity management and session tracking! 🍽️📱✨ 