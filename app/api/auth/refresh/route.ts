import { NextResponse } from 'next/server';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { ResponseHandler } from '../../../../src/utils/handler/respon.utils';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'qwerty-super-secret-key-123456');

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get('refresh_token')?.value;

    if (!refresh_token) {
      return ResponseHandler.error('No refresh token provided', null, 401);
    }

    // Verify token validity
    const payload = await AuthService.verifyToken(refresh_token);
    if (!payload || !payload.id) {
      return ResponseHandler.error('Invalid refresh token', null, 403);
    }

    // In a real app, you'd also check if the token exists in the user's DB record
    // But for MVP, verifying signature and expiration is sufficient.

    const userMock = {
      id: payload.id as string,
      email: payload.email as string || '',
      role: payload.role as 'admin' | 'customer' || 'customer'
    };

    // Re-issue tokens
    // Note: We'd ideally fetch full user from DB, but we only strictly need ID and Role
    const { access_token, refresh_token: new_refresh_token } = await AuthService.generateTokens(userMock as any);

    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    cookieStore.set('refresh_token', new_refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Revoke old refresh token (cleanup)
    await AuthService.revokeRefreshToken(userMock.id, refresh_token);

    return ResponseHandler.success(null, 'Token refreshed successfully');
  } catch (error) {
    return ResponseHandler.error('An error occurred during token refresh', error);
  }
}
