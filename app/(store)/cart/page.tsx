'use client';
import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    fetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  if (!mounted) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px', textAlign: 'center', fontFamily: 'Fraunces, serif' }}>
        <div style={{ width: '100px', height: '100px', background: 'var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', color: 'var(--text-muted)' }}>
          <ShoppingBag size={48} />
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '16px', fontFamily: 'Fraunces, serif' }}>Basket is Empty</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 50px', lineHeight: 1.6 }}>Looks like you haven't added any handcrafted pickles to your cart yet. Explore our authentic collection!</p>
        <Link href="/products" style={{ background: 'var(--primary)', color: 'white', padding: '20px 40px', borderRadius: '20px', textDecoration: 'none', fontWeight: '800', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: 'var(--shadow)' }}>
          Shop Collection <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
          Your <span style={{ color: 'var(--primary)' }}>Basket</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Review your items and proceed to checkout.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'flex-start' }}>
        
        {/* Left: Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', gridColumn: 'span 2' }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: 'var(--surface)', borderRadius: '40px', padding: '25px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '24px', overflow: 'hidden', flexShrink: 0, border: '4px solid var(--border)' }}>
                <img src={item.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0', fontFamily: 'Fraunces, serif' }}>{item.name}</h3>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{item.selectedWeight || '250g'}</p>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>₹{item.price.toFixed(2)}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--background)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border)' }}>
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}><Minus size={16} /></button>
                  <span style={{ width: '30px', textAlign: 'center', fontWeight: '900' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}><Plus size={16} /></button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  style={{ width: '52px', height: '52px', background: 'var(--secondary)', color: 'var(--primary)', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <div style={{ background: 'var(--surface)', padding: '50px', borderRadius: '40px', color: 'var(--text-main)', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 40px 0', fontFamily: 'Fraunces, serif', color: 'var(--text-main)' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: '600' }}>
                <span>Subtotal</span>
                <span style={{ color: 'var(--text-main)' }}>₹{getTotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: '600' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>Calculated at checkout</span>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>Total</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary)' }}>₹{getTotal().toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" style={{ background: 'var(--primary)', color: 'white', padding: '22px', borderRadius: '24px', textDecoration: 'none', fontWeight: '900', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: 'var(--shadow)' }}>
              Checkout Now <ArrowRight size={24} />
            </Link>

            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                <ShieldCheck size={18} color="var(--primary)" /> 256-bit Secure Checkout
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
                <Truck size={18} color="var(--primary)" /> Freshly Packed in Godavari
              </div>
            </div>
          </div>
          
          <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem', justifyContent: 'center' }}>
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}

