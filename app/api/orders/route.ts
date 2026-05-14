import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order } from '@/models/Order';

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Add default tracking stage on creation
    const orderData = {
      ...body,
      tracking: [{
        stage: 'Pending',
        message: 'Order placed successfully and is awaiting confirmation.',
        timestamp: new Date()
      }]
    };

    console.log("Attempting to create order for user:", body.userId);

    const order = await Order.create(orderData);
    console.log("Order created successfully:", order._id);
    
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error("ORDER CREATION FAILED:", error);
    
    // Detailed validation error response
    if (error.name === 'ValidationError') {
      const fieldErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      return NextResponse.json({ 
        error: 'Validation failed', 
        fields: fieldErrors,
        message: fieldErrors.map(f => f.message).join(', ')
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Order creation failed', 
      details: error.message 
    }, { status: 500 });
  }
}
