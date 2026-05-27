import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');

    const user = await User.findOne({ phone: cleanPhone });
    if (!user) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 });
    }

    if (user.isBlocked) {
      return NextResponse.json({ error: 'Your account has been suspended. Please contact support.' }, { status: 403 });
    }

    if (!user.password) {
      return NextResponse.json({ 
        error: 'No password is set for this account yet. Please sign in with OTP or use Forgot Password to set one.' 
      }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Logged in successfully',
      user: { id: user._id, phone: user.phone }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Failed to process login' }, { status: 500 });
  }
}
