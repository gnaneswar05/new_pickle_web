import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Slider } from '@/models/Slider';

export async function GET() {
  try {
    await dbConnect();
    const sliders = await Slider.find({});
    return NextResponse.json(sliders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const slider = await Slider.create(body);
    return NextResponse.json(slider);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
