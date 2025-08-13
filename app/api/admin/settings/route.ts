import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    // Get settings from database or return defaults
    const settings = await db.collection('settings').findOne({}) || getDefaultSettings();
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    // Remove _id if present to avoid immutable field error
    if (body._id) {
      delete body._id;
    }
    const { db } = await connectToDatabase();
    
    // Check if database is available
    if (!db) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    
    // Update settings
    await db.collection('settings').updateOne(
      {},
      { $set: body },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true, settings: body });
  } catch (error) {
    console.error('Update Settings Error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

function getDefaultSettings() {
  return {
    restaurant: {
      name: 'Sri Kanya Family Restaurant',
      description: 'Authentic Indian Cuisine & Traditional Flavors',
      address: 'Dharmavaram, Andhra Pradesh - 533430',
      phone: '+91-9876543210',
      email: 'srikanya.dharmavaram@gmail.com',
      website: 'https://srikanya.com',
      cuisine: 'Indian',
      openingHours: {
        monday: { open: '08:00', close: '23:00', closed: false },
        tuesday: { open: '08:00', close: '23:00', closed: false },
        wednesday: { open: '08:00', close: '23:00', closed: false },
        thursday: { open: '08:00', close: '23:00', closed: false },
        friday: { open: '08:00', close: '23:00', closed: false },
        saturday: { open: '08:00', close: '23:00', closed: false },
        sunday: { open: '08:00', close: '23:00', closed: false }
      },
      deliveryRadius: 10,
      minOrderAmount: 200,
      freeDeliveryThreshold: 500
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      orderAlerts: true,
      feedbackAlerts: true,
      systemAlerts: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: []
    },
    appearance: {
      theme: 'light',
      primaryColor: '#f97316',
      accentColor: '#dc2626',
      logo: '/logo.png',
      favicon: '/favicon.ico'
    },
    payment: {
      acceptedMethods: ['cash', 'card', 'phonepe', 'gpay', 'upi'],
      taxRate: 0.0,
      serviceCharge: 0.0,
      minimumOrder: 50,
      currency: 'INR',
      currencySymbol: '₹'
    },
    delivery: {
      enabled: true,
      minimumOrder: 200,
      deliveryCharge: 50,
      freeDeliveryThreshold: 500,
      maxDistance: 10
    }
  };
} 