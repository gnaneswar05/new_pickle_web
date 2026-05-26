'use client';
import { useState, useEffect, useMemo } from 'react';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import Script from 'next/script';
import { ShieldCheck, Truck, CreditCard, Wallet, MapPin, ShoppingBag, AlertCircle, CheckCircle2, User as UserIcon, Clock } from 'lucide-react';

import { CheckoutSkeleton } from '../components/Skeleton';

export default function CheckoutPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [isServiceable, setIsServiceable] = useState(false);
  const [cityName, setCityName] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');

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
        } else {
            setLoading(false);
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
    // Only allow digits
    val = val.replace(/\D/g, '').slice(0, 6);
    setPincode(val);
    if (val.length === 6) {
      try {
        const res = await fetch(`/api/pincodes/check?code=${val}`);
        const data = await res.json();
        if (data.available) {
          setIsServiceable(true);
          setDeliveryCharge(Number(data.deliveryCharge) || 0);
          setCityName(data.city || '');
          setExpectedDelivery(data.expectedDelivery || '3-5 Days');
          toast.success(`Delivery available in ${data.city}!`);
        } else {
          setIsServiceable(false);
          setDeliveryCharge(0);
          setCityName('');
          setExpectedDelivery('');
          toast.error(data.message || 'Sorry, we do not deliver here yet.');
        }
      } catch (e) { console.error(e); }
    } else {
      setIsServiceable(false);
      setDeliveryCharge(0);
      setCityName('');
      setExpectedDelivery('');
    }
  };

  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleRazorpay = async () => {
    if (!isRazorpayLoaded || !(window as any).Razorpay) {
      toast.error("Payment system is still loading. Please wait a moment and try again.");
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalPayable }),
      });
      if (!res.ok) {
        toast.error("Could not create payment order. Please try again.");
        setPaymentLoading(false);
        return;
      }
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
          await submitOrder(useWallet ? 'Wallet + Razorpay' : 'Razorpay', response.razorpay_payment_id);
          setPaymentLoading(false);
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          }
        },
        prefill: { name: form.customerName, email: form.email, contact: form.phone },
        theme: { color: "#dc2626" },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || "Payment gateway error");
      setPaymentLoading(false);
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
          expectedDelivery,
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
        toast.success('🎉 Order placed!');
        clearCart();
        router.push(`/success?orderId=${data._id}`);
      } else {
        toast.error(data.message || data.error || 'Check all fields');
      }
    } catch (err) { toast.error('Checkout failed. Try again.'); } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isServiceable) { toast.error('Pincode required'); return; }
    if (!form.customerName || !form.email || !form.phone || !form.address) {
      toast.error('Please complete all delivery fields');
      return;
    }
    if (finalPayable > 0 && paymentMethod === 'Razorpay') {
      handleRazorpay();
    } else {
      setLoading(true);
      submitOrder(useWallet ? (finalPayable === 0 ? 'Wallet' : `Wallet + ${paymentMethod}`) : paymentMethod);
    }
  };

  if (!mounted) return null;
  if (loading) return <CheckoutSkeleton />;
  if (!user || items.length === 0) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setIsRazorpayLoaded(true)} />

      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: '900', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>
          Secure <span style={{ color: 'var(--primary)' }}>Checkout</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Finalize your pickle selection.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px', alignItems: 'flex-start' }}>

        {/* Delivery Form */}
        <div style={{ background: 'var(--surface)', padding: '50px', borderRadius: '48px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <MapPin size={24} color="var(--primary)" /> Delivery Details
          </h3>
          <form id="checkout-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input required style={{ width: '100%', padding: '16px 16px 16px 45px', borderRadius: '18px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontWeight: '600', outline: 'none', transition: '0.2s' }} value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} placeholder="Who is receiving?" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</label>
                <input required type="email" style={{ padding: '16px', borderRadius: '18px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontWeight: '600', outline: 'none' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="order@example.com" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</label>
                <input required style={{ padding: '16px', borderRadius: '18px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontWeight: '600', outline: 'none' }} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Mobile No." />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery Pincode</label>
              <div style={{ position: 'relative' }}>
                <input required maxLength={6} style={{ width: '100%', padding: '18px 16px 18px 45px', borderRadius: '18px', border: `2px solid ${pincode.length === 6 ? (isServiceable ? 'var(--primary)' : '#ef4444') : 'var(--border)'}`, background: 'var(--background)', color: 'var(--text-main)', fontWeight: '900', fontSize: '1.2rem', letterSpacing: '0.1em', outline: 'none' }} value={pincode} onChange={e => handlePincodeChange(e.target.value)} placeholder="6 Digit Code" />
                <MapPin size={22} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                {isServiceable && cityName && (
                  <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '900', background: 'var(--secondary)', padding: '6px 12px', borderRadius: '10px' }}>
                    <CheckCircle2 size={16} /> {cityName}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Detailed Address</label>
              <textarea required style={{ padding: '18px', borderRadius: '20px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', fontWeight: '600', outline: 'none', minHeight: '120px', resize: 'none', lineHeight: 1.6 }} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Street name, Landmark, House details..." />
            </div>
          </form>
        </div>

        {/* Totals & Payments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

          {walletBalance > 0 && (
            <div style={{ background: 'var(--secondary)', padding: '30px', borderRadius: '32px', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', boxShadow: 'var(--shadow)', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                <div style={{ width: '50px', height: '50px', background: 'var(--surface)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow)' }}>
                  <Wallet size={24} color="var(--primary)" />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '900', color: 'var(--text-main)', fontSize: '1rem' }}>Wallet</p>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '700' }}>Balance: ₹{walletBalance.toFixed(2)}</p>
                </div>
              </div>
              <input type="checkbox" checked={useWallet} onChange={e => setUseWallet(e.target.checked)} style={{ width: '24px', height: '24px', cursor: 'pointer', accentColor: 'var(--primary)' }} />
            </div>
          )}

          {finalPayable > 0 && (
            <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '40px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '25px' }}>Choose Payment</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {taxSettings.isRazorpayEnabled && (
                  <div onClick={() => setPaymentMethod('Razorpay')} style={{ padding: '18px', borderRadius: '18px', border: '2px solid', borderColor: paymentMethod === 'Razorpay' ? 'var(--primary)' : 'var(--border)', background: paymentMethod === 'Razorpay' ? 'var(--secondary)' : 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s' }}>
                    <CreditCard size={20} color={paymentMethod === 'Razorpay' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>Pay Online Securely</span>
                  </div>
                )}
                {taxSettings.isCodEnabled && grossTotal <= taxSettings.maxCodAmount && (
                  <div onClick={() => setPaymentMethod('COD')} style={{ padding: '18px', borderRadius: '18px', border: '2px solid', borderColor: paymentMethod === 'COD' ? 'var(--primary)' : 'var(--border)', background: paymentMethod === 'COD' ? 'var(--secondary)' : 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', transition: '0.2s' }}>
                    <Truck size={20} color={paymentMethod === 'COD' ? 'var(--primary)' : 'var(--text-muted)'} />
                    <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>Cash on Delivery</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Premium Final Summary */}
          <div style={{ background: 'var(--surface)', padding: '50px 40px', borderRadius: '48px', color: 'var(--text-main)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '30px', borderBottom: '1px solid var(--border)', paddingBottom: '20px', fontFamily: 'Fraunces, serif', color: 'var(--text-main)' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '35px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>₹{subtotal.toFixed(2)}</span>
              </div>

              {isServiceable ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={16} /> Delivery Charges {cityName && `(${cityName})`}
                    </span>
                    <span style={{ color: deliveryCharge > 0 ? 'var(--primary)' : '#166534', fontWeight: '900' }}>
                      {deliveryCharge > 0 ? `+ ₹${deliveryCharge.toFixed(2)}` : 'FREE'}
                    </span>
                  </div>
                  {expectedDelivery && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} /> Expected Delivery
                      </span>
                      <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>
                        {expectedDelivery}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={16} /> Delivery Charges
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                    Enter pincode to calculate
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <span>Taxes & System Fees</span>
                <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>₹{(totalTax + platformFee).toFixed(2)}</span>
              </div>

              {walletDeduction > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontSize: '0.95rem', fontWeight: '900', background: 'var(--secondary)', padding: '12px 16px', borderRadius: '16px' }}>
                  <span>Wallet Savings</span>
                  <span>− ₹{walletDeduction.toFixed(2)}</span>
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border)', marginTop: '20px', paddingTop: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: '800' }}>Final Total</span>
                <span style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.02em' }}>₹{finalPayable.toFixed(2)}</span>
              </div>
            </div>

            <button form="checkout-form" disabled={loading || paymentLoading} style={{ width: '100%', background: 'var(--primary)', color: 'white', padding: '24px', borderRadius: '24px', border: 'none', fontWeight: '900', fontSize: '1.3rem', cursor: (loading || paymentLoading) ? 'not-allowed' : 'pointer', boxShadow: 'var(--shadow)', transition: '0.3s', opacity: (loading || paymentLoading) ? 0.7 : 1 }}>
              {(loading || paymentLoading) ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                  {paymentLoading ? 'Opening Payment...' : 'Processing...'}
                </span>
              ) : `Complete Order`}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </div>
    </div>
  );
}

