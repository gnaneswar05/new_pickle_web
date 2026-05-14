import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pincode } from '@/models/Pincode';

export async function GET() {
  try {
    await dbConnect();
    const pincodes = await Pincode.find({}).sort({ createdAt: -1 });
    return NextResponse.json(pincodes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pincodes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const existing = await Pincode.findOne({ code: body.code });
    if (existing) {
      return NextResponse.json({ error: 'Pincode already exists' }, { status: 400 });
    }
    const pincode = await Pincode.create(body);
    return NextResponse.json(pincode, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create pincode' }, { status: 500 });
  }
}
