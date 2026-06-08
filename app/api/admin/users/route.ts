import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '@/lib/env';
import mongoose from 'mongoose';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  status: 'active' | 'inactive' | 'suspended';
  permissions: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  permissions: [{ type: String }],
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', userSchema);

// Authentication middleware
function verifyAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, env.JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }

    // Get real users from database
    const users = await AdminUser
      .find({}, { password: 0 }) // Exclude password from response
      .sort({ createdAt: -1 })
      .lean();

    // If no users exist, create default admin user
    if (users.length === 0) {
      const defaultAdmin = {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        status: 'active',
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newUser = new AdminUser(defaultAdmin);
      await newUser.save();

      return NextResponse.json({
        success: true,
        users: [{
          ...defaultAdmin,
          id: newUser._id.toString(),
          password: undefined
        }]
      });
    }

    return NextResponse.json({
      success: true,
      users: users.map((user: any) => ({
        ...user,
        id: user._id.toString()
      }))
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch users'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = verifyAuth(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized - Admin access required'
      }, { status: 401 });
    }

    const userData = await request.json();
    const { db } = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed'
      }, { status: 500 });
    }

    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      return NextResponse.json({
        success: false,
        error: 'Name, email, and password are required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await AdminUser.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User with this email already exists'
      }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new AdminUser({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role || 'staff',
      status: 'active',
      permissions: getPermissionsForRole(userData.role || 'staff'),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedUser = await newUser.save();

    return NextResponse.json({
      success: true,
      user: {
        id: savedUser._id.toString(),
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
        status: savedUser.status,
        permissions: savedUser.permissions,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create user'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json();
    const { db } = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const usersCollection = db.collection('admin_users');

    // If password is being updated, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Update permissions based on role if role is being updated
    if (updates.role) {
      updates.permissions = getPermissionsForRole(updates.role);
    }

    const result = await usersCollection.updateOne(
      { _id: userId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    if (result.acknowledged) {
      return NextResponse.json({
        success: true,
        message: 'User updated successfully'
      });
    } else {
      throw new Error('Failed to update user');
    }

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update user'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    const { db } = await connectToDatabase();

    if (!db) {
      return NextResponse.json({
        success: false,
        error: 'Database not available'
      }, { status: 500 });
    }

    const usersCollection = db.collection('admin_users');

    const result = await usersCollection.deleteOne({ _id: userId });

    if (result.acknowledged && result.deletedCount > 0) {
      return NextResponse.json({
        success: true,
        message: 'User deleted successfully'
      });
    } else {
      throw new Error('Failed to delete user');
    }

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete user'
    }, { status: 500 });
  }
}

function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case 'admin':
      return ['all'];
    case 'manager':
      return ['orders', 'menu', 'analytics', 'feedback', 'settings'];
    case 'staff':
      return ['orders', 'menu'];
    default:
      return [];
  }
}

function generateMockUsers(): User[] {
  const now = new Date();

  return [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      permissions: ['all'],
      lastLogin: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Manager User',
      email: 'manager@example.com',
      role: 'manager',
      status: 'active',
      permissions: ['orders', 'menu', 'analytics', 'feedback', 'settings'],
      lastLogin: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Kitchen Staff',
      email: 'kitchen@example.com',
      role: 'staff',
      status: 'active',
      permissions: ['orders', 'menu'],
      lastLogin: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
      createdAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      updatedAt: new Date(now.getTime() - 4 * 60 * 60 * 1000)
    },
    {
      id: '4',
      name: 'Service Staff',
      email: 'service@example.com',
      role: 'staff',
      status: 'active',
      permissions: ['orders'],
      lastLogin: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000)
    }
  ];
}