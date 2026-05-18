'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Users, TrendingUp, Download, Package, ArrowUpRight, Clock, Star, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, customers: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    Promise.all([
      fetch('/api/products').then(res => res.json()),
      fetch('/api/orders').then(res => res.json())
    ]).then(([productsData, ordersData]) => {
      const revenue = (ordersData || []).reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
      setStats({
        products: (productsData || []).length,
        orders: (ordersData || []).length,
        revenue,
        customers: 124 // Mocked for now
      });
    }).catch(err => console.error("Dashboard fetch error:", err));
  }, []);

  if (!mounted) return null;

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Inter, sans-serif' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '60px' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Playfair Display, serif', lineHeight: 1.1 }}>
            Business <span style={{ color: '#480D18' }}>Overview</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button style={{ background: '#0f172a', color: 'white', padding: '14px 28px', borderRadius: '18px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}>
          <Download size={20} /> Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '50px' }}>
        
        {/* Revenue Card */}
        <div style={{ background: 'white', padding: '35px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ width: '56px', height: '56px', background: '#ecfdf5', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#480D18' }}>
              <TrendingUp size={28} />
            </div>
            <div style={{ background: '#ecfdf5', color: '#480D18', height: 'fit-content', padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '900' }}>+12.5%</div>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total Revenue</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', margin: '8px 0' }}>₹{stats.revenue.toLocaleString()}</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Updated just now</p>
        </div>

        {/* Orders Card */}
        <div style={{ background: 'white', padding: '35px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <ShoppingCart size={28} />
            </div>
            <div style={{ background: '#eff6ff', color: '#2563eb', height: 'fit-content', padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '900' }}>+8.2%</div>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Orders</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', margin: '8px 0' }}>{stats.orders}</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>5 orders pending</p>
        </div>

        {/* Customers Card */}
        <div style={{ background: 'white', padding: '35px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ width: '56px', height: '56px', background: '#faf5ff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
              <Users size={28} />
            </div>
            <div style={{ background: '#faf5ff', color: '#9333ea', height: 'fit-content', padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '900' }}>+4%</div>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loyal Customers</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', margin: '8px 0' }}>{stats.customers}</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>12 new this week</p>
        </div>

        {/* Products Card */}
        <div style={{ background: 'white', padding: '35px', borderRadius: '40px', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ width: '56px', height: '56px', background: '#fff7ed', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Package size={28} />
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Inventory Items</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', margin: '8px 0' }}>{stats.products}</h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Live on storefront</p>
        </div>
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
        
        {/* Recent Activity */}
        <div style={{ background: 'white', padding: '40px', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Recent Activity</h3>
            <Link href="/admin/orders" style={{ fontSize: '0.85rem', fontWeight: '800', color: '#480D18', textDecoration: 'none' }}>View All</Link>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '52px', height: '52px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📦</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: '800', color: '#1e293b' }}>New Order #PKL-10{88+i}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Just now • Processing</p>
                </div>
                <p style={{ margin: 0, fontWeight: '900', color: '#1e293b' }}>₹{450 + i * 120}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Store Health */}
        <div style={{ background: 'white', padding: '40px', borderRadius: '40px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '35px' }}>Store Performance</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Orders Fulfilled</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#1e293b' }}>92%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: '#480D18', borderRadius: '99px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Customer Retention</span>
                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#1e293b' }}>85%</span>
              </div>
              <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: '#2563eb', borderRadius: '99px' }}></div>
              </div>
            </div>

            <div style={{ marginTop: '10px', background: '#f8fafc', padding: '20px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#480D18' }}>
                <ShieldCheck size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: '700', color: '#64748b' }}>Store systems are running at <span style={{ color: '#480D18', fontWeight: '900' }}>100% capacity</span>.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

