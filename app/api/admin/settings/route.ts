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
      name: 'Sri Kanya Family restaurant',
      description: 'Authentic Indian Cuisine & Traditional Flavors',
      contact: {
        phone: '+91-9876543210',
        email: 'srikanya.dharmavaram@gmail.com',
        address: 'Dharmavaram, Andhra Pradesh - 533430'
      },
      social: {
        facebook: 'https://facebook.com/srikanya',
        instagram: 'https://instagram.com/srikanya',
        twitter: 'https://twitter.com/srikanya'
      }
    },
    operatingHours: {
      monday: { open: '08:00', close: '23:00', closed: false },
      tuesday: { open: '08:00', close: '23:00', closed: false },
      wednesday: { open: '08:00', close: '23:00', closed: false },
      thursday: { open: '08:00', close: '23:00', closed: false },
      friday: { open: '08:00', close: '23:00', closed: false },
      saturday: { open: '08:00', close: '23:00', closed: false },
      sunday: { open: '08:00', close: '23:00', closed: false }
    },
    payment: {
      acceptedMethods: ['cash', 'phonepe'],
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
      deliveryRadius: 5, // km
      estimatedTime: 30 // minutes
    },
    notifications: {
      email: {
        enabled: true,
        address: 'admin@srikanya.com'
      },
      sms: {
        enabled: false,
        number: '+91 98765 43210'
      },
      push: {
        enabled: true
      }
    },
    system: {
      autoRefresh: true,
      refreshInterval: 30, // seconds
      sessionTimeout: 3600, // seconds
      maxOrdersPerTable: 10,
      orderTimeout: 300, // seconds
      maintenanceMode: false
    },
    menu: {
      categories: [
        'starters',
        'mainCourse',
        'biryani',
        'breads',
        'desserts',
        'beverages'
      ],
      featuredItems: [],
      seasonalItems: [],
      dietaryOptions: ['vegetarian', 'non-vegetarian', 'vegan', 'gluten-free']
    },
    analytics: {
      enabled: true,
      trackCustomerBehavior: true,
      trackOrderPatterns: true,
      generateReports: true,
      dataRetention: 365 // days
    },
    security: {
      requireLogin: true,
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      }
    },
    appearance: {
      theme: 'light',
      primaryColor: '#f97316',
      secondaryColor: '#dc2626',
      logo: '/logo.png',
      favicon: '/favicon.ico'
    },
    integrations: {
      paymentGateway: {
        provider: 'razorpay',
        enabled: true,
        testMode: true
      },
      analytics: {
        googleAnalytics: {
          enabled: false,
          trackingId: ''
        },
        facebookPixel: {
          enabled: false,
          pixelId: ''
        }
      },
      socialMedia: {
        facebook: {
          enabled: false,
          pageId: ''
        },
        instagram: {
          enabled: false,
          accountId: ''
        }
      }
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30, // days
      cloudStorage: {
        enabled: false,
        provider: 'aws',
        bucket: ''
      }
    },
    maintenance: {
      scheduledMaintenance: {
        enabled: false,
        day: 'sunday',
        time: '02:00',
        duration: 60 // minutes
      },
      emergencyContact: {
        name: 'System Administrator',
        phone: '+91 98765 43210',
        email: 'admin@srikanya.com'
      }
    }
  };
} 