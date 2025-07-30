# QR Code Setup Guide for Sri Kanya Restaurant

## 🎯 **Overview**
Generate QR codes for each table that customers can scan to access your menu directly with their table number pre-filled.

## 📋 **Table URLs**

### **Your Restaurant Menu URLs**
```
Table 1: https://sri-kanya-restaurant-menu.onrender.com/menu?table=1
Table 2: https://sri-kanya-restaurant-menu.onrender.com/menu?table=2
Table 3: https://sri-kanya-restaurant-menu.onrender.com/menu?table=3
Table 4: https://sri-kanya-restaurant-menu.onrender.com/menu?table=4
Table 5: https://sri-kanya-restaurant-menu.onrender.com/menu?table=5
Table 6: https://sri-kanya-restaurant-menu.onrender.com/menu?table=6
Table 7: https://sri-kanya-restaurant-menu.onrender.com/menu?table=7
Table 8: https://sri-kanya-restaurant-menu.onrender.com/menu?table=8
Table 9: https://sri-kanya-restaurant-menu.onrender.com/menu?table=9
Table 10: https://sri-kanya-restaurant-menu.onrender.com/menu?table=10
```

## 🔧 **Method 1: Online QR Code Generators**

### **Option A: QR Code Generator (Recommended)**
1. Go to [qr-code-generator.com](https://www.qr-code-generator.com/)
2. Select "URL" as the content type
3. Enter your table URL (e.g., `https://sri-kanya-restaurant-menu.onrender.com/menu?table=1`)
4. Click "Generate QR Code"
5. Download the QR code image
6. Print and place on the table

### **Option B: Google Charts API**
Use this URL format to generate QR codes:
```
https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=https://sri-kanya-restaurant-menu.onrender.com/menu?table=1
```

### **Option C: QR Code Monkey**
1. Visit [qrcode-monkey.com](https://www.qrcode-monkey.com/)
2. Enter your table URL
3. Customize with your restaurant logo
4. Download and print

## 🖨️ **Method 2: Bulk QR Code Generation**

### **Using Python Script**
Create a file called `generate-qr-codes.py`:

```python
import qrcode
import os

# Create output directory
if not os.path.exists('qr-codes'):
    os.makedirs('qr-codes')

# Generate QR codes for tables 1-10
for table_num in range(1, 11):
    url = f"https://sri-kanya-restaurant-menu.onrender.com/menu?table={table_num}"
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Save image
    img.save(f'qr-codes/table-{table_num}-qr.png')
    print(f"Generated QR code for Table {table_num}")

print("All QR codes generated successfully!")
```

### **Installation and Usage**
```bash
pip install qrcode[pil]
python generate-qr-codes.py
```

## 🎨 **Method 3: Custom QR Codes with Logo**

### **Using QR Code Generator with Logo**
1. Go to [qrcode-generator.com](https://www.qr-code-generator.com/)
2. Enter your table URL
3. Click "Add Logo"
4. Upload your restaurant logo
5. Adjust logo size and position
6. Download the custom QR code

## 📱 **Method 4: Mobile Apps**

### **QR Code Generator Apps**
- **QR Code Generator** (iOS/Android)
- **QR & Barcode Scanner** (iOS/Android)
- **QR Code Reader** (iOS/Android)

## 🖼️ **QR Code Design Tips**

### **Size Recommendations**
- **Small tables**: 2x2 inches (5x5 cm)
- **Medium tables**: 3x3 inches (7.5x7.5 cm)
- **Large tables**: 4x4 inches (10x10 cm)

### **Placement Ideas**
- **Table stands**: Clear acrylic holders
- **Table tents**: Folded card holders
- **Wall mounted**: Near each table
- **Menu holders**: Attached to existing holders

### **Printing Options**
- **Sticker labels**: Easy to apply and replace
- **Acrylic stands**: Professional look
- **Table tents**: Folded card format
- **Wall posters**: Large format for visibility

## 🏷️ **QR Code Labels**

### **Recommended Label Format**
```
┌─────────────────────────┐
│     SRI KANYA          │
│   FAMILY RESTAURANTS   │
│                         │
│    [QR CODE HERE]      │
│                         │
│   📱 Scan to Order     │
│   🍽️ Table 1          │
└─────────────────────────┘
```

## 📊 **Testing Your QR Codes**

### **Test Each QR Code**
1. Generate QR codes for all tables
2. Test each one with your phone
3. Verify it opens the correct table number
4. Test the ordering process

### **Test URLs**
```
Table 1: https://sri-kanya-restaurant-menu.onrender.com/menu?table=1
Table 5: https://sri-kanya-restaurant-menu.onrender.com/menu?table=5
```

## 🎯 **Implementation Steps**

### **Step 1: Generate QR Codes**
Choose one of the methods above to generate QR codes for all your tables.

### **Step 2: Print and Laminate**
- Print on high-quality paper
- Laminate for durability
- Consider waterproof options for outdoor tables

### **Step 3: Install on Tables**
- Place QR codes prominently on each table
- Ensure good lighting for easy scanning
- Add instructions if needed

### **Step 4: Train Staff**
- Explain the QR code system to staff
- Show them how to test QR codes
- Provide backup menus if needed

## 💡 **Advanced Features**

### **Custom QR Code with Restaurant Branding**
```python
import qrcode
from PIL import Image, ImageDraw, ImageFont

def create_custom_qr(table_num):
    # Generate QR code
    url = f"https://sri-kanya-restaurant-menu.onrender.com/menu?table={table_num}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR image
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Create custom background
    background = Image.new('RGB', (400, 500), 'white')
    draw = ImageDraw.Draw(background)
    
    # Add restaurant name
    try:
        font = ImageFont.truetype("arial.ttf", 24)
    except:
        font = ImageFont.load_default()
    
    draw.text((200, 50), "SRI KANYA", fill="black", anchor="mm", font=font)
    draw.text((200, 80), "FAMILY RESTAURANTS", fill="black", anchor="mm", font=font)
    draw.text((200, 120), f"Table {table_num}", fill="black", anchor="mm", font=font)
    draw.text((200, 450), "📱 Scan to Order", fill="black", anchor="mm", font=font)
    
    # Paste QR code
    background.paste(qr_image, (100, 150))
    
    return background

# Generate for all tables
for i in range(1, 11):
    img = create_custom_qr(i)
    img.save(f'custom-qr-table-{i}.png')
```

## 🚀 **Quick Start**

### **Immediate Action Items**
1. **Generate QR codes** for tables 1-10
2. **Print and laminate** the QR codes
3. **Place on tables** with clear instructions
4. **Test each QR code** with your phone
5. **Train staff** on the new system

### **Success Metrics**
- ✅ Customers can scan QR codes easily
- ✅ Table numbers are captured correctly
- ✅ Orders are placed successfully
- ✅ Staff understands the system
- ✅ Backup menus are available

## 🎉 **Benefits of QR Code System**

- **Contactless ordering** - No physical menus needed
- **Real-time updates** - Menu changes instantly available
- **Table tracking** - Know which table placed which order
- **Reduced costs** - No printing physical menus
- **Better hygiene** - No shared physical menus
- **Analytics** - Track popular items and peak times

Your restaurant is now ready for the digital age! 🍽️📱 