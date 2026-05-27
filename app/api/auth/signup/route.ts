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

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit phone number' }, { status: 400 });
    }

    const existingUser = await User.findOne({ phone: cleanPhone });

    if (existingUser) {
      if (existingUser.isBlocked) {
        return NextResponse.json({ error: 'This phone number has been suspended.' }, { status: 403 });
      }

      if (existingUser.password) {
        return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 400 });
      }

      // Upgrade existing OTP-only user to have a password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      existingUser.password = hashedPassword;
      existingUser.isVerified = true;
      await existingUser.save();

      return NextResponse.json({
        success: true,
        message: 'Account upgraded successfully with password!',
        user: { id: existingUser._id, phone: existingUser.phone }
      });
    }

    // Create a new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      phone: cleanPhone,
      password: hashedPassword,
      isVerified: true
    });

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully!',
      user: { id: newUser._id, phone: newUser.phone }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to process registration' }, { status: 500 });
  }
}
