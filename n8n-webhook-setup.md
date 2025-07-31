# N8N Webhook Setup Guide for Sri Kanya Restaurant

## 🚀 **Complete Order Flow Integration**

Your restaurant now has a complete automated order processing system:

### **1. Order Flow:**
```
QR Scanner → Restaurant Menu → Order Placement → N8N Webhook → Google Sheets + PDF + Print
```

### **2. Updated Webhook Configuration**

The API has been updated to send all order data to your n8n instance:

**Webhook URL:** `https://akshaya-dev.app.n8n.cloud/webhook/sri-kanya-order`

**Data Sent:**
- ✅ Complete order details with individual item pricing
- ✅ Customer information
- ✅ Table and session data
- ✅ Special instructions
- ✅ Priority flags for signature items

### **3. Environment Variables to Set**

Create a `.env.local` file in your project root:

```env
# N8N Webhook Configuration
N8N_WEBHOOK_URL=https://akshaya-dev.app.n8n.cloud/webhook/sri-kanya-order

# Optional: Separate webhooks for different purposes
KITCHEN_WEBHOOK_URL=https://akshaya-dev.app.n8n.cloud/webhook/sri-kanya-order
POS_WEBHOOK_URL=https://akshaya-dev.app.n8n.cloud/webhook/sri-kanya-order
ANALYTICS_WEBHOOK_URL=https://akshaya-dev.app.n8n.cloud/webhook/sri-kanya-order

# API Security
ORDER_API_KEY=test-api-key-123
```

### **4. N8N Workflow Setup**

**Import the workflow JSON into your n8n instance:**

1. **Go to your n8n dashboard:** `https://akshaya-dev.app.n8n.cloud`
2. **Import workflow:** Use the `n8n-workflow-order-processing.json` file
3. **Configure credentials:**
   - Google Sheets OAuth2
   - SMTP for email notifications
4. **Set environment variables in n8n:**
   - `GOOGLE_SHEET_ID`
   - Email credentials

### **5. What the N8N Workflow Does**

**📊 Google Sheets Integration:**
- Saves order summary to "Orders" sheet
- Saves individual items to "Order_Items" sheet
- Tracks customer data, pricing, categories

**📄 PDF Receipt Generation:**
- Creates professional order receipts
- Includes all item details with pricing
- Shows special instructions and priority flags
- Branded with Sri Kanya Restaurant styling

**📧 Email Notifications:**
- **Kitchen:** Order details with PDF receipt
- **Billing:** PDF receipt for printing
- **Customer:** SMS confirmation

**🖨️ Print Integration:**
- PDF receipts sent to billing email
- Ready for thermal printer or regular printer
- Professional formatting for customer receipts

### **6. Test the Integration**

1. **Place a test order** through your restaurant menu
2. **Check n8n execution logs** for webhook reception
3. **Verify Google Sheets** for data entry
4. **Check email** for PDF receipts
5. **Test print functionality** with billing machine

### **7. Sample Order Data Sent to N8N**

```json
{
  "orderId": "SRK-1753911085094",
  "sessionId": "table-1-1753911085094",
  "timestamp": "2025-07-30T21:31:25.094Z",
  "tableNumber": 1,
  "customerName": "John Doe",
  "customerPhone": "9876543210",
  "items": [
    {
      "name": "Mutton Biryani",
      "quantity": 1,
      "unitPrice": 250,
      "subtotal": 250,
      "category": "biryanis",
      "isVeg": false,
      "isSignature": true
    }
  ],
  "totalAmount": 250,
  "estimatedTime": "20-25 minutes",
  "priority": "HIGH",
  "specialInstructions": "Less spicy please"
}
```

### **8. Benefits of This Setup**

✅ **Complete Automation:** No manual data entry required
✅ **Real-time Tracking:** Orders instantly saved to sheets
✅ **Professional Receipts:** Branded PDF generation
✅ **Multi-channel Notifications:** Email + SMS alerts
✅ **Print Ready:** Direct integration with billing machine
✅ **Data Analytics:** Complete order history in Google Sheets
✅ **Error Handling:** Robust webhook processing

### **9. Next Steps**

1. **Import the n8n workflow** using the JSON file
2. **Configure Google Sheets credentials** in n8n
3. **Set up SMTP credentials** for email notifications
4. **Test with a sample order** to verify all integrations
5. **Customize the PDF template** if needed
6. **Set up print automation** with your billing machine

Your restaurant now has a **complete digital order management system**! 🍽️✨ 