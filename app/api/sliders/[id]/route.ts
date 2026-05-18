import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Slider } from '@/models/Slider';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await req.json();
    const slider = await Slider.findByIdAndUpdate(id, body, { new: true });
    if (!slider) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(slider);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const { id } = await params;
    const slider = await Slider.findByIdAndDelete(id);
    if (!slider) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
