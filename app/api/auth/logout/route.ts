import { NextResponse } from 'next/server';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { ResponseHandler } from '../../../../src/utils/handler/respon.utils';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refresh_token = cookieStore.get('refresh_token')?.value;

    if (refresh_token) {
      const payload = await AuthService.verifyToken(refresh_token);
      if (payload && payload.id) {
        await AuthService.revokeRefreshToken(payload.id as string, refresh_token);
      }
    }

    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return ResponseHandler.success(null, 'Logged out successfully');
  } catch (error) {
    return ResponseHandler.error('An error occurred during logout', error);
  }
}
