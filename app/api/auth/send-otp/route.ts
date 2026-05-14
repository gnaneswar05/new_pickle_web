import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: 'Phone is required' }, { status: 400 });

    // Normalize phone (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');

    const existingUser = await User.findOne({ phone: cleanPhone });
    if (existingUser && existingUser.isBlocked) {
      return NextResponse.json({ error: 'Your account has been suspended. Please contact support.' }, { status: 403 });
    }

    // For testing/demo, we use a fixed OTP 123456
    const otp = "123456"; 
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour for testing

    await User.findOneAndUpdate(
      { phone: cleanPhone },
      { otp, otpExpires: expires },
      { upsert: true, new: true }
    );

    return NextResponse.json({ message: 'OTP sent', otp });

    // In production, send SMS here. For demo, return OTP in response.
    return NextResponse.json({ message: 'OTP sent', otp });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
