import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Admin users (in production, this should be in a database)
const ADMIN_USERS = [
  {
    id: '1',
    username: 'admin',
    password: process.env.ADMIN_PASSWORD || 'srikanya2024', // Use environment variable
    role: 'admin' as const,
    permissions: ['read', 'write', 'delete', 'manage_users'],
    lastLogin: new Date()
  },
  {
    id: '2',
    username: 'manager',
    password: process.env.ADMIN_PASSWORD || 'srikanya2024', // Use environment variable
    role: 'manager' as const,
    permissions: ['read', 'write'],
    lastLogin: new Date()
  }
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    console.log('Login attempt:', { username, password });

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = ADMIN_USERS.find(u => u.username === username);
    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password (simple comparison for development)
    const isValidPassword = user.password === password;
    if (!isValidPassword) {
      console.log('Invalid password for user:', username);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('Login successful for user:', username);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role,
        permissions: user.permissions 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Update last login
    user.lastLogin = new Date();

    // Return user data (without password)
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions,
      lastLogin: user.lastLogin
    };

    return NextResponse.json({
      success: true,
      user: userData,
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 