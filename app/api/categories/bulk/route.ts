import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Category } from '@/models/Category';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { categories } = await req.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let errors: string[] = [];

    for (const item of categories) {
      const name = String(item.name || '').trim();
      const image = String(item.image || '').trim();
      const icon = String(item.icon || '🏷️').trim();

      if (!name) {
        errors.push(`Missing category name`);
        continue;
      }

      const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      if (existing) {
        const updateData: any = {};
        if (image) updateData.image = image;
        if (icon) updateData.icon = icon;
        await Category.findByIdAndUpdate(existing._id, updateData);
        updated++;
      } else {
        if (!image) {
          errors.push(`Missing image for category: ${name}`);
          continue;
        }
        await Category.create({ name, image, icon });
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
