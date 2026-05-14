import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Settings } from '@/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = await Settings.create({ 
        cgst: 0, sgst: 0, igst: 0, platformFee: 0, 
        aboutUs: '', termsConditions: '', cancellationPolicy: '', refundPolicy: '', privacyPolicy: '', 
        maxCodAmount: 2000, razorpayKeyId: '', razorpayKeySecret: '',
        isCodEnabled: true, isRazorpayEnabled: true,
        topBannerText: 'Authentic Godavari Heritage • Global Shipping Available'
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Efficiently update existing settings or create new ones
    const settings = await Settings.findOneAndUpdate(
      {}, 
      { $set: body }, 
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("Settings Update Error:", error);
    return NextResponse.json({ error: 'Failed to update settings', details: error.message }, { status: 500 });
  }
}
