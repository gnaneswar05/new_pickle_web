'use client';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Search, Phone, User as UserIcon, Loader2, Package } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';
import { useSettingsStore } from '@/lib/settingsStore';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [topBannerText, setTopBannerText] = useState('Authentic Heritage • Global Shipping Available');
  const searchRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const { logoUrl, fetchSettings } = useSettingsStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    fetchSettings();
    // Fetch Settings for Banner Text
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.topBannerText) setTopBannerText(data.topBannerText);
      })
      .catch(err => console.error(err));

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(data.slice(0, 5));
          setShowResults(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const styles = {
    topBanner: { background: '#0f172a', color: 'white', padding: '0.8rem 0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' as const, letterSpacing: '0.15em', textAlign: 'center' as const },
    header: { position: 'sticky' as const, top: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.98)', backdropFilter: 'blur(15px)', borderBottom: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
    container: { maxWidth: '1250px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' },
    logoBox: { width: '55px', height: '55px', background: '#480D18', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '900' },
    searchForm: { flex: 1, maxWidth: '450px', position: 'relative' as const },
    searchInput: { width: '100%', background: '#f8fafc', border: '2px solid transparent', padding: '1rem 1rem 1rem 3.5rem', borderRadius: '16px', fontSize: '1rem', fontWeight: '600', outline: 'none', transition: 'all 0.2s', color: '#1e293b' },
    resultsDropdown: { position: 'absolute' as const, top: 'calc(100% + 15px)', left: 0, right: 0, background: 'white', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '1px solid #f1f5f9', overflow: 'hidden', zIndex: 1000 },
    nav: { display: 'flex', alignItems: 'center', gap: '2.5rem', fontSize: '1rem', fontWeight: '800', color: '#475569' },
    cartBtn: { position: 'relative' as const, width: '54px', height: '54px', background: '#fff1f2', color: '#480D18', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: '1px solid #ffe4e6' },
    badge: { position: 'absolute' as const, top: '-6px', right: '-6px', background: '#f43f5e', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', border: '3px solid white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fafbfc' }}>
      <style jsx>{`
        .nav-link { text-decoration: none; color: #475569; transition: all 0.2s; position: relative; padding: 0.5rem 0; }
        .nav-link:hover { color: #480D18 !important; }
        .nav-link::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 3px; background: #480D18; transition: width 0.3s; borderRadius: 3px; }
        .nav-link:hover::after { width: 100%; }
        .search-input:focus { border-color: #480D18 !important; background: white !important; box-shadow: 0 10px 15px -3px rgba(72, 13, 24, 0.1); }
        .result-item:hover { background: #f8fafc; }
      `}</style>

      {/* DYNAMIC TOP BANNER */}
      <div style={styles.topBanner}>
        {topBannerText}
      </div>

      <header style={styles.header}>
        <div style={{ ...styles.container, padding: '1.5rem 20px' }}>
          <Link href="/" style={styles.logo}>
            {logoUrl ? (
              <img src={logoUrl} alt="Kanvi Pickles" style={{ height: '85px', objectFit: 'contain' }} />
            ) : (
              <div style={styles.logoBox}>K</div>
            )}
            {!logoUrl && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1e293b', lineHeight: 1, fontFamily: 'Playfair Display, serif' }}>Kanvi</span>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#480D18', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>The Pickle Hub</span>
              </div>
            )}
          </Link>

          <nav className="hidden lg:flex" style={styles.nav}>
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/products" className="nav-link">Pickles</Link>
            <Link href="/categories" className="nav-link">Categories</Link>
            <Link href="/about" className="nav-link">Our Story</Link>
          </nav>

          <div style={styles.searchForm} ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <Search style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
              <input
                type="text"
                placeholder="Search premium pickles..."
                className="search-input"
                style={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              />
              {isSearching && (
                <Loader2 style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#480D18', animation: 'spin 1s linear infinite' }} size={20} />
              )}
            </form>

            {showResults && (
              <div style={styles.resultsDropdown}>
                {searchResults.length > 0 ? (
                  <div>
                    <div style={{ padding: '15px 20px', background: '#f8fafc', fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Top Results</div>
                    {searchResults.map((p) => (
                      <Link
                        key={p._id}
                        href={`/product/${p._id}`}
                        onClick={() => { setShowResults(false); setSearchQuery(''); }}
                        className="result-item"
                        style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 20px', textDecoration: 'none', transition: '0.2s', borderBottom: '1px solid #f1f5f9' }}
                      >
                        <div style={{ width: '50px', height: '50px', background: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                          <img src={p.image || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#480D18', fontWeight: '800' }}>₹{p.price}</div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href={`/products?search=${searchQuery}`}
                      onClick={() => setShowResults(false)}
                      style={{ display: 'block', padding: '15px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '800', color: '#480D18', textDecoration: 'none', background: '#f0fdf4' }}
                    >
                      View All Results
                    </Link>
                  </div>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', fontWeight: '600' }}>
                    No results for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          <nav className="hidden lg:flex" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {mounted && user ? (
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', background: '#f8fafc', padding: '0.7rem 1.4rem', borderRadius: '14px', border: '1px solid #e2e8f0', textDecoration: 'none', fontWeight: '800', fontSize: '0.85rem' }}>
                <UserIcon size={16} color="#480D18" />
                <span>Account</span>
              </Link>
            ) : (
              <Link href="/login" style={{ textDecoration: 'none', color: 'white', background: '#480D18', padding: '0.7rem 1.4rem', borderRadius: '14px', fontWeight: '800', fontSize: '0.85rem' }}>
                Sign In
              </Link>
            )}

            <Link href="/cart" style={styles.cartBtn}>
              <ShoppingCart size={22} />
              {mounted && itemCount > 0 && (
                <span style={styles.badge}>{itemCount}</span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {children}
      </main>

      <footer style={{ background: '#480D18', color: 'white', padding: '5rem 0 2rem 0', marginTop: 'auto' }}>
        <div style={{ ...styles.container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <div style={{ ...styles.logo, marginBottom: '1.5rem' }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Kanvi Pickles" style={{ height: '55px', objectFit: 'contain' }} />
              ) : (
                <div style={{ ...styles.logoBox, width: '35px', height: '35px', fontSize: '1.2rem', background: 'white', color: '#480D18' }}>K</div>
              )}
              {!logoUrl && (
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', fontFamily: 'Playfair Display, serif' }}>Kanvi Pickles</span>
              )}
            </div>
            <p style={{ color: '#f1f5f9', fontSize: '0.875rem', lineHeight: 1.6 }}>Bringing the authentic heritage of Godavari home. Handcrafted recipes passed down through generations.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.625rem', fontWeight: '800', color: '#fda4af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#e2e8f0' }}>
              <Link href="/orders" style={{ color: 'inherit', textDecoration: 'none' }}>Order Tracking</Link>
              <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Wallet Manage</Link>
              <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Edit Profile</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.625rem', fontWeight: '800', color: '#fda4af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#e2e8f0' }}>
              <Link href="/about" style={{ color: 'inherit', textDecoration: 'none' }}>Our Story</Link>
              <Link href="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link>
              <Link href="/legal/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.625rem', fontWeight: '800', color: '#fda4af', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>Policies</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: '#e2e8f0' }}>
              <Link href="/legal/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link href="/legal/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
              <Link href="/legal/refund" style={{ color: 'inherit', textDecoration: 'none' }}>Return & Refund</Link>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '2rem', fontSize: '0.625rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          © 2024 Kanvi Heritage India • All Rights Reserved.
        </div>
      </footer>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

