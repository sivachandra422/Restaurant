import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';
import { getFoodImage } from '@/lib/imageMappings';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

// GET - Fetch only visible menu items (for customer menu)
export async function GET() {
  try {
    await dbConnect();

    // If no MongoDB URI is provided, return static data
    if (!process.env.MONGODB_URI) {
      const staticItems = Object.values(sriKanyaMenu).flat()
        .filter(item => !item.isDisabled)
        .map(item => ({
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
        // Initialize database with static data and correct images
        const menuItems = Object.values(sriKanyaMenu).flat().map(item => ({
          ...item,
          image: getFoodImage(item.id)
        }));

        await MenuItem.insertMany(menuItems);
        console.log('Database initialized with correct images (visible)');
      }

      // Return only visible items (not disabled)
      const menuItems = await MenuItem.find({ isDisabled: { $ne: true } }).sort({ category: 1, name: 1 });

      // Always return correct images regardless of database content
      const itemsWithImages = menuItems.map(item => ({
        ...item.toObject(),
        image: getFoodImage(item.id) // Always use the correct image
      }));

      return NextResponse.json(itemsWithImages);
    } catch (dbError) {
      console.error('Database error, using static data:', dbError);
      // Fallback to static data if database fails
      const staticItems = Object.values(sriKanyaMenu).flat()
        .filter(item => !item.isDisabled)
        .map(item => ({
          ...item,
          image: getFoodImage(item.id)
        }));
      return NextResponse.json(staticItems);
    }
  } catch (error) {
    console.error('Error fetching visible menu items:', error);
    // Fallback to static data
    const staticItems = Object.values(sriKanyaMenu).flat()
      .filter(item => !item.isDisabled)
      .map(item => ({
        ...item,
        image: getFoodImage(item.id)
      }));
    return NextResponse.json(staticItems);
  }
} 