'use client';
import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Script from 'next/script';
import { ShieldCheck, Truck, CreditCard, Wallet, MapPin, ShoppingBag, AlertCircle, CheckCircle2, User as UserIcon } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [pincode, setPincode] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [isServiceable, setIsServiceable] = useState(false);
  const [cityName, setCityName] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: ''
  });

  const [taxSettings, setTaxSettings] = useState({
    cgst: 0, sgst: 0, igst: 0, platformFee: 0, maxCodAmount: 2000,
    razorpayKeyId: '', razorpayKeySecret: '',
    isCodEnabled: true, isRazorpayEnabled: true
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // PRE-FILL USER PHONE
  useEffect(() => {
    if (user && !form.phone) {
      setForm(prev => ({ ...prev, phone: user.phone }));
    }
  }, [user]);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      // Small delay to ensure Zustand persist has fully hydrated
      const timer = setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          router.push('/login');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const settingsRes = await fetch('/api/settings');
        const data = await settingsRes.json();
        setTaxSettings({
          cgst: Number(data.cgst) || 0,
          sgst: Number(data.sgst) || 0,
          igst: Number(data.igst) || 0,
          platformFee: Number(data.platformFee) || 0,
          maxCodAmount: Number(data.maxCodAmount) || 2000,
          razorpayKeyId: data.razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
          razorpayKeySecret: data.razorpayKeySecret || '',
          isCodEnabled: data.isCodEnabled ?? true,
          isRazorpayEnabled: data.isRazorpayEnabled ?? true
        });

        if (data.isRazorpayEnabled) setPaymentMethod('Razorpay');
        else if (data.isCodEnabled) setPaymentMethod('COD');
        else setPaymentMethod('Wallet');

        if (user) {
          const walletRes = await fetch(`/api/wallet?userId=${user.id}`);
          const walletData = await walletRes.json();
          setWalletBalance(walletData.balance || 0);
        }
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [user]);

  const subtotal = getTotal();
  const cgstAmount = (subtotal * taxSettings.cgst) / 100;
  const sgstAmount = (subtotal * taxSettings.sgst) / 100;
  const igstAmount = (subtotal * taxSettings.igst) / 100;
  const platformFee = taxSettings.platformFee;
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const grossTotal = subtotal + deliveryCharge + totalTax + platformFee;
  const walletDeduction = useWallet ? Math.min(walletBalance, grossTotal) : 0;
  const finalPayable = grossTotal - walletDeduction;

  const handlePincodeChange = async (val: string) => {
    setPincode(val);
    if (val.length === 6) {
      try {
        const res = await fetch('/api/pincodes');
        const pincodes = await res.json();
        const pinData = pincodes.find((p: any) => p.code === val);
        if (pinData) {
          setIsServiceable(true);
          setDeliveryCharge(Number(pinData.deliveryCharge) || 0);
          setCityName(pinData.city || '');
          toast.success(`Heritage delivery available in ${pinData.city}!`);
        } else {
          setIsServiceable(false);
          setDeliveryCharge(0);
          setCityName('');
          toast.error('Sorry, we do not deliver here yet.');
        }
      } catch (e) { console.error(e); }
    } else {
      setIsServiceable(false);
      setDeliveryCharge(0);
      setCityName('');
    }
  };

  const handleRazorpay = async () => {
    if (!isRazorpayLoaded) { toast.error("Payment system loading..."); return; }
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalPayable }),
      });
      const order = await res.json();
      if (order.error) throw new Error(order.error);

      const options = {
        key: taxSettings.razorpayKeyId,
        amount: order.amount,
        currency: "INR",
        name: "Kanvi Pickles",
        description: "Order Checkout",
        order_id: order.id,
        handler: async function (response: any) {
          submitOrder(useWallet ? 'Wallet + Razorpay' : 'Razorpay', response.razorpay_payment_id);
        },
        prefill: { name: form.customerName, email: form.email, contact: form.phone },
        theme: { color: "#059669" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Payment gateway error");
      setLoading(false);
    }
  };

  const submitOrder = async (method: string, paymentId?: string) => {
    try {
      if (walletDeduction > 0) {
        await fetch('/api/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user?.id, amount: -walletDeduction, description: `Order Checkout: ${method}` })
        });
      }
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          pincode,
          products: items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
          totalAmount: grossTotal,
          paidAmount: finalPayable,
          walletAmount: walletDeduction,
          taxAmount: Number(totalTax),
          platformFee: Number(platformFee),
          deliveryCharge: Number(deliveryCharge),
          paymentMethod: method,
          paymentId: paymentId || '',
          userId: user?.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('🎉 Heritage order placed!');
        clearCart();
        router.push(`/success?orderId=${data._id}`);
      } else {
        toast.error(data.message || data.error || 'Check all fields');
      }
    } catch (err) { toast.error('Checkout failed. Try again.'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!isServiceable) { toast.error('Pincode required'); setLoading(false); return; }
    if (!form.customerName || !form.email || !form.phone || !form.address) {
      toast.error('Please complete all delivery fields');
      setLoading(false);
      return;
    }
    if (finalPayable > 0 && paymentMethod === 'Razorpay') handleRazorpay();
    else submitOrder(useWallet ? (finalPayable === 0 ? 'Wallet' : `Wallet + ${paymentMethod}`) : paymentMethod);
  };

  if (!user || items.length === 0) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Inter, sans-serif' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setIsRazorpayLoaded(true)} />

      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Playfair Display, serif' }}>
          Secure <span style={{ color: '#059669' }}>Checkout</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Finalize your heritage pickle selection.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px', alignItems: 'flex-start' }}>

        {/* Delivery Form */}
        <div style={{ background: 'white', padding: '50px', borderRadius: '48px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={24} color="#059669" /> Delivery Details
          </h3>
          <form id="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
                <input required style={{ width: '100%', padding: '16px 16px 16px 45px', borderRadius: '18px', border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: '600', outline: 'none', transition: '0.2s' }} value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Who is receiving?" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Email</label>
                <input required type="email" style={{ padding: '16px', borderRadius: '18px', border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: '600', outline: 'none' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="order@example.com" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Phone</label>
                <input required style={{ padding: '16px', borderRadius: '18px', border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: '600', outline: 'none' }} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Mobile No." />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Delivery Pincode</label>
              <div style={{ position: 'relative' }}>
                <input required maxLength={6} style={{ width: '100%', padding: '18px 16px 18px 45px', borderRadius: '18px', border: `2px solid ${pincode.length === 6 ? (isServiceable ? '#059669' : '#ef4444') : '#f1f5f9'}`, background: '#f8fafc', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '0.1em', outline: 'none' }} value={pincode} onChange={e => handlePincodeChange(e.target.value)} placeholder="6 Digit Code" />
                <MapPin size={22} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                {isServiceable && cityName && (
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '0.8rem', fontWeight: '900', background: '#ecfdf5', padding: '6px 12px', borderRadius: '10px' }}>
                    <CheckCircle2 size={16} /> {cityName}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Detailed Address</label>
              <textarea required style={{ padding: '18px', borderRadius: '20px', border: '2px solid #f1f5f9', background: '#f8fafc', fontWeight: '600', outline: 'none', minHeight: '120px', resize: 'none', lineHeight: 1.6 }} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street name, Landmark, House details..." />
            </div>
          </form>
        </div>

        {/* Totals & Payments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {walletBalance > 0 && (
            <div style={{ background: '#f0fdf4', padding: '30px', borderRadius: '32px', border: '2px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{ width: '50px', height: '50px', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <Wallet size={24} color="#059669" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '900', color: '#065f46', fontSize: '1rem' }}>Heritage Wallet</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#059669', fontWeight: '700' }}>Balance: ₹{walletBalance.toFixed(2)}</p>
                </div>
              </div>
              <input type="checkbox" checked={useWallet} onChange={e => setUseWallet(e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: '#059669' }} />
            </div>
          )}

          {finalPayable > 0 && (
            <div style={{ background: 'white', padding: '40px', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginBottom: '25px' }}>Choose Payment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {taxSettings.isRazorpayEnabled && (
                  <div onClick={() => setPaymentMethod('Razorpay')} style={{ padding: '18px', borderRadius: '18px', border: '2px solid', borderColor: paymentMethod === 'Razorpay' ? '#059669' : '#f1f5f9', background: paymentMethod === 'Razorpay' ? '#ecfdf5' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s' }}>
                    <CreditCard size={20} color={paymentMethod === 'Razorpay' ? '#059669' : '#94a3b8'} />
                    <span style={{ fontWeight: '800', color: paymentMethod === 'Razorpay' ? '#065f46' : '#1e293b' }}>Pay Online Securely</span>
                  </div>
                )}
                {taxSettings.isCodEnabled && grossTotal <= taxSettings.maxCodAmount && (
                  <div onClick={() => setPaymentMethod('COD')} style={{ padding: '18px', borderRadius: '18px', border: '2px solid', borderColor: paymentMethod === 'COD' ? '#059669' : '#f1f5f9', background: paymentMethod === 'COD' ? '#ecfdf5' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s' }}>
                    <Truck size={20} color={paymentMethod === 'COD' ? '#059669' : '#94a3b8'} />
                    <span style={{ fontWeight: '800', color: paymentMethod === 'COD' ? '#065f46' : '#1e293b' }}>Cash on Delivery</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Premium Final Summary */}
          <div style={{ background: '#0f172a', padding: '50px 40px', borderRadius: '48px', color: 'white', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px', fontFamily: 'Playfair Display, serif' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '35px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.95rem', fontWeight: '500' }}>
                <span>Subtotal</span>
                <span style={{ color: 'white', fontWeight: '700' }}>₹{subtotal.toFixed(2)}</span>
              </div>

              {deliveryCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.95rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={16} /> Heritage Shipping {cityName && `(${cityName})`}</span>
                  <span style={{ color: '#fbbf24', fontWeight: '900' }}>+ ₹{deliveryCharge.toFixed(2)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.95rem' }}>
                <span>Taxes & System Fees</span>
                <span style={{ color: 'white', fontWeight: '700' }}>₹{(totalTax + platformFee).toFixed(2)}</span>
              </div>

              {walletDeduction > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399', fontSize: '0.95rem', fontWeight: '900', background: 'rgba(52, 211, 153, 0.1)', padding: '12px 16px', borderRadius: '16px' }}>
                  <span>Wallet Savings</span>
                  <span>− ₹{walletDeduction.toFixed(2)}</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '20px', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: '800' }}>Final Total</span>
                <span style={{ fontSize: '2.8rem', fontWeight: '900', color: '#34d399', letterSpacing: '-0.02em' }}>₹{finalPayable.toFixed(2)}</span>
              </div>
            </div>

            <button form="checkout-form" disabled={loading} style={{ width: '100%', background: '#059669', color: 'white', padding: '24px', borderRadius: '24px', border: 'none', fontWeight: '900', fontSize: '1.3rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 15px 30px -10px rgba(5, 150, 105, 0.3)', transition: '0.3s', opacity: loading ? 0.7 : 1 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div> Processing...
                </span>
              ) : `Complete Heritage Order`}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    </div>
  );
}
