import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Order } from '@/lib/models/Order';
import { MenuItem } from '@/lib/models/MenuItem';
import { readFile } from 'fs/promises';
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change-this-jwt-secret');
    
    return { isAuthenticated: true, user: decoded };
  } catch (error) {
    return { isAuthenticated: false };
  }
}

// POST - Restore from backup
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { backupId, collections = ['orders', 'menu'] } = await request.json();

    if (!backupId) {
      return NextResponse.json({ error: 'Backup ID required' }, { status: 400 });
    }

    await dbConnect();
    const backupDir = join(process.cwd(), 'backups');
    
    // Verify backup exists
    const manifestPath = join(backupDir, `${backupId}-manifest.json`);
    if (!existsSync(manifestPath)) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    // Read manifest
    const manifestContent = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    const restoreResults: {
      backupId: string;
      timestamp: string;
      collections: Array<{ name: string; restored: number; original: number }>;
      errors: string[];
    } = {
      backupId,
      timestamp: new Date().toISOString(),
      collections: [],
      errors: []
    };

    // Restore orders if requested
    if (collections.includes('orders')) {
      try {
        const ordersBackupPath = join(backupDir, `${backupId}-orders.json`);
        if (existsSync(ordersBackupPath)) {
          const ordersContent = await readFile(ordersBackupPath, 'utf8');
          const ordersBackup = JSON.parse(ordersContent);

          // Clear existing orders and restore
          await Order.deleteMany({});
          
          if (ordersBackup.data && ordersBackup.data.length > 0) {
            await Order.insertMany(ordersBackup.data);
          }

          restoreResults.collections.push({
            name: 'orders',
            restored: ordersBackup.data.length,
            original: ordersBackup.count
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        restoreResults.errors.push(`Orders restore failed: ${errorMessage}`);
      }
    }

    // Restore menu items if requested
    if (collections.includes('menu')) {
      try {
        const menuBackupPath = join(backupDir, `${backupId}-menu.json`);
        if (existsSync(menuBackupPath)) {
          const menuContent = await readFile(menuBackupPath, 'utf8');
          const menuBackup = JSON.parse(menuContent);

          // Clear existing menu items and restore
          await MenuItem.deleteMany({});
          
          if (menuBackup.data && menuBackup.data.length > 0) {
            await MenuItem.insertMany(menuBackup.data);
          }

          restoreResults.collections.push({
            name: 'menu',
            restored: menuBackup.data.length,
            original: menuBackup.count
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        restoreResults.errors.push(`Menu restore failed: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Restore completed',
      results: restoreResults
    });

  } catch (error) {
    console.error('Restore error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to restore backup', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET - Get restore preview (what would be restored)
export async function GET(request: NextRequest) {
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
    const manifestPath = join(backupDir, `${backupId}-manifest.json`);
    
    if (!existsSync(manifestPath)) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 });
    }

    // Read manifest
    const manifestContent = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    // Get current database counts
    await dbConnect();
    const currentOrdersCount = await Order.countDocuments();
    const currentMenuCount = await MenuItem.countDocuments();

    return NextResponse.json({
      backupId,
      backupInfo: manifest,
      currentState: {
        orders: currentOrdersCount,
        menu: currentMenuCount
      },
      restorePreview: {
        orders: {
          current: currentOrdersCount,
          backup: manifest.ordersCount,
          willBeReplaced: true
        },
        menu: {
          current: currentMenuCount,
          backup: manifest.menuCount,
          willBeReplaced: true
        }
      }
    });

  } catch (error) {
    console.error('Restore preview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to get restore preview', details: errorMessage },
      { status: 500 }
    );
  }
} 