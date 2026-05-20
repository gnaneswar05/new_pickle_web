'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, ArrowLeft, MapPin, Calendar, ExternalLink, ShieldCheck, ReceiptText, Wallet, CreditCard } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        setOrder(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#2d5a27', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#64748b', fontWeight: '600' }}>Locating your package...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!order || order.error) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', padding: '20px' }}>
      <div style={{ textAlign: 'center', background: 'white', padding: '60px', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '15px' }}>Order Not Found</h2>
        <p style={{ color: '#64748b', marginBottom: '30px' }}>We couldn't find an order with this ID.</p>
        <button onClick={() => router.push('/orders')} style={{ background: '#2d5a27', color: 'white', padding: '16px 32px', borderRadius: '16px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Back to My Orders</button>
      </div>
    </div>
  );

  const allStages = [
    { name: 'Pending', label: 'Order Placed', icon: Clock, desc: 'We have received your order.' },
    { name: 'Processing', label: 'In Preparation', icon: Package, desc: 'Our chefs are preparing your pickles.' },
    { 
      name: 'Shipped', 
      label: 'In Transit', 
      icon: Truck, 
      desc: order.courierName 
        ? `Package shipped via ${order.courierName} (ID: ${order.courierTrackingId})` 
        : 'Your package is on its way to your doorstep.' 
    },
    { name: 'Delivered', label: 'Delivered', icon: CheckCircle, desc: 'Package has been successfully delivered.' }
  ];

  const getStageInfo = (stageName: string) => {
    const history = order.tracking?.find((t: any) => t.stage === stageName);
    if (history) return { completed: true, time: history.timestamp };
    if (stageName === 'Pending' && order.createdAt) return { completed: true, time: order.createdAt };
    const currentIdx = allStages.findIndex(s => s.name === order.status);
    const stageIdx = allStages.findIndex(s => s.name === stageName);
    if (stageIdx <= currentIdx) return { completed: true, time: null };
    return { completed: false, time: null };
  };

  // FINANCIAL LOGIC - THE ULTIMATE TRUTH
  const productsSubtotal = order.products?.reduce((acc: number, p: any) => acc + (Number(p.price) * Number(p.quantity)), 0) || 0;
  
  // Fields from DB
  const dbDelivery = Number(order.deliveryCharge) || 0;
  const dbTax = Number(order.taxAmount) || 0;
  const dbPlatform = Number(order.platformFee) || 0;
  const dbWallet = Number(order.walletAmount) || 0;
  const dbTotal = Number(order.totalAmount) || 0;
  const dbPaid = Number(order.paidAmount) || 0;

  // SMART FALLBACKS (If fields were missing during transition)
  // If delivery is 0 but the math says there's a gap, use the gap.
  const financialGap = Math.max(0, dbTotal - productsSubtotal);
  
  // Logic: If we have explicit fields, use them. Otherwise, intelligently split the gap.
  let displayDelivery = dbDelivery;
  let displayTaxAndFees = dbTax + dbPlatform;

  if (displayDelivery === 0 && displayTaxAndFees === 0 && financialGap > 0) {
    // Legacy fallback: Assume anything over products is taxes/delivery
    // If gap is exactly 100 or 150 etc, it's likely delivery
    if (financialGap >= 100) {
      displayDelivery = 100;
      displayTaxAndFees = financialGap - 100;
    } else {
      displayTaxAndFees = financialGap;
    }
  }

  // Final Total logic
  const grossTotal = dbTotal || (productsSubtotal + displayDelivery + displayTaxAndFees);
  const walletDeduction = dbWallet || (grossTotal > dbPaid && dbPaid > 0 ? (grossTotal - dbPaid) : 0);
  const netPayable = grossTotal - walletDeduction;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <Link href="/orders" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', marginBottom: '40px' }}>
        <ArrowLeft size={18} /> Back to My Orders
      </Link>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '50px' }}>
        <div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
            Track <span style={{ color: '#2d5a27' }}>Shipment</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Order ID: <span style={{ color: '#1e293b', fontWeight: '800' }}>#{order._id.toUpperCase()}</span></p>
        </div>
        <div style={{ background: order.status === 'Delivered' ? '#f0f7f0' : '#eff6ff', color: order.status === 'Delivered' ? '#2d5a27' : '#2563eb', padding: '12px 24px', borderRadius: '18px', fontWeight: '900', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {order.status}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '50px', alignItems: 'flex-start' }}>
        
        {/* Timeline */}
        <div style={{ background: 'white', padding: '50px 40px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '40px', fontFamily: 'Fraunces, serif' }}>Delivery History</h3>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '23px', top: '20px', bottom: '20px', width: '3px', background: '#f1f5f9' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '45px' }}>
              {allStages.map((stage, idx) => {
                const info = getStageInfo(stage.name);
                return (
                  <div key={idx} style={{ display: 'flex', gap: '30px', position: 'relative', zIndex: 1, opacity: info.completed ? 1 : 0.4 }}>
                    <div style={{ width: '50px', height: '50px', background: info.completed ? '#2d5a27' : '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: info.completed ? 'white' : '#94a3b8', border: info.completed ? '5px solid #f0f7f0' : '3px solid #f1f5f9' }}>
                      <stage.icon size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                        <h4 style={{ margin: 0, fontWeight: '800', color: info.completed ? '#1e293b' : '#94a3b8', fontSize: '1.1rem' }}>{stage.label}</h4>
                        {info.completed && info.time && (
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#2d5a27', fontWeight: '800' }}>{new Date(info.time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>{new Date(info.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: info.completed ? '#64748b' : '#cbd5e1', fontWeight: '500', lineHeight: 1.5 }}>{stage.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          <div style={{ background: 'white', padding: '40px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ReceiptText size={20} color="#2d5a27" /> Order Receipt
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {order.products?.map((p: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>{p.quantity}x {p.name}</span>
                  <span style={{ fontWeight: '800', color: '#1e293b' }}>₹{(Number(p.price) * Number(p.quantity)).toFixed(2)}</span>
                </div>
              ))}
              
              <div style={{ height: '1px', background: '#f1f5f9', margin: '5px 0' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>Subtotal</span>
                <span style={{ fontWeight: '800', color: '#1e293b' }}>₹{productsSubtotal.toFixed(2)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <Truck size={14} color="#2d5a27" /> Delivery Charges
                </span>
                <span style={{ fontWeight: '900', color: '#d97706' }}>
                  {displayDelivery > 0 ? `+ ₹${displayDelivery.toFixed(2)}` : 'FREE'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <ShieldCheck size={14} color="#2d5a27" /> Taxes & Fees
                </span>
                <span style={{ fontWeight: '800', color: '#1e293b' }}>+ ₹{displayTaxAndFees.toFixed(2)}</span>
              </div>

              {walletDeduction > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', background: '#f0fdf4', padding: '12px 15px', borderRadius: '14px', border: '1px solid #d1fae5' }}>
                  <span style={{ color: '#2d5a27', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <Wallet size={14} color="#2d5a27" /> Wallet Savings
                  </span>
                  <span style={{ fontWeight: '900', color: '#2d5a27' }}>− ₹{walletDeduction.toFixed(2)}</span>
                </div>
              )}

              <div style={{ background: '#0f172a', padding: '25px', borderRadius: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', color: 'white' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6, fontSize: '0.85rem' }}>
                    <span>Gross Total</span>
                    <span>₹{grossTotal.toFixed(2)}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                       {order.paymentMethod?.includes('Razorpay') ? <CreditCard size={18} color="#34d399" /> : <Package size={18} color="#34d399" />}
                       <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>Net Paid via {order.paymentMethod || 'Online'}</span>
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#34d399' }}>₹{netPayable.toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Destination */}
          <div style={{ background: '#f8fafc', padding: '40px', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={20} color="#2d5a27" /> Destination
            </h3>
            <div>
              <p style={{ margin: 0, fontWeight: '800', color: '#1e293b', fontSize: '1.05rem' }}>{order.customerName}</p>
              <p style={{ margin: '8px 0 0 0', fontWeight: '600', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{order.address}</p>
              <p style={{ margin: '4px 0 0 0', fontWeight: '800', color: '#2d5a27', fontSize: '0.9rem' }}>Pincode: {order.pincode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
