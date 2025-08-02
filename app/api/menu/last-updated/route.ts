import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';

// GET - Get the last updated timestamp
export async function GET() {
  try {
    await dbConnect();

    // If no MongoDB URI is provided, return static timestamp
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({ lastUpdated: Date.now() });
    }

    try {
      // Get the most recent updatedAt timestamp from the database
      const latestItem = await MenuItem.findOne().sort({ updatedAt: -1 });
      
      if (latestItem) {
        return NextResponse.json({ 
          lastUpdated: latestItem.updatedAt.getTime() 
        });
      } else {
        // If no items exist, return current timestamp
        return NextResponse.json({ lastUpdated: Date.now() });
      }
    } catch (dbError) {
      console.error('Database error, using static timestamp:', dbError);
      return NextResponse.json({ lastUpdated: Date.now() });
    }
  } catch (error) {
    console.error('Error getting last updated timestamp:', error);
    return NextResponse.json({ lastUpdated: Date.now() });
  }
} 