import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
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
    const { db } = await connectToDatabase();
    
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
      name: 'Sri Kanya Restaurant',
      description: 'Authentic Indian cuisine with a modern twist',
      contact: {
        phone: '+91 98765 43210',
        email: 'info@srikanya.com',
        address: '123 Main Street, City, State - 123456'
      },
      social: {
        facebook: 'https://facebook.com/srikanya',
        instagram: 'https://instagram.com/srikanya',
        twitter: 'https://twitter.com/srikanya'
      }
    },
    operatingHours: {
      monday: { open: '10:00', close: '22:00', closed: false },
      tuesday: { open: '10:00', close: '22:00', closed: false },
      wednesday: { open: '10:00', close: '22:00', closed: false },
      thursday: { open: '10:00', close: '22:00', closed: false },
      friday: { open: '10:00', close: '23:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '11:00', close: '21:00', closed: false }
    },
    payment: {
      acceptedMethods: ['cash', 'card', 'upi', 'digital_wallet'],
      taxRate: 5.0,
      serviceCharge: 2.5,
      minimumOrder: 100,
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