import { NextResponse } from 'next/server';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { ResponseHandler } from '../../../../src/utils/handler/respon.utils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await AuthService.login(body);
    
    if (!user) {
      return ResponseHandler.error('Invalid email or password', null, 401);
    }

    const { access_token, refresh_token } = await AuthService.generateTokens(user);

    const cookieStore = await cookies();
    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 minutes
    });

    cookieStore.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return ResponseHandler.success(user, 'Login successful');
  } catch (error) {
    return ResponseHandler.error('An error occurred during login', error);
  }
}
