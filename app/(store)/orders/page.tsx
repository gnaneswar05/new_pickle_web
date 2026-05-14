'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Calendar, Package, ChevronRight, ArrowLeft, Truck, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function CustomerOrders() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetch(`/api/orders?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      });
  }, [user, router]);

  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Inter, sans-serif' }}>
      {/* Back Button */}
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', marginBottom: '40px' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
          Your <span style={{ color: '#059669' }}>Orders</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Track your Godavari pickle heritage.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px' }}>
            <p style={{ color: '#94a3b8', fontWeight: '600' }}>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ background: 'white', padding: '80px 40px', borderRadius: '40px', textAlign: 'center', border: '1px solid #f1f5f9' }}>
            <ShoppingBag size={50} color="#cbd5e1" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>No orders yet</h3>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>You haven't placed any orders yet. Ready to taste some pickles?</p>
            <Link href="/products" style={{ background: '#059669', color: 'white', padding: '16px 32px', borderRadius: '16px', textDecoration: 'none', fontWeight: '800' }}>Browse Store</Link>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order._id} style={{ background: 'white', borderRadius: '40px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
              {/* Card Header */}
              <div style={{ padding: '30px 40px', borderBottom: '1px solid #f8fafc', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', background: '#f8fafc' }}>
                <div style={{ display: 'flex', gap: '30px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Order Placed</p>
                    <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Total Amount</p>
                    <p style={{ margin: 0, fontWeight: '800', color: '#059669', fontSize: '0.9rem' }}>₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Status</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: order.status === 'Delivered' ? '#059669' : '#2563eb', fontWeight: '900', fontSize: '0.85rem' }}>
                      {order.status === 'Delivered' ? <CheckCircle2 size={16} /> : <Truck size={16} />}
                      {order.status}
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>Order ID</p>
                  <p style={{ margin: 0, fontWeight: '700', color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>#{order._id.toUpperCase()}</p>
                </div>
              </div>

              {/* Items Section */}
              <div style={{ padding: '30px 40px' }}>
                {order.products.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: idx === order.products.length - 1 ? 0 : '20px', paddingBottom: idx === order.products.length - 1 ? 0 : '20px', borderBottom: idx === order.products.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <div style={{ width: '60px', height: '60px', background: '#f8fafc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                      <Package size={24} color="#94a3b8" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', color: '#1e293b', fontSize: '1rem' }}>{item.name}</h4>
                      <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>Quantity: {item.quantity} • ₹{item.price}</p>
                    </div>
                    <Link href={`/track/${order._id}`} style={{ padding: '10px 20px', borderRadius: '12px', background: '#f1f5f9', color: '#1e293b', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      Track <ChevronRight size={14} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
