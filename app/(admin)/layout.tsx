'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  Users, 
  Wallet, 
  Grid, 
  Image as ImageIcon, 
  MapPin, 
  MessageSquare 
} from 'lucide-react';
import { useAdminStore } from '@/lib/adminStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAdmin, logoutAdmin } = useAdminStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAdmin && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [mounted, isAdmin, pathname, router]);

  if (!mounted) return null;
  if (!isAdmin && pathname !== '/admin/login') return null;

  return (
    <div className="admin-layout">
      {isAdmin && pathname !== '/admin/login' && (
        <aside className="admin-sidebar">
          <div className="sidebar-logo">
            Kanvi Admin
          </div>
          <nav className="sidebar-nav">
            <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>
            <Link href="/admin/products" className={pathname.includes('/admin/products') ? 'active' : ''}>
              <Package size={18} /> Products
            </Link>
            <Link href="/admin/customers" className={pathname.includes('/admin/customers') ? 'active' : ''}>
              <Users size={18} /> Customers
            </Link>
            <Link href="/admin/wallet" className={pathname.includes('/admin/wallet') ? 'active' : ''}>
              <Wallet size={18} /> Wallet Manager
            </Link>
            <Link href="/admin/categories" className={pathname.includes('/admin/categories') ? 'active' : ''}>
              <Grid size={18} /> Categories
            </Link>
            <Link href="/admin/slider" className={pathname.includes('/admin/slider') ? 'active' : ''}>
              <ImageIcon size={18} /> Slider
            </Link>
            <Link href="/admin/orders" className={pathname.includes('/admin/orders') ? 'active' : ''}>
              <ShoppingBag size={18} /> Orders
            </Link>
            <Link href="/admin/pincodes" className={pathname.includes('/admin/pincodes') ? 'active' : ''}>
              <MapPin size={18} /> Pincodes
            </Link>
            <Link href="/admin/inquiries" className={pathname.includes('/admin/inquiries') ? 'active' : ''}>
              <MessageSquare size={18} /> Inquiries
            </Link>
            <Link href="/admin/settings" className={pathname.includes('/admin/settings') ? 'active' : ''}>
              <Settings size={18} /> Settings
            </Link>
          </nav>
          <button 
            onClick={() => { logoutAdmin(); router.push('/admin/login'); }}
            className="btn-logout"
            style={{ 
              marginTop: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              color: '#ef4444', 
              fontWeight: '700', 
              padding: '12px', 
              width: '100%', 
              background: '#fef2f2', 
              border: 'none', 
              borderRadius: '12px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </aside>
      )}
      <main className="admin-content" style={{ marginLeft: isAdmin && pathname !== '/admin/login' ? '260px' : '0' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
