import { JsonHandler } from '../../../../src/infrastructure/database/json-handler';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { NextResponse } from 'next/server';
import { validatePassword } from '../../../../src/utils/validation';

interface OTPRecord {
  email: string;
  otp: string;
  expires_at: string;
}

const otpDb = new JsonHandler<OTPRecord>('otps.json');

export async function POST(request: Request) {
  try {
    const { email, otp, new_password } = await request.json();

    if (!email || !otp || !new_password) {
      return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
    }

    const { isValid, message } = validatePassword(new_password);
    if (!isValid) {
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const allOtps = await otpDb.readAll();
    const otpRecord = allOtps.find((o: OTPRecord) => o.email === email && o.otp === otp);

    if (!otpRecord) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' }, { status: 400 });
    }

    const isExpired = new Date() > new Date(otpRecord.expires_at);
    if (isExpired) {
      return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 400 });
    }

    // Update password
    const success = await AuthService.resetPassword(email, new_password);

    if (success) {
      // Remove OTP after use
      const filteredOtps = allOtps.filter((o: OTPRecord) => o.email !== email);
      await otpDb.writeAll(filteredOtps);

      return NextResponse.json({ success: true, message: 'Password reset successfully' });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to reset password' }, { status: 500 });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
