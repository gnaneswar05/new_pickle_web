import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { phone, otp } = await req.json();
    const cleanPhone = phone.replace(/\D/g, '');

    const user = await User.findOne({ phone: cleanPhone, otp, otpExpires: { $gt: new Date() } });
    if (!user) return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });

    user.otp = undefined;
    user.otpExpires = undefined;
    user.isVerified = true;
    await user.save();

    return NextResponse.json({ 
      message: 'Logged in successfully',
      user: { id: user._id, phone: user.phone }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
