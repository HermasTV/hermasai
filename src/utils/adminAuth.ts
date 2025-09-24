import { cookies } from 'next/headers';

export function verifyAdminAuth(): boolean {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin-session');

    if (!sessionToken) {
      return false;
    }

    // Decode session token and check if it's still valid
    const decoded = Buffer.from(sessionToken.value, 'base64').toString();
    const [username, timestamp] = decoded.split(':');

    if (!username || !timestamp) {
      return false;
    }

    // Check if session is not expired (24 hours)
    const sessionTime = parseInt(timestamp);
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (now - sessionTime > twentyFourHours) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Auth verification error:', error);
    return false;
  }
}

export function getAdminSession(): { username: string } | null {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get('admin-session');

    if (!sessionToken) {
      return null;
    }

    const decoded = Buffer.from(sessionToken.value, 'base64').toString();
    const [username] = decoded.split(':');

    return username ? { username } : null;
  } catch (error) {
    return null;
  }
}