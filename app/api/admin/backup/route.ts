import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// POST - Create database backup
export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get all collections
    const collections = await db.listCollections().toArray();
    const backupData: any = {
      timestamp: new Date().toISOString(),
      collections: {}
    };

    // Backup each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      const documents = await db.collection(collectionName).find({}).toArray();
      backupData.collections[collectionName] = documents;
    }

    // Save backup to database
    await db.collection('backups').insertOne({
      timestamp: new Date(),
      data: backupData,
      size: JSON.stringify(backupData).length
    });

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      timestamp: backupData.timestamp,
      collections: Object.keys(backupData.collections),
      size: backupData.size
    });

  } catch (error) {
    console.error('Backup creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

// GET - List available backups
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const backups = await db.collection('backups')
      .find({})
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      success: true,
      backups: backups.map(backup => ({
        id: backup._id,
        timestamp: backup.timestamp,
        size: backup.size,
        collections: Object.keys(backup.data.collections)
      }))
    });

  } catch (error) {
    console.error('Backup listing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list backups' },
      { status: 500 }
    );
  }
} 