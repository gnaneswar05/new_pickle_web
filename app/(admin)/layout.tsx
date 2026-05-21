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
  MessageSquare,
  Sun,
  Moon
} from 'lucide-react';
import { useAdminStore } from '@/lib/adminStore';
import { useThemeStore } from '@/lib/themeStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAdmin, logoutAdmin } = useAdminStore();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    setMounted(true);
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setLogoUrl(data.defaultProductImage || '');
      })
      .catch(() => {});
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
          <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ height: '35px', width: '35px', objectFit: 'cover', borderRadius: '8px' }} />
            ) : (
              <div style={{ width: '35px', height: '35px', background: 'var(--primary)', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: '900' }}>K</div>
            )}
            <span>Kanvi Admin</span>
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
          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px', width: '100%', alignItems: 'center' }}>
            <button 
              onClick={() => { logoutAdmin(); router.push('/admin/login'); }}
              className="btn-logout"
              style={{ 
                flex: 1,
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                color: '#ef4444', 
                fontWeight: '700', 
                padding: '12px', 
                background: 'var(--secondary)', 
                border: 'none', 
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={18} /> Logout
            </button>
            {mounted && (
              <button 
                onClick={toggleTheme} 
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                style={{ 
                  width: '45px', 
                  height: '45px', 
                  background: 'var(--secondary)', 
                  color: 'var(--primary)', 
                  border: 'none', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer' 
                }}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
            )}
          </div>
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
