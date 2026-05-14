import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/Product';

const dummyProducts = [
  {
    name: "Spicy Mango Pickle",
    description: "Traditional raw mango pickle made with mustard oil and secret spices.",
    price: 250,
    image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800",
    category: "Mango",
    stock: 50,
    featured: true,
    isTopSelling: true
  },
  {
    name: "Garlic Delight",
    description: "A pungent and spicy garlic pickle that goes well with everything.",
    price: 180,
    image: "https://images.unsplash.com/photo-1589010588553-46e8ce0c27b1?w=800",
    category: "Garlic",
    stock: 30,
    featured: true,
    isTopSelling: true
  },
  {
    name: "Mixed Veggie Tango",
    description: "Carrot, cauliflower, and green chilies perfectly pickled.",
    price: 220,
    image: "https://images.unsplash.com/photo-1610444315233-aeb00139e830?w=800",
    category: "Mixed",
    stock: 40,
    featured: false
  },
  {
    name: "Fiery Green Chili",
    description: "Only for the brave. Fresh green chilies marinated in lemon and spices.",
    price: 150,
    image: "https://images.unsplash.com/photo-1596632426987-a36ff8d51194?w=800",
    category: "Chili",
    stock: 100,
    featured: true
  }
];

import { Admin } from '@/models/Admin';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();
    await Product.deleteMany({});
    await Product.insertMany(dummyProducts);

    await Admin.deleteMany({});
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Admin.create({ username: 'admin', password: hashedPassword });

    const { Category } = await import('@/models/Category');
    await Category.deleteMany({});
    await Category.insertMany([
      { name: 'Mango', icon: '🥭', image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800' },
      { name: 'Garlic', icon: '🧄', image: 'https://images.unsplash.com/photo-1589010588553-46e8ce0c27b1?w=800' },
      { name: 'Mixed', icon: '🥗', image: 'https://images.unsplash.com/photo-1610444315233-aeb00139e830?w=800' },
      { name: 'Chili', icon: '🌶️', image: 'https://images.unsplash.com/photo-1596632426987-a36ff8d51194?w=800' },
    ]);

    const { Slider } = await import('@/models/Slider');
    await Slider.deleteMany({});
    await Slider.create({
      title: 'Traditional Godavari Flavors',
      subtitle: 'Authentic handcrafted pickles delivered to your doorstep.',
      image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=1600',
    });

    return NextResponse.json({ success: true, message: 'Seeded products, admin, categories, and slider' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
