import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';
import { getLocalFallbackImage } from '@/lib/imageMappings';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// POST - Reset database with local images
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // If no MongoDB URI is provided, return error
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    // Clear existing data
    await MenuItem.deleteMany({});
    console.log('Cleared existing menu items');
    
    // Initialize database with static data and local images
    const menuItems = Object.values(sriKanyaMenu).flat().map(item => ({
      ...item,
      image: getLocalFallbackImage(item.id) // Use local images for database
    }));

    await MenuItem.insertMany(menuItems);
    console.log('Database reset with local images');
    
    return NextResponse.json({ 
      message: 'Database reset successfully',
      itemsCount: menuItems.length 
    });
  } catch (error) {
    console.error('Error resetting database:', error);
    return NextResponse.json({ error: 'Failed to reset database' }, { status: 500 });
  }
} 