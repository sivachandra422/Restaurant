import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';

// GET - Fetch only visible menu items (for customer menu)
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

    // Try to connect to MongoDB, but fallback if it fails
    try {
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

      // Return only visible items (for customer menu)
      const menuItems = await MenuItem.find({ isDisabled: { $ne: true } }).sort({ category: 1, name: 1 });

      return NextResponse.json(menuItems);
    } catch (dbError) {
      console.error('Database error, using static data:', dbError);
      // Fallback to static data if database fails
      const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
        ...item,
        image: `/api/food-image?item=${item.id}`
      }));
      return NextResponse.json(staticItems);
    }
  } catch (error) {
    console.error('Error fetching visible menu items:', error);
    // Fallback to static data
    const staticItems = Object.values(sriKanyaMenu).flat().map(item => ({
      ...item,
      image: `/api/food-image?item=${item.id}`
    }));
    return NextResponse.json(staticItems);
  }
} 