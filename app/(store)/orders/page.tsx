'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Calendar, Package, ChevronRight, ArrowLeft, Truck, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { OrderCardSkeleton } from '../components/Skeleton';

export default function CustomerOrders() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (!currentUser) {
          router.push('/login?redirect=/orders');
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mounted, router]);

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/orders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        });
    }
  }, [user]);

  if (!mounted) return null;
  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      {/* Back Button */}
      <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem', marginBottom: '40px' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div style={{ marginBottom: '60px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
          Your <span style={{ color: 'var(--primary)' }}>Orders</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Track your Godavari pickles.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        {loading ? (
          <>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </>
        ) : orders.length === 0 ? (
          <div style={{ background: 'var(--surface)', padding: '80px 40px', borderRadius: '40px', textAlign: 'center', border: '1px solid var(--border)' }}>
            <ShoppingBag size={50} color="var(--text-muted)" style={{ marginBottom: '20px' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px' }}>No orders yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>You haven't placed any orders yet. Ready to taste some pickles?</p>
            <Link href="/products" style={{ background: 'var(--primary)', color: 'white', padding: '16px 32px', borderRadius: '16px', textDecoration: 'none', fontWeight: '800' }}>Browse Store</Link>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order._id} style={{ background: 'var(--surface)', borderRadius: '40px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
              {/* Card Header */}
              <div style={{ padding: '30px 40px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', background: 'var(--secondary)' }}>
                <div style={{ display: 'flex', gap: '30px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order Placed</p>
                    <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</p>
                    <p style={{ margin: 0, fontWeight: '800', color: 'var(--primary)', fontSize: '0.9rem' }}>₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: order.status === 'Delivered' ? 'var(--primary)' : '#3b82f6', fontWeight: '900', fontSize: '0.85rem' }}>
                      {order.status === 'Delivered' ? <CheckCircle2 size={16} /> : <Truck size={16} />}
                      {order.status}
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Order ID</p>
                  <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>#{order._id.toUpperCase()}</p>
                </div>
              </div>

              {/* Items Section */}
              <div style={{ padding: '30px 40px' }}>
                {order.products.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: idx === order.products.length - 1 ? 0 : '20px', paddingBottom: idx === order.products.length - 1 ? 0 : '20px', borderBottom: idx === order.products.length - 1 ? 'none' : '1px solid var(--border)' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--secondary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                      <Package size={24} color="var(--text-muted)" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 4px 0', fontWeight: '800', color: 'var(--text-main)', fontSize: '1rem' }}>{item.name}</h4>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>Quantity: {item.quantity} • ₹{item.price}</p>
                    </div>
                    <Link href={`/track/${order._id}`} style={{ padding: '10px 20px', borderRadius: '12px', background: 'var(--secondary)', color: 'var(--text-main)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

