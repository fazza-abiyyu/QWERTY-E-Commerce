import { cookies } from 'next/headers';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { ResponseHandler } from '../../../../src/utils/handler/respon.utils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return ResponseHandler.error('Not authenticated', null, 401);
    }

    const payload = await AuthService.verifyToken(token);
    if (!payload) {
      return ResponseHandler.error('Invalid token', null, 401);
    }

    return ResponseHandler.success({
      id: payload.id,
      email: payload.email,
      role: payload.role,
      full_name: payload.full_name || '',
      address: payload.address || ''
    }, 'User retrieved successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to get user info', error);
  }
}
