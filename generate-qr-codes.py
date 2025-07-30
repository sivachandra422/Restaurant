#!/usr/bin/env python3
"""
QR Code Generator for Sri Kanya Restaurant Tables
Generates QR codes for tables 1-10 that link to the menu with table numbers
"""

import qrcode
import os
from PIL import Image, ImageDraw, ImageFont

def create_qr_code(table_num, url, output_dir="qr-codes"):
    """Generate a QR code for a specific table"""
    
    # Create QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR image
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Save basic QR code
    basic_filename = f'{output_dir}/table-{table_num}-basic.png'
    qr_image.save(basic_filename)
    print(f"✅ Generated basic QR code for Table {table_num}")
    
    return qr_image

def create_custom_qr_code(table_num, url, output_dir="qr-codes"):
    """Generate a custom QR code with restaurant branding"""
    
    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=8,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Create QR image
    qr_image = qr.make_image(fill_color="black", back_color="white")
    
    # Create custom background
    background = Image.new('RGB', (400, 500), 'white')
    draw = ImageDraw.Draw(background)
    
    # Add border
    draw.rectangle([(0, 0), (399, 499)], outline="black", width=2)
    
    # Add restaurant name
    try:
        # Try to use a nice font
        font_large = ImageFont.truetype("arial.ttf", 28)
        font_medium = ImageFont.truetype("arial.ttf", 20)
        font_small = ImageFont.truetype("arial.ttf", 16)
    except:
        # Fallback to default font
        font_large = ImageFont.load_default()
        font_medium = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Restaurant branding
    draw.text((200, 50), "SRI KANYA", fill="black", anchor="mm", font=font_large)
    draw.text((200, 85), "FAMILY RESTAURANTS", fill="black", anchor="mm", font=font_medium)
    
    # Table number
    draw.text((200, 120), f"Table {table_num}", fill="black", anchor="mm", font=font_large)
    
    # Instructions
    draw.text((200, 450), "📱 Scan to Order", fill="black", anchor="mm", font=font_medium)
    draw.text((200, 475), "🍽️ Digital Menu", fill="black", anchor="mm", font=font_small)
    
    # Paste QR code in the center
    qr_size = 200
    qr_x = (400 - qr_size) // 2
    qr_y = 150
    # Resize QR code to fit
    qr_image_resized = qr_image.resize((qr_size, qr_size))
    background.paste(qr_image_resized, (qr_x, qr_y))
    
    # Save custom QR code
    custom_filename = f'{output_dir}/table-{table_num}-custom.png'
    background.save(custom_filename)
    print(f"✅ Generated custom QR code for Table {table_num}")
    
    return background

def main():
    """Main function to generate QR codes for all tables"""
    
    # Create output directory
    output_dir = "qr-codes"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📁 Created directory: {output_dir}")
    
    # Base URL for your restaurant
    base_url = "https://sri-kanya-restaurant-menu.onrender.com/menu"
    
    print("🚀 Generating QR codes for Sri Kanya Restaurant...")
    print("=" * 50)
    
    # Generate QR codes for tables 1-10
    for table_num in range(1, 11):
        url = f"{base_url}?table={table_num}"
        
        # Generate basic QR code
        create_qr_code(table_num, url, output_dir)
        
        # Generate custom QR code with branding
        create_custom_qr_code(table_num, url, output_dir)
        
        print(f"📋 Table {table_num}: {url}")
        print("-" * 30)
    
    print("=" * 50)
    print("🎉 All QR codes generated successfully!")
    print(f"📁 Files saved in: {output_dir}/")
    print("\n📋 Generated files:")
    
    # List all generated files
    for filename in sorted(os.listdir(output_dir)):
        print(f"   - {filename}")
    
    print("\n🖨️  Next steps:")
    print("1. Print the QR codes (recommend 3x3 inches)")
    print("2. Laminate for durability")
    print("3. Place on each table")
    print("4. Test with your phone")
    print("5. Train staff on the system")
    
    print("\n📱 Test URLs:")
    print("Table 1: https://sri-kanya-restaurant-menu.onrender.com/menu?table=1")
    print("Table 5: https://sri-kanya-restaurant-menu.onrender.com/menu?table=5")

if __name__ == "__main__":
    main() 