import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { MenuItem } from '@/lib/models/MenuItem';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Verify admin authentication
async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                 request.cookies.get('admin-token')?.value;
    
    if (!token) {
      return { isAuthenticated: false };
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'srikanya-jwt-secret-2024');
    
    return { isAuthenticated: true, user: decoded };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

// POST - Create manual backup
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Create backup directory if it doesn't exist
    const backupDir = join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) {
      await mkdir(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    
    // Backup orders
    const orders = await Order.find({}).lean();
    const ordersBackup = {
      collection: 'orders',
      count: orders.length,
      data: orders,
      backupId,
      timestamp: new Date().toISOString()
    };

    // Backup menu items
    const menuItems = await MenuItem.find({}).lean();
    const menuBackup = {
      collection: 'menu',
      count: menuItems.length,
      data: menuItems,
      backupId,
      timestamp: new Date().toISOString()
    };

    // Save backup files
    const ordersBackupPath = join(backupDir, `${backupId}-orders.json`);
    const menuBackupPath = join(backupDir, `${backupId}-menu.json`);
    
    await writeFile(ordersBackupPath, JSON.stringify(ordersBackup, null, 2));
    await writeFile(menuBackupPath, JSON.stringify(menuBackup, null, 2));

    // Create backup manifest
    const manifest = {
      backupId,
      timestamp: new Date().toISOString(),
      collections: ['orders', 'menu'],
      ordersCount: orders.length,
      menuCount: menuItems.length,
      files: [
        `${backupId}-orders.json`,
        `${backupId}-menu.json`
      ]
    };

    const manifestPath = join(backupDir, `${backupId}-manifest.json`);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    return NextResponse.json({
      success: true,
      backupId,
      message: 'Backup created successfully',
      details: {
        ordersCount: orders.length,
        menuCount: menuItems.length,
        backupPath: backupDir
      }
    });

  } catch (error) {
    console.error('Backup creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create backup', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - List available backups
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backupDir = join(process.cwd(), 'backups');
    if (!existsSync(backupDir)) {
      return NextResponse.json({ backups: [] });
    }

    const { readdir, readFile } = require('fs/promises');
    const files = await readdir(backupDir);
    
    const manifests = files.filter((file: string) => file.endsWith('-manifest.json'));
    const backups = [];

    for (const manifestFile of manifests) {
      try {
        const manifestPath = join(backupDir, manifestFile);
        const manifestContent = await readFile(manifestPath, 'utf8');
        const manifest = JSON.parse(manifestContent);
        backups.push(manifest);
      } catch (error) {
        console.error(`Error reading manifest ${manifestFile}:`, error);
      }
    }

    // Sort by timestamp (newest first)
    backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ backups });

  } catch (error) {
    console.error('Backup listing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to list backups', details: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific backup
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('backupId');

    if (!backupId) {
      return NextResponse.json({ error: 'Backup ID required' }, { status: 400 });
    }

    const backupDir = join(process.cwd(), 'backups');
    const { unlink } = require('fs/promises');

    // Delete backup files
    const filesToDelete = [
      join(backupDir, `${backupId}-manifest.json`),
      join(backupDir, `${backupId}-orders.json`),
      join(backupDir, `${backupId}-menu.json`)
    ];

    for (const filePath of filesToDelete) {
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    });

  } catch (error) {
    console.error('Backup deletion error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete backup', details: errorMessage },
      { status: 500 }
    );
  }
} 