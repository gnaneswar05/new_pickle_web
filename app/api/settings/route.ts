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
        ],
        middleBannerText: "100% Sun-Dried Godavari Recipes • No Chemical Preservatives • Cured in Cold-Pressed Oils • Free Shipping Above ₹999",
        craftSteps: [
          { stepNumber: 1, title: 'Godavari Sourcing', description: 'We source fresh green mangoes, aromatic ginger, plump garlic, and local red chillies directly from Godavari farmers at their peak harvest.' },
          { stepNumber: 2, title: 'Sun-Dried Curing', description: 'Sliced ingredients are dried under natural sunlight to remove excess moisture and preserve their structural goodness and natural tang.' },
          { stepNumber: 3, title: 'Cold-Pressed Oils', description: 'We cure our pickles in high-quality cold-pressed mustard oil and sesame oil, ensuring they stay preserved naturally and taste richly aromatic.' },
          { stepNumber: 4, title: 'Hand-Spiced & Sealed', description: 'Each batch is hand-mixed with ancestral spice ratios and sealed in premium glass jars to protect the home-made aroma and taste.' }
        ],
        isBundleEnabled: true,
        bundlePrice: 499,
        bundleQuantity: 3,
        bundleTitle: "Curate Your Gourmet Sample Box",
        bundleDescription: "Choose any 3 of our premium pickles (150g jars) and get them delivered in a handcrafted luxury wooden gift box."
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
