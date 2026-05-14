'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Script from 'next/script';

export default function AddMoneyPage() {
  const user = useAuthStore((state) => state.user);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => setRazorpayKeyId(data.razorpayKeyId));
  }, []);

  if (!user) return null;

  const handleRazorpay = async () => {
    if (!razorpayKeyId) {
      toast.error('Razorpay is not configured. Please add Key ID in Admin Settings.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const order = await res.json();

      if (order.error) {
        toast.error(order.error);
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount: order.amount,
        currency: "INR",
        name: "Kanvi Pickles",
        description: "Wallet Top-up",
        order_id: order.id,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            await creditWallet();
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          contact: user.phone,
        },
        theme: { color: "#16a34a" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Failed to initiate payment. Check your internet or configuration.");
    }
    setLoading(false);
  };

  const creditWallet = async () => {
    const res = await fetch('/api/wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        amount: parseFloat(amount),
        description: 'Added money via Razorpay'
      }),
    });
    if (res.ok) {
      toast.success(`₹${amount} added successfully!`);
      router.push('/wallet');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRazorpay();
  };

  return (
    <div className="container" style={{ padding: '6rem 20px', maxWidth: '400px' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="card shadow-2xl" style={{ borderRadius: '24px' }}>
        <h1 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: 'Playfair Display, serif' }}>Top Up Wallet</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-2">Amount to Add (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
              <input 
                required 
                type="number" 
                min="10"
                className="input pl-8" 
                style={{ fontSize: '1.25rem', fontWeight: 'bold' }}
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[100, 500, 1000].map(val => (
              <button 
                key={val} 
                type="button" 
                onClick={() => setAmount(val.toString())} 
                className="p-3 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all font-bold text-slate-600"
              >
                +₹{val}
              </button>
            ))}
          </div>
          <button className="btn btn-primary py-4 rounded-2xl shadow-lg mt-4" disabled={loading || !amount}>
            {loading ? 'Processing...' : 'Pay with Razorpay'}
          </button>
        </form>
      </div>
    </div>
  );
}
