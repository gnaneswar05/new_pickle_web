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

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 40px', color: '#cbd5e1' }}>
          <ShoppingBag size={48} />
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '16px', fontFamily: 'Playfair Display, serif' }}>Basket is Empty</h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 50px', lineHeight: 1.6 }}>Looks like you haven't added any handcrafted pickles to your cart yet. Explore our authentic collection!</p>
        <Link href="/products" style={{ background: '#480D18', color: 'white', padding: '20px 40px', borderRadius: '20px', textDecoration: 'none', fontWeight: '800', fontSize: '1.1rem', display: 'inline-flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(72, 13, 24, 0.2)' }}>
          Shop Collection <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
          Your <span style={{ color: '#480D18' }}>Basket</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Review your items and proceed to checkout.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '50px', alignItems: 'flex-start' }}>
        
        {/* Left: Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', gridColumn: 'span 2' }}>
          {items.map((item) => (
            <div key={item.id} style={{ background: 'white', borderRadius: '40px', padding: '25px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '30px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '24px', overflow: 'hidden', flexShrink: 0, border: '4px solid #f8fafc' }}>
                <img src={item.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: '0 0 4px 0', fontFamily: 'Playfair Display, serif' }}>{item.name}</h3>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>{item.selectedWeight || '250g'}</p>
                <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#480D18' }}>₹{item.price.toFixed(2)}</div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '4px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Minus size={16} /></button>
                  <span style={{ width: '30px', textAlign: 'center', fontWeight: '900' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '40px', height: '40px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Plus size={16} /></button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.id)}
                  style={{ width: '52px', height: '52px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Order Summary */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <div style={{ background: '#0f172a', padding: '50px', borderRadius: '40px', color: 'white', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', margin: '0 0 40px 0', fontFamily: 'Playfair Display, serif' }}>Order Summary</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: '600' }}>
                <span>Subtotal</span>
                <span style={{ color: 'white' }}>₹{getTotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontWeight: '600' }}>
                <span>Shipping</span>
                <span style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase' }}>Calculated at checkout</span>
              </div>
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800' }}>Total</span>
                <span style={{ fontSize: '2.5rem', fontWeight: '900', color: '#34d399' }}>₹{getTotal().toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout" style={{ background: '#480D18', color: 'white', padding: '22px', borderRadius: '24px', textDecoration: 'none', fontWeight: '900', fontSize: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 20px 25px -5px rgba(72, 13, 24, 0.2)' }}>
              Checkout Now <ArrowRight size={24} />
            </Link>

            <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>
                <ShieldCheck size={18} color="#34d399" /> 256-bit Secure Checkout
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>
                <Truck size={18} color="#34d399" /> Freshly Packed in Godavari
              </div>
            </div>
          </div>
          
          <Link href="/products" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '30px', color: '#64748b', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem', justifyContent: 'center' }}>
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}

