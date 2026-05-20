import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pincode } from '@/models/Pincode';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json({ available: false, error: 'Invalid pincode format. Must be 6 digits.' }, { status: 400 });
    }

    // Check how many total active pincodes exist
    const totalActive = await Pincode.countDocuments({ isActive: true });

    // If no pincodes are configured, delivery is allowed everywhere with 0 charge
    if (totalActive === 0) {
      return NextResponse.json({
        available: true,
        city: 'All India',
        deliveryCharge: 0,
        message: 'Delivery available everywhere (no zones configured)'
      });
    }

    // Otherwise, check for a match
    const pinData = await Pincode.findOne({ code, isActive: true });
    if (pinData) {
      return NextResponse.json({
        available: true,
        city: pinData.city,
        deliveryCharge: pinData.deliveryCharge
      });
    } else {
      return NextResponse.json({
        available: false,
        message: 'Sorry, we do not deliver to this pincode yet.'
      });
    }
  } catch (error) {
    return NextResponse.json({ available: false, error: 'Failed to check pincode' }, { status: 500 });
  }
}
