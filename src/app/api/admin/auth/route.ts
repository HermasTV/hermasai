import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple admin credentials (in production, use environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'hermasai2024';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create a simple session token (in production, use proper JWT)
      const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');

      // Set session cookie
      const cookieStore = cookies();
      cookieStore.set('admin-session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return NextResponse.json({
        success: true,
        message: 'Authentication successful'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({
      error: 'Authentication failed'
    }, { status: 500 });
  }
}

// Logout endpoint
export async function DELETE() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('admin-session');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Logout failed'
    }, { status: 500 });
  }
}