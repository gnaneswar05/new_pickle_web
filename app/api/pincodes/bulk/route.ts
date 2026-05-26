import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pincode } from '@/models/Pincode';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { pincodes } = await req.json();

    if (!Array.isArray(pincodes) || pincodes.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let errors: string[] = [];

    for (const item of pincodes) {
      const code = String(item.code || '').trim();
      const city = String(item.city || '').trim();
      const deliveryCharge = Number(item.deliveryCharge) || 0;
      const expectedDelivery = String(item.expectedDelivery || '').trim() || '3-5 Days';
      const isActive = item.isActive !== false && item.isActive !== 'false';

      if (!/^\d{6}$/.test(code)) {
        errors.push(`Invalid pincode: ${code}`);
        continue;
      }
      if (!city) {
        errors.push(`Missing city for pincode: ${code}`);
        continue;
      }

      const existing = await Pincode.findOne({ code });
      if (existing) {
        await Pincode.findByIdAndUpdate(existing._id, { city, deliveryCharge, expectedDelivery, isActive });
        updated++;
      } else {
        await Pincode.create({ code, city, deliveryCharge, expectedDelivery, isActive });
        created++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk upload complete: ${created} created, ${updated} updated, ${errors.length} errors`,
      created,
      updated,
      errors
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bulk upload failed' }, { status: 500 });
  }
}
