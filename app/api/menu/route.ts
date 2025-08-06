import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { MenuItem } from '@/lib/models/MenuItem';
import { sriKanyaMenu } from '@/data/sriKanyaMenu';

// GET - Fetch all menu items
export async function GET(request: NextRequest) {
  try {
    // If no MongoDB URI is provided, return static data
    if (!process.env.MONGODB_URI) {
      console.log('No MongoDB URI provided, returning static menu data');
      return NextResponse.json(sriKanyaMenu);
    }
    
    try {
      const { db } = await connectToDatabase();
      
      if (!db) {
        console.log('Database connection not available, returning static menu data');
        return NextResponse.json(sriKanyaMenu);
      }
      
      // Check if we have any menu items in the database
      const count = await MenuItem.countDocuments();
      
      if (count === 0) {
        console.log('No menu items found in database, initializing with static data');
        
        // Initialize database with static menu data
        const menuItems = Object.entries(sriKanyaMenu).flatMap(([categoryKey, items]) => 
          items.map(item => ({
            ...item,
            category: categoryKey,
            categorySlug: categoryKey
          }))
        );
        
        await MenuItem.insertMany(menuItems);
        console.log('Database initialized with static menu data');
        
        return NextResponse.json(sriKanyaMenu);
      } else {
        console.log(`Found ${count} menu items in database`);
        
        // Fetch all menu items from database
        const menuItems = await MenuItem.find({}).sort({ category: 1, name: 1 });
        
        // Group by category
        const groupedMenu = Object.entries(sriKanyaMenu).map(([categoryKey, categoryItems]) => ({
          name: categoryKey,
          slug: categoryKey,
          items: menuItems.filter(item => item.category === categoryKey || item.categorySlug === categoryKey)
        }));
        
        return NextResponse.json(groupedMenu);
      }
    } catch (dbError) {
      console.error('Database error, using static data:', dbError);
      return NextResponse.json(sriKanyaMenu);
    }
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

// POST - Create new menu item
export async function POST(request: NextRequest) {
  try {
    const itemData = await request.json();
    
    // If MongoDB is available, save to database
    if (process.env.MONGODB_URI) {
      try {
        const { db } = await connectToDatabase();
        if (db) {
          const menuItem = new MenuItem(itemData);
          const savedItem = await menuItem.save();
          
          return NextResponse.json({ 
            success: true, 
            item: savedItem,
            message: 'Menu item created successfully' 
          });
        } else {
          console.log('Database connection not available');
        }
      } catch (dbError) {
        console.error('Failed to save menu item to MongoDB:', dbError);
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menu item created successfully (not saved to database)' 
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
} 