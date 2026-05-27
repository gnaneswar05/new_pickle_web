'use client';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { Wallet, ShoppingBag, User as UserIcon, LogOut, ArrowRight, Clock, Star, ShieldCheck, MapPin, CreditCard, X, TrendingUp, History } from 'lucide-react';
import { DashboardSkeleton } from '../components/Skeleton';

export default function UserDashboard() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const { logout } = useAuthStore();

  const fetchBalance = async () => {
    try {
      if (!user?.id) return;
      const res = await fetch(`/api/wallet?userId=${user.id}`);
      if (!res.ok) {
        if (res.status === 404) {
          useAuthStore.getState().logout();
          router.push('/login');
          toast.error("Session expired. Please log in again.");
        }
        return;
      }
      const data = await res.json();
      setBalance(data.balance || 0);
      setTransactions(data.transactions || []);
    } catch (err) { console.error(err); }
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          router.push('/login');
        } else {
          fetchBalance().finally(() => setLoading(false));
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, router]);

  const handleAddFunds = async () => {
    if (!addAmount || isNaN(Number(addAmount)) || Number(addAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!isRazorpayLoaded || !(window as any).Razorpay) {
      toast.error("Payment system is still loading. Please wait a moment and try again.");
      return;
    }

    setPaymentLoading(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(addAmount) }),
      });

      if (!res.ok) {
        toast.error("Could not create payment order. Please try again.");
        return;
      }

      const order = await res.json();

      const settingsRes = await fetch('/api/settings');
      const settings = await settingsRes.json();

      const options = {
        key: settings.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Kanvi Wallet",
        description: "Adding funds to wallet",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch('/api/wallet', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user?.id,
                amount: Number(addAmount),
                description: 'Funds added via Online Payment'
              })
            });

            if (verifyRes.ok) {
              toast.success(`₹${addAmount} added to your wallet!`);
              setIsModalOpen(false);
              setAddAmount('');
              fetchBalance();
            } else {
              toast.error("Payment received but wallet update failed. Contact support.");
            }
          } catch {
            toast.error("Wallet update failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          }
        },
        prefill: { contact: user?.phone },
        theme: { color: "#dc2626" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (!mounted) return null;
  if (!user) return null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Fraunces, serif' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setIsRazorpayLoaded(true)} />

      {/* Header Area */}
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>
          Hello, <span style={{ color: 'var(--primary)' }}>{user.phone}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontWeight: '500' }}>Welcome back to your dashboard.</p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {/* Wallet Card */}
            <div style={{ background: '#0d0707', borderRadius: '40px', padding: '40px', color: 'white', boxShadow: '0 25px 50px -12px rgba(220, 38, 38, 0.1)', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '100px', height: '100px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '50%' }}></div>
              <div style={{ width: '56px', height: '56px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
                <Wallet size={28} color="#ef4444" />
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Wallet Balance Amount</p>
              <h2 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0 }}>₹{balance.toFixed(2)}</h2>
              <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
                <button onClick={() => setIsModalOpen(true)} style={{ flex: 1, background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', transition: '0.2s' }}>Add Funds</button>
                <Link href="/wallet" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', padding: '16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '900', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <History size={18} /> History
                </Link>
              </div>
            </div>

            {/* Orders Card */}
            <Link href="/orders" style={{ textDecoration: 'none', background: 'var(--surface)', borderRadius: '40px', padding: '40px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'transform 0.3s, box-shadow 0.3s', boxShadow: 'var(--shadow)' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--secondary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={28} color="var(--primary)" /></div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0', fontFamily: 'Fraunces, serif' }}>My Orders</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Track and manage your pickle history.</p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '800' }}>Manage Orders <ArrowRight size={18} /></div>
            </Link>
          </div>

          {/* Sign Out */}
          <div style={{ textAlign: 'center', marginTop: '50px', paddingTop: '40px', borderTop: '1px solid var(--border)' }}>
            <button
              onClick={() => { logout(); router.push('/'); }}
              style={{ background: 'var(--secondary)', color: 'var(--primary)', border: '2px solid var(--border)', padding: '14px 36px', borderRadius: '18px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Fraunces, serif', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--primary)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--secondary)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary)'; }}
            >
              Sign Out
            </button>
          </div>
        </>
      )}

      {/* Add Funds Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '40px', borderRadius: '40px', width: '100%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '30px', top: '30px', background: 'var(--border)', color: 'var(--text-main)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'Fraunces, serif' }}>Add Funds</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '35px', fontWeight: '500' }}>Funds will be added instantly to your wallet.</p>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Enter Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', fontSize: '1.5rem', color: 'var(--text-main)' }}>₹</span>
                <input autoFocus type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} style={{ width: '100%', padding: '20px 20px 20px 45px', fontSize: '1.5rem', fontWeight: '900', borderRadius: '20px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', outline: 'none' }} placeholder="0.00" />
              </div>
            </div>

            {!isRazorpayLoaded && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '16px', fontWeight: '600' }}>
                ⏳ Payment system loading...
              </p>
            )}
            <button
              onClick={handleAddFunds}
              disabled={paymentLoading || !isRazorpayLoaded}
              style={{ width: '100%', background: isRazorpayLoaded ? 'var(--primary)' : 'var(--border)', color: 'white', padding: '20px', borderRadius: '22px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: (paymentLoading || !isRazorpayLoaded) ? 'not-allowed' : 'pointer', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)', opacity: (paymentLoading || !isRazorpayLoaded) ? 0.7 : 1, transition: 'all 0.3s' }}
            >
              {paymentLoading ? 'Processing...' : !isRazorpayLoaded ? 'Please Wait...' : 'Proceed to Pay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

