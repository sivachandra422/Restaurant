import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Admin users (in production, this should be in a database)
const ADMIN_USERS = [
  {
    id: '1',
    username: 'admin',
    role: 'admin' as const,
    permissions: ['read', 'write', 'delete', 'manage_users'],
    lastLogin: new Date()
  },
  {
    id: '2',
    username: 'manager',
    role: 'manager' as const,
    permissions: ['read', 'write'],
    lastLogin: new Date()
  }
];

// Simple in-memory rate limiting for login attempts
// NOTE: This resets on server restart; use a proper store in production
const loginAttempts = new Map<string, { count: number; firstAttemptAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) return false;
  if (now - record.firstAttemptAt > WINDOW_MS) {
    loginAttempts.delete(key);
    return false;
  }
  return record.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const record = loginAttempts.get(key);
  if (!record) {
    loginAttempts.set(key, { count: 1, firstAttemptAt: now });
  } else {
    if (now - record.firstAttemptAt > WINDOW_MS) {
      loginAttempts.set(key, { count: 1, firstAttemptAt: now });
    } else {
      record.count += 1;
      loginAttempts.set(key, record);
    }
  }
}

function resetAttempts(key: string) {
  loginAttempts.delete(key);
}

function getClientKey(request: NextRequest, username: string): string {
  const xff = request.headers.get('x-forwarded-for') || '';
  const ip = xff.split(',')[0]?.trim() || 'unknown';
  return `${ip}:${username}`;
}

async function verifyPassword(role: 'admin' | 'manager', inputPassword: string): Promise<boolean> {
  // Prefer hashed password env per role
  const roleUpper = role.toUpperCase();
  const hashEnv = process.env[`ADMIN_${roleUpper}_PASSWORD_HASH` as const];
  if (hashEnv && hashEnv.trim().length > 0) {
    try {
      return await bcrypt.compare(inputPassword, hashEnv);
    } catch {
      return false;
    }
  }

  // Fallback to plaintext per-role env
  const plainRoleEnv = process.env[`ADMIN_${roleUpper}_PASSWORD` as const];
  if (plainRoleEnv && plainRoleEnv.length > 0) {
    return inputPassword === plainRoleEnv;
  }

  // Fallback to legacy ADMIN_PASSWORD for both roles (development only)
  const legacy = process.env.ADMIN_PASSWORD || 'change-me-in-production';
  return inputPassword === legacy;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Do not log plaintext passwords
    console.log('Login attempt:', { username });

    const rlKey = getClientKey(request, username || '');
    if (isRateLimited(rlKey)) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

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
      recordFailedAttempt(rlKey);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password (supports bcrypt hash or plaintext envs)
    const isValidPassword = await verifyPassword(user.role, password);
    if (!isValidPassword) {
      recordFailedAttempt(rlKey);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    resetAttempts(rlKey);

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

    const response = NextResponse.json({
      success: true,
      user: userData,
      token
    });

    // Optionally also set a secure, same-site cookie for the token
    // Note: This is a non-HttpOnly cookie because the client currently reads it.
    // For stronger security, migrate to HttpOnly cookies and a /api/admin/me session endpoint.
    response.cookies.set('admin-token', token, {
      httpOnly: false, // kept false to avoid breaking current client-side session restore
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 