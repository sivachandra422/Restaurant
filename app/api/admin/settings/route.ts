import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

interface RestaurantSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  cuisine: string;
  openingHours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  deliveryRadius: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
}

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  orderAlerts: boolean;
  feedbackAlerts: boolean;
  systemAlerts: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  loginAttempts: number;
  ipWhitelist: string[];
}

interface AppearanceSettings {
  theme: string;
  primaryColor: string;
  accentColor: string;
  logo: string;
  favicon: string;
}

interface SettingsData {
  restaurant: RestaurantSettings;
  notifications: NotificationSettings;
  security: SecuritySettings;
  appearance: AppearanceSettings;
}

export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json({
        success: true,
        ...getDefaultSettings()
      });
    }

    // Get settings from database
    const settingsCollection = db.collection('restaurant_settings');
    const settings = await settingsCollection.findOne({ type: 'main' });
    
    if (!settings) {
      // Create default settings
      const defaultSettings = getDefaultSettings();
      await settingsCollection.insertOne({
        type: 'main',
        ...defaultSettings,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      return NextResponse.json({
        success: true,
        ...defaultSettings
      });
    }

    return NextResponse.json({
      success: true,
      restaurant: settings.restaurant,
      notifications: settings.notifications,
      security: settings.security,
      appearance: settings.appearance
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({
      success: true,
      ...getDefaultSettings()
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json();
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database not available' 
      }, { status: 500 });
    }

    const settingsCollection = db.collection('restaurant_settings');
    
    const result = await settingsCollection.updateOne(
      { type: 'main' },
      { 
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    if (result.acknowledged) {
      return NextResponse.json({ 
        success: true, 
        message: 'Settings updated successfully' 
      });
    } else {
      throw new Error('Failed to update settings');
    }

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to update settings' 
    }, { status: 500 });
  }
}

function getDefaultSettings(): SettingsData {
  return {
    restaurant: {
      name: 'Sri Kanya Family Restaurant',
      description: 'Authentic Indian cuisine with traditional recipes and fresh ingredients',
      address: 'Dharmavaram, Andhra Pradesh, India',
      phone: '+91 98765 43210',
      email: 'info@srikanya.com',
      website: 'https://srikanya.com',
      cuisine: 'Indian, South Indian, North Indian',
      openingHours: {
        monday: { open: '11:00', close: '22:00', closed: false },
        tuesday: { open: '11:00', close: '22:00', closed: false },
        wednesday: { open: '11:00', close: '22:00', closed: false },
        thursday: { open: '11:00', close: '22:00', closed: false },
        friday: { open: '11:00', close: '23:00', closed: false },
        saturday: { open: '11:00', close: '23:00', closed: false },
        sunday: { open: '11:00', close: '22:00', closed: false }
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
    }
  };
}