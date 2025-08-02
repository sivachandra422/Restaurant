import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';
import { getFoodImage } from '@/lib/imageMappings';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// GET - Fetch all menu items (including disabled ones for admin)
export async function GET() {
  try {
    await dbConnect();

    // If no MongoDB URI is provided, return static data
    if (!process.env.MONGODB_URI) {
      const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
        ...item,
        image: getFoodImage(item.id)
      }));
      return NextResponse.json(staticItems);
    }

    // Try to connect to MongoDB, but fallback if it fails
    try {
      // Check if we have items in database
      const count = await MenuItem.countDocuments();

      if (count === 0) {
        // Initialize database with static data
        const menuItems = Object.values(sriKanyaMenu).flat().map(item => ({
          ...item,
          image: getFoodImage(item.id)
        }));

        await MenuItem.insertMany(menuItems);
      }

      // Return ALL items including disabled ones (for admin dashboard)
      const menuItems = await MenuItem.find({}).sort({ category: 1, name: 1 });

      // Ensure all items have proper image URLs (without changing database)
      const itemsWithImages = menuItems.map(item => ({
        ...item.toObject(),
        image: item.image || getFoodImage(item.id)
      }));

      return NextResponse.json(itemsWithImages);
    } catch (dbError) {
      console.error('Database error, using static data:', dbError);
      // Fallback to static data if database fails
      const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
        ...item,
        image: getFoodImage(item.id)
      }));
      return NextResponse.json(staticItems);
    }
  } catch (error) {
    console.error('Error fetching menu items:', error);
    // Fallback to static data
    const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
      ...item,
      image: getFoodImage(item.id)
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