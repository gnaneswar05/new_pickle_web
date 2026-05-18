'use client';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import toast from 'react-hot-toast';
import { Wallet, ShoppingBag, User as UserIcon, LogOut, ArrowRight, Clock, Star, ShieldCheck, MapPin, CreditCard, X, TrendingUp, History } from 'lucide-react';
import LoadingLogo from '../components/LoadingLogo';

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

    setLoading(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(addAmount) }),
      });
      const order = await res.json();

      const settingsRes = await fetch('/api/settings');
      const settings = await settingsRes.json();

      const options = {
        key: settings.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_zHwXkL3v9v9v9v",
        amount: order.amount,
        currency: "INR",
        name: "Kanvi Wallet",
        description: "Adding funds to wallet",
        order_id: order.id,
        handler: async function (response: any) {
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
            toast.error("Failed to update wallet");
          }
        },
        prefill: { contact: user?.phone },
        theme: { color: "#480D18" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  if (loading) return <LoadingLogo message="Loading dashboard..." />;
  if (!user) return null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setIsRazorpayLoaded(true)} />
      
      {/* Header Area */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '60px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Playfair Display, serif' }}>
            Hello, <span style={{ color: '#480D18' }}>{user.phone}</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500' }}>Welcome back to your Godavari heritage dashboard.</p>
        </div>
        <button onClick={() => { logout(); router.push('/'); }} style={{ background: '#fff1f2', color: '#e11d48', border: 'none', padding: '12px 24px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}>
          Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Wallet Card */}
        <div style={{ background: '#0f172a', borderRadius: '40px', padding: '40px', color: 'white', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '100px', height: '100px', background: 'rgba(52, 211, 153, 0.05)', borderRadius: '50%' }}></div>
          <div style={{ width: '56px', height: '56px', background: 'rgba(52, 211, 153, 0.1)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
            <Wallet size={28} color="#34d399" />
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Heritage Credits</p>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '900', margin: 0 }}>₹{balance.toFixed(2)}</h2>
          <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
            <button onClick={() => setIsModalOpen(true)} style={{ flex: 1, background: '#480D18', color: 'white', padding: '16px', borderRadius: '18px', border: 'none', fontWeight: '900', cursor: 'pointer', transition: '0.2s' }}>Add Funds</button>
            <Link href="/wallet" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: 'white', padding: '16px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '900', textDecoration: 'none', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <History size={18} /> History
            </Link>
          </div>
        </div>

        {/* Orders Card */}
        <Link href="/orders" style={{ textDecoration: 'none', background: 'white', borderRadius: '40px', padding: '40px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', transition: 'transform 0.3s, box-shadow 0.3s' }}>
          <div style={{ width: '56px', height: '56px', background: '#ecfdf5', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={28} color="#480D18" /></div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0', fontFamily: 'Playfair Display, serif' }}>My Orders</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Track and manage your pickle history.</p>
          </div>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '8px', color: '#480D18', fontWeight: '800' }}>Manage Orders <ArrowRight size={18} /></div>
        </Link>
      </div>

      {/* Add Funds Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '40px', width: '100%', maxWidth: '450px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', right: '30px', top: '30px', background: '#f8fafc', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '12px', fontFamily: 'Playfair Display, serif' }}>Add Funds</h2>
            <p style={{ color: '#64748b', marginBottom: '35px', fontWeight: '500' }}>Funds will be added instantly to your wallet.</p>
            
            <div style={{ marginBottom: '30px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Enter Amount</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontWeight: '900', fontSize: '1.5rem', color: '#1e293b' }}>₹</span>
                <input autoFocus type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)} style={{ width: '100%', padding: '20px 20px 20px 45px', fontSize: '1.5rem', fontWeight: '900', borderRadius: '20px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none' }} placeholder="0.00" />
              </div>
            </div>

            <button 
              onClick={handleAddFunds}
              disabled={loading}
              style={{ width: '100%', background: '#480D18', color: 'white', padding: '20px', borderRadius: '22px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 15px -3px rgba(72, 13, 24, 0.2)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : 'Proceed to Pay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

