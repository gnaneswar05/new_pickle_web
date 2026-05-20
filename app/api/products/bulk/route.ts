import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/Product';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    let created = 0;
    let updated = 0;
    let errors: string[] = [];

    for (const item of products) {
      const name = String(item.name || '').trim();
      const description = String(item.description || '').trim();
      const price = Number(item.price) || 0;
      const image = String(item.image || '').trim();
      const category = String(item.category || '').trim();
      const stock = Number(item.stock) || 0;
      const featured = item.featured === true || item.featured === 'true';
      const isTopSelling = item.isTopSelling === true || item.isTopSelling === 'true';
      const rating = Number(item.rating) || 4.9;

      // Parse variants
      let variants: { weight: string; price: number }[] = [];
      if (item.variants && Array.isArray(item.variants)) {
        variants = item.variants.filter((v: any) => v.weight && Number(v.price) > 0).map((v: any) => ({
          weight: String(v.weight),
          price: Number(v.price)
        }));
      } else {
        // Support flat CSV columns: price_250g, price_500g, price_1kg
        if (Number(item.price_250g) > 0) variants.push({ weight: '250g', price: Number(item.price_250g) });
        if (Number(item.price_500g) > 0) variants.push({ weight: '500g', price: Number(item.price_500g) });
        if (Number(item.price_1kg) > 0) variants.push({ weight: '1kg', price: Number(item.price_1kg) });
      }

      if (!name) { errors.push('Missing product name'); continue; }
      if (price <= 0) { errors.push(`Invalid price for: ${name}`); continue; }
      if (!category) { errors.push(`Missing category for: ${name}`); continue; }

      const existing = await Product.findOne({ name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
      if (existing) {
        await Product.findByIdAndUpdate(existing._id, {
          description: description || existing.description,
          price,
          image: image || existing.image,
          category,
          stock,
          featured,
          isTopSelling,
          rating,
          variants: variants.length > 0 ? variants : existing.variants
        });
        updated++;
      } else {
        if (!description) { errors.push(`Missing description for: ${name}`); continue; }
        if (!image) { errors.push(`Missing image for: ${name}`); continue; }
        await Product.create({ name, description, price, image, category, stock, featured, isTopSelling, rating, variants });
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
