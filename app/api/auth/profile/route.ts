import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { ResponseHandler } from '../../../../src/utils/handler/respon.utils';
import { JsonHandler } from '../../../../src/infrastructure/database/json-handler';
import { User } from '../../../../src/modules/auth/auth.schema';

const userDb = new JsonHandler<User>('users.json');

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return ResponseHandler.error('Not authenticated', null, 401);
    }

    const payload = await AuthService.verifyToken(token);
    if (!payload || !payload.id) {
      return ResponseHandler.error('Invalid token', null, 401);
    }

    const body = await request.json();
    const { full_name, address } = body;

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return ResponseHandler.badRequest('Name must be at least 2 characters');
    }

    const updateData: Record<string, any> = { full_name: full_name.trim() };
    if (address && typeof address === 'object') {
      updateData.address = {
        province: (address.province || '').trim(),
        city: (address.city || '').trim(),
        district: (address.district || '').trim(),
        detail: (address.detail || '').trim(),
      };
    }

    const updatedUser = await userDb.update(payload.id as string, updateData);

    if (!updatedUser) {
      return ResponseHandler.notFound('User not found');
    }

    // Re-generate tokens with updated name
    const { password, refresh_tokens, ...userWithoutPassword } = updatedUser;
    const { access_token, refresh_token } = await AuthService.generateTokens(userWithoutPassword);

    cookieStore.set('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60,
    });

    cookieStore.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return ResponseHandler.success({
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
    }, 'Profile updated successfully');
  } catch (error) {
    return ResponseHandler.error('Failed to update profile', error);
  }
}
