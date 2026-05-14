import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await dbConnect();
    const order = await Order.findById(params.id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await dbConnect();
    const body = await req.json();
    
    const updateData: any = { status: body.status };
    if (body.courierName) updateData.courierName = body.courierName;
    if (body.courierTrackingId) updateData.courierTrackingId = body.courierTrackingId;

    // Update status AND push to tracking history
    const order = await Order.findByIdAndUpdate(
      params.id, 
      { 
        $set: updateData,
        $push: { 
          tracking: { 
            stage: body.status, 
            message: body.status === 'Shipped' && body.courierName 
              ? `Order shipped via ${body.courierName}. Tracking ID: ${body.courierTrackingId}`
              : `Order status updated to ${body.status}`,
            timestamp: new Date()
          } 
        }
      }, 
      { new: true }
    );
    
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error: any) {
    console.error("Order Update Error:", error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
