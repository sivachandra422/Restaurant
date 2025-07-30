// Test script for Sri Kanya Restaurant Webhook
// Run this with: node test-webhook.js

const testOrder = {
  orderId: `SRK-${Date.now()}`,
  restaurantName: 'Sri Kanya Family Restaurants',
  tableNumber: 5,
  timestamp: new Date().toISOString(),
  customer: {
    name: 'Test Customer',
    phone: '+91-9876543210',
  },
  items: [
    {
      id: 'chicken_dum_biryani_full',
      name: 'Chicken Dum Biryani (Full)',
      quantity: 2,
      unitPrice: 220,
      subtotal: 440,
      category: 'biryanis',
      isVeg: false,
      isSignature: true,
    },
    {
      id: 'paneer_butter_masala',
      name: 'Paneer Butter Masala',
      quantity: 1,
      unitPrice: 180,
      subtotal: 180,
      category: 'vegCurries',
      isVeg: true,
      isSignature: false,
    },
    {
      id: 'chicken_65',
      name: 'Chicken 65',
      quantity: 1,
      unitPrice: 200,
      subtotal: 200,
      category: 'nonVegCurries',
      isVeg: false,
      isSignature: false,
    }
  ],
  orderSummary: {
    itemCount: 4,
    subtotal: 820,
    tax: 0,
    serviceCharge: 0,
    discount: 0,
    grandTotal: 820,
  },
  specialInstructions: 'Less spicy please, extra mint chutney',
  orderType: 'dine-in',
  estimatedTime: '20-25 minutes',
  status: 'received',
};

async function testWebhook() {
  console.log('🧪 Testing Sri Kanya Restaurant Webhook...\n');
  
  try {
    console.log('📤 Sending test order...');
    console.log('Order ID:', testOrder.orderId);
    console.log('Table:', testOrder.tableNumber);
    console.log('Customer:', testOrder.customer.name);
    console.log('Total Items:', testOrder.orderSummary.itemCount);
    console.log('Total Amount: ₹', testOrder.orderSummary.grandTotal);
    console.log('');

    const response = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    });

    const result = await response.json();
    
    console.log('📥 Response received:');
    console.log('Status:', response.status);
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.success) {
      console.log('\n✅ Webhook test successful!');
      console.log('Order ID:', result.orderId);
      console.log('Estimated Time:', result.estimatedTime);
      
      if (result.webhookStatus && result.webhookStatus.length > 0) {
        console.log('\n🔗 Webhook Status:');
        result.webhookStatus.forEach(status => {
          const icon = status.status === 'success' ? '✅' : '❌';
          console.log(`${icon} ${status.type}: ${status.status}`);
          if (status.error) {
            console.log(`   Error: ${status.error}`);
          }
        });
      } else {
        console.log('\n⚠️  No webhook URLs configured in .env.local');
        console.log('   Add your webhook URLs to test full integration');
      }
    } else {
      console.log('\n❌ Webhook test failed:');
      console.log('Error:', result.message);
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message);
    console.log('\n💡 Make sure your development server is running:');
    console.log('   npm run dev');
  }
}

// Run the test
testWebhook(); 