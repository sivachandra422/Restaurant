import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';

// GET - Fetch all menu items
export async function GET() {
  try {
    await dbConnect();
    
    // If no MongoDB URI is provided, return static data
    if (!process.env.MONGODB_URI) {
      const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
        ...item,
        image: `/api/food-image?item=${item.id}`
      }));
      return NextResponse.json(staticItems);
    }
    
    // Check if we have items in database
    const count = await MenuItem.countDocuments();
    
    if (count === 0) {
      // Initialize database with static data
      const menuItems = Object.values(sriKanyaMenu).flat().map(item => ({
        ...item,
        image: `/api/food-image?item=${item.id}`
      }));
      
      await MenuItem.insertMany(menuItems);
    }
    
    const menuItems = await MenuItem.find({ isDisabled: { $ne: true } }).sort({ category: 1, name: 1 });
    
    return NextResponse.json(menuItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    // Fallback to static data
    const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
      ...item,
      image: `/api/food-image?item=${item.id}`
    }));
    return NextResponse.json(staticItems);
  }
}

// POST - Create new menu item
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // If no MongoDB URI is provided, return error
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }
    
    const body = await request.json();
    const menuItem = new MenuItem(body);
    await menuItem.save();
    
    return NextResponse.json(menuItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
} 