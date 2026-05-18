import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { Settings } from '@/models/Settings';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const settings = await Settings.findOne({});

    // Prioritize Admin Settings, then Env, then hardcoded test (only for development)
    const keyId = settings?.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_zHwXkL3v9v9v9v';
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || 'test_secret';

    if (!keyId || !keySecret || keySecret === 'test_secret') {
      return NextResponse.json({
        error: 'Razorpay keys are missing or invalid. Please update them in Admin > Settings > Payments.'
      }, { status: 400 });
    }

    const { amount } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // Convert to paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Razorpay API Error:", error);
    return NextResponse.json({
      error: error.message || 'Razorpay order creation failed',
      details: error.description || 'Check your Razorpay Key and Secret'
    }, { status: 500 });
  }
}
