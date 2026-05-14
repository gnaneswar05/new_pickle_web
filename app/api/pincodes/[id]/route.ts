import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Pincode } from '@/models/Pincode';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    await Pincode.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete pincode' }, { status: 500 });
  }
}
