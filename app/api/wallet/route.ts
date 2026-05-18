import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { WalletTransaction } from '@/models/WalletTransaction';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 5;
    const skip = (page - 1) * limit;

    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const transactions = await WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await WalletTransaction.countDocuments({ userId });

    return NextResponse.json({ 
      balance: user?.walletBalance || 0,
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wallet data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { userId, amount, description } = await req.json();

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    user.walletBalance += amount;
    await user.save();

    await WalletTransaction.create({
      userId,
      amount,
      type: amount >= 0 ? 'Credit' : 'Debit',
      description
    });

    return NextResponse.json({ balance: user.walletBalance });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update wallet', details: error?.message || 'Unknown error' }, { status: 500 });
  }
}
