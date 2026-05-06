import { JsonHandler } from '../../../../src/infrastructure/database/json-handler';
import { NextResponse } from 'next/server';

interface OTPRecord {
  email: string;
  otp: string;
  expires_at: string;
}

const otpDb = new JsonHandler<OTPRecord>('otps.json');
const userDb = new JsonHandler<any>('users.json');

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const users = await userDb.readAll();
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      // For security, don't reveal if user exists, but here for UX we might
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Save OTP
    const allOtps = await otpDb.readAll();
    const filteredOtps = allOtps.filter((o: OTPRecord) => o.email !== email); // Remove old ones
    filteredOtps.push({ email, otp, expires_at: expiresAt });
    await otpDb.writeAll(filteredOtps);

    // LOG TO CONSOLE (As requested)
    console.log('-------------------------------------------');
    console.log(`[AUTH] FORGOT PASSWORD OTP FOR ${email}`);
    console.log(`CODE: ${otp}`);
    console.log('-------------------------------------------');

    // SEND TO EMAIL SIMULATOR
    try {
      const origin = request.headers.get('origin') || 'http://localhost:3000';
      await fetch(`${origin}/api/simulators/emailer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: 'QWERTY - Password Reset OTP',
          body: `Halo, ini adalah kode OTP Anda untuk mereset password di QWERTY: ${otp}. Kode ini berlaku selama 10 menit.`
        })
      });
    } catch (err) {
      console.error('Failed to send to email simulator:', err);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP has been sent to your email (check terminal or simulator)' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
