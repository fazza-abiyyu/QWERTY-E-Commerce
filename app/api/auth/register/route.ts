import { NextResponse } from 'next/server';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { ResponseHandler } from '../../../../src/utils/handler/respon.utils';
import { validatePassword, validateEmail } from '../../../../src/utils/validation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.email || !body.password || !body.full_name) {
      return ResponseHandler.badRequest('Email, password, and full_name are required');
    }

    if (!validateEmail(body.email)) {
      return ResponseHandler.badRequest('Invalid email address');
    }

    const { isValid, message } = validatePassword(body.password);
    if (!isValid) {
      return ResponseHandler.badRequest(message);
    }

    const user = await AuthService.register(body);
    
    return ResponseHandler.success(user, 'Registration successful', 201);
  } catch (error: any) {
    if (error.message === 'Email already registered') {
      return ResponseHandler.badRequest(error.message);
    }
    return ResponseHandler.error('Registration failed', error);
  }
}
