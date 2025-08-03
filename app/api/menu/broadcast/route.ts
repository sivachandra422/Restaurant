import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// JWT secret (should match the one used in login)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Helper function to verify admin authentication
async function verifyAdminAuth(request: NextRequest) {
  try {
    const token = request.cookies.get('admin-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return { isAuthenticated: false, error: 'No token provided' };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { isAuthenticated: true, user: payload };
  } catch (error) {
    return { isAuthenticated: false, error: 'Invalid token' };
  }
}

// POST - Broadcast menu update to all connected clients
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdminAuth(request);
    if (!authResult.isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Store the update in a global variable or database for SSE clients
    global.menuUpdates = global.menuUpdates || [];
    global.menuUpdates.push({
      ...body,
      timestamp: Date.now()
    });

    // Keep only the last 100 updates
    if (global.menuUpdates.length > 100) {
      global.menuUpdates = global.menuUpdates.slice(-100);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Update broadcasted successfully' 
    });
  } catch (error) {
    console.error('Error broadcasting update:', error);
    return NextResponse.json({ error: 'Failed to broadcast update' }, { status: 500 });
  }
} 