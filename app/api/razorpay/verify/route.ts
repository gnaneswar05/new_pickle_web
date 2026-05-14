import { NextResponse } from 'next/server';
import { Settings } from '@/models/Settings';
import dbConnect from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const settings = await Settings.findOne({});
    const keySecret = settings?.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || 'test_secret';

    if (!keySecret) {
      return NextResponse.json({ error: 'Razorpay secret not configured. Please add it in Admin > Settings.' }, { status: 500 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", keySecret)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return NextResponse.json({ success: true, message: "Payment verified successfully" });
    } else {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
