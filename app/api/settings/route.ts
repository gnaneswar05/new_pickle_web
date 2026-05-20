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
        productsPerPage: 8,
        aboutUs: '', 
        ourMission: 'Our mission is to preserve the authentic flavors of Godavari and deliver them to pickle lovers across the globe. We believe in quality without compromise, using only the finest ingredients sourced directly from local farmers.',
        termsConditions: '', cancellationPolicy: '', refundPolicy: '', privacyPolicy: '', 
        maxCodAmount: 2000, razorpayKeyId: '', razorpayKeySecret: '',
        isCodEnabled: true, isRazorpayEnabled: true,
        topBannerText: 'Authentic Godavari • Global Shipping Available',
        contactPhone: '+91 8247812474',
        contactEmail: 'support@kanvipickles.com',
        contactAddress: 'Dabagardense, visakhapatnam, Andhra Pradesh',
        fssaiNumber: '23324010000854',
        instagramUrl: 'https://instagram.com/kanvipickles',
        whatsappUrl: 'https://wa.me/918247812474',
        trustFeatures: [
          { icon: 'Sparkles', title: 'Traditional Recipes', description: 'Handed down through generations, cooked with authentic Godavari spices, sun-dried ingredients, and traditional cold-pressed oils.' },
          { icon: 'Leaf', title: '100% Natural & Pure', description: 'No chemical preservatives, zero artificial colors, and no MSG. We only pack pure, wholesome flavor inspired by nature.' },
          { icon: 'Truck', title: 'Express Fresh Delivery', description: 'Directly shipped from our kitchen in Visakhapatnam to your home. Double-sealed premium glass jars ensure freshness.' }
        ]
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
