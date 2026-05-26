'use client';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Search, Phone, User as UserIcon, Loader2, Package, Heart, Sun, Moon } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlistStore';
import { useAuthStore } from '@/lib/authStore';
import { useSettingsStore } from '@/lib/settingsStore';
import { useThemeStore } from '@/lib/themeStore';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [topBannerText, setTopBannerText] = useState('Authentic Godavari • Global Shipping Available');
  const [settings, setSettings] = useState<any>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { logoUrl, fetchSettings } = useSettingsStore();
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    setMounted(true);
    fetchSettings();
    // Fetch Settings for Banner Text
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
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
    topBanner: { background: 'var(--text-main)', color: 'var(--background)', padding: '0.8rem 0', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' as const, letterSpacing: '0.15em', fontFamily: 'Fraunces, serif', overflow: 'hidden', whiteSpace: 'nowrap' as const, position: 'relative' as const, width: '100%', textAlign: 'center' as const, display: 'flex', justifyContent: 'center', alignItems: 'center' },
    header: { position: 'sticky' as const, top: 0, zIndex: 100, background: 'var(--surface)', borderBottom: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' },
    container: { maxWidth: '1250px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' },
    logo: { display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' },
    logoBox: { width: '55px', height: '55px', background: 'var(--primary)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: '900' },
    nav: { alignItems: 'center', gap: '2rem', fontSize: '1rem', fontWeight: '850', color: 'var(--text-muted)', fontFamily: 'Fraunces, serif' },
    actionBtn: { position: 'relative' as const, width: '54px', height: '54px', background: 'var(--secondary)', color: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: '1px solid var(--border)', cursor: 'pointer' },
    searchInput: { width: '100%', background: 'var(--border)', border: '2px solid transparent', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '16px', fontSize: '0.9rem', fontWeight: '600', outline: 'none', transition: 'all 0.2s', color: 'var(--text-main)', fontFamily: 'Fraunces, serif' },
    badge: { position: 'absolute' as const, top: '-6px', right: '-6px', background: 'var(--primary)', color: 'white', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '900', border: '3px solid var(--surface)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)' }}>
      <style>{`
        .nav-link { text-decoration: none; color: var(--text-muted); transition: all 0.2s; position: relative; padding: 0.5rem 0; font-family: Fraunces, serif; }
        .nav-link:hover, .nav-link.active { color: var(--primary) !important; }
        .nav-link::after { content: ''; position: absolute; bottom: 0; left: 0; width: 0; height: 3px; background: var(--primary); transition: width 0.3s; border-radius: 3px; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .search-input:focus { border-color: var(--primary) !important; background: var(--surface) !important; box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.1); }
        .result-item:hover { background: var(--border); }
        .marquee-container {
          display: block;
          overflow-x: auto;
          white-space: nowrap;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .marquee-container::-webkit-scrollbar {
          display: none;
        }
        .marquee-text {
          display: inline-block;
          animation: marquee-scroll 25s linear infinite;
          padding-left: 100%;
        }
        @keyframes marquee-scroll {
          0% { transform: translate3d(0%, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
      `}</style>

      {/* DYNAMIC TOP BANNER */}
      <div style={styles.topBanner}>
        <span>
          {topBannerText}
        </span>
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
                <span style={{ fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-main)', lineHeight: 1, fontFamily: 'Fraunces, serif' }}>Kanvi</span>
                <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '4px' }}>The Pickle Hub</span>
              </div>
            )}
          </Link>

          <nav className="hidden lg:flex" style={styles.nav}>
            <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link href="/products" className={`nav-link ${pathname === '/products' || pathname?.startsWith('/product/') ? 'active' : ''}`}>Pickles</Link>
            <Link href="/categories" className={`nav-link ${pathname === '/categories' ? 'active' : ''}`}>Categories</Link>
            <Link href="/about" className={`nav-link ${pathname === '/about' ? 'active' : ''}`}>Our Story</Link>
            <Link href="/contact" className={`nav-link ${pathname === '/contact' ? 'active' : ''}`}>Contact Us</Link>
          </nav>

          <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '1.25rem' }}>
            {/* Search Trigger */}
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={styles.actionBtn} title="Search Pickles">
              <Search size={22} />
            </button>

            {mounted && (
              <button onClick={toggleTheme} style={styles.actionBtn} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
              </button>
            )}

            {mounted && user ? (
              <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', background: 'var(--surface)', padding: '0.7rem 1.4rem', borderRadius: '14px', border: '1px solid var(--border)', textDecoration: 'none', fontWeight: '800', fontSize: '0.85rem', fontFamily: 'Fraunces, serif' }}>
                <UserIcon size={16} color="var(--primary)" />
                <span>Account</span>
              </Link>
            ) : (
              <Link href="/login" style={{ textDecoration: 'none', color: 'white', background: 'var(--primary)', padding: '0.7rem 1.4rem', borderRadius: '14px', fontWeight: '800', fontSize: '0.85rem', fontFamily: 'Fraunces, serif' }}>
                Sign In
              </Link>
            )}

            <Link href="/wishlist" style={styles.actionBtn}>
              <Heart size={22} />
              {mounted && wishlistCount > 0 && (
                <span style={styles.badge}>{wishlistCount}</span>
              )}
            </Link>

            <Link href="/cart" style={styles.actionBtn}>
              <ShoppingCart size={22} />
              {mounted && itemCount > 0 && (
                <span style={styles.badge}>{itemCount}</span>
              )}
            </Link>
          </nav>

          {/* Mobile Right Nav */}
          <div className="flex lg:!hidden" style={{ alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} style={styles.actionBtn} title="Search Pickles">
              <Search size={22} />
            </button>

            {mounted && (
              <button onClick={toggleTheme} style={styles.actionBtn} title="Toggle Theme">
                {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
              </button>
            )}

            <Link href="/wishlist" style={styles.actionBtn}>
              <Heart size={22} />
              {mounted && wishlistCount > 0 && (
                <span style={styles.badge}>{wishlistCount}</span>
              )}
            </Link>

            <Link href="/cart" style={styles.actionBtn}>
              <ShoppingCart size={22} />
              {mounted && itemCount > 0 && (
                <span style={styles.badge}>{itemCount}</span>
              )}
            </Link>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              style={{ 
                width: '54px', height: '54px', background: 'var(--surface)', color: 'var(--text-main)', 
                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                border: '1px solid var(--border)', cursor: 'pointer' 
              }}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Sliding Search Drawer Panel */}
        <div style={{
          maxHeight: isSearchOpen ? '600px' : '0px',
          opacity: isSearchOpen ? 1 : 0,
          transform: isSearchOpen ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
          background: 'var(--surface)',
          borderBottom: isSearchOpen ? '1px solid var(--border)' : 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          position: 'relative',
          zIndex: 99
        }} ref={searchRef}>
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '30px 20px 40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Search Our Kitchen</span>
              <button 
                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={24} />
              <input
                type="text"
                placeholder="What are you craving today? (e.g. Mango, Gongura, Garlic...)"
                style={{
                  width: '100%',
                  background: 'var(--background)',
                  border: '2px solid var(--border)',
                  padding: '1.25rem 1.5rem 1.25rem 4rem',
                  borderRadius: '20px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  outline: 'none',
                  transition: 'all 0.2s',
                  color: 'var(--text-main)',
                  fontFamily: 'Fraunces, serif'
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
              />
              {isSearching && (
                <Loader2 style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', animation: 'spin 1s linear infinite' }} size={22} />
              )}
            </form>

            {/* Results in Drawer */}
            {showResults && searchQuery.length >= 2 && (
              <div style={{ marginTop: '25px', background: 'var(--background)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {searchResults.length > 0 ? (
                  <div>
                    <div style={{ padding: '15px 20px', background: 'var(--border)', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Top Matches</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', padding: '20px' }}>
                      {searchResults.map((p) => (
                        <Link
                          key={p._id}
                          href={`/product/${p._id}`}
                          onClick={() => { setShowResults(false); setIsSearchOpen(false); setSearchQuery(''); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', textDecoration: 'none', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)', transition: 'all 0.2s' }}
                          className="result-item"
                        >
                          <div style={{ width: '48px', height: '48px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={p.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000'} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: '750', color: 'var(--text-main)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800' }}>₹{p.price}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/products?search=${searchQuery}`}
                      onClick={() => { setShowResults(false); setIsSearchOpen(false); }}
                      style={{ display: 'block', padding: '15px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '800', color: 'var(--primary)', textDecoration: 'none', background: 'var(--secondary)', borderTop: '1px solid var(--border)' }}
                    >
                      View All Search Results →
                    </Link>
                  </div>
                ) : (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600' }}>
                    No premium pickles found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>
        {children}
      </main>

      <footer className="store-footer" style={{ padding: '5rem 0 2rem 0', marginTop: 'auto' }}>
        <div style={{ ...styles.container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
          <div>
            <div style={{ ...styles.logo, marginBottom: '1.5rem' }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Kanvi Pickles" style={{ height: '55px', objectFit: 'contain' }} />
              ) : (
                <div style={{ ...styles.logoBox, width: '35px', height: '35px', fontSize: '1.2rem', background: 'var(--background)', color: 'var(--primary)' }}>K</div>
              )}
              {!logoUrl && (
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'inherit', fontFamily: 'Fraunces, serif' }}>Kanvi Pickles</span>
              )}
            </div>
            <p style={{ color: 'inherit', opacity: 0.8, fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>Bringing the authentic taste of Godavari home. Handcrafted recipes passed down through generations.</p>
            
            {/* Social Media Links */}
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {(settings?.instagramUrl || 'https://instagram.com/kanvipickles') && (
                <a 
                  href={settings?.instagramUrl || 'https://instagram.com/kanvipickles'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', transition: 'all 0.2s' 
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9s-58-34.5-93.9-36.2c-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.8 9.9 67.6 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2s34.5-58 36.2-93.9c2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
                  </svg>
                </a>
              )}
              {(settings?.whatsappUrl || 'https://wa.me/918247812474') && (
                <a 
                  href={settings?.whatsappUrl || 'https://wa.me/918247812474'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ 
                    width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'inherit', transition: 'all 0.2s' 
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'inherit', opacity: 0.9 }}>
              <Link href="/orders" style={{ color: 'inherit', textDecoration: 'none' }}>Order Tracking</Link>
              <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Wallet Manage</Link>
              <Link href="/dashboard" style={{ color: 'inherit', textDecoration: 'none' }}>Edit Profile</Link>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>Contact Details</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'inherit', opacity: 0.9 }}>
              <a href={`tel:${(settings?.contactPhone || '+91 8247812474').replace(/\s+/g, '')}`} style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                📞 {settings?.contactPhone || '+91 8247812474'}
              </a>
              <a href={`mailto:${settings?.contactEmail || 'support@kanvipickles.com'}`} style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'inherit', textDecoration: 'none' }}>
                ✉️ {settings?.contactEmail || 'support@kanvipickles.com'}
              </a>
              <span style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: 1.4 }}>📍 {settings?.contactAddress || 'Dabagardense, visakhapatnam, Andhra Pradesh'}</span>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.625rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem' }}>Policies</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', color: 'inherit', opacity: 0.9 }}>
              <Link href="/legal/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link href="/legal/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</Link>
              <Link href="/legal/refund" style={{ color: 'inherit', textDecoration: 'none' }}>Return & Refund</Link>
              <Link href="/legal/cancellation" style={{ color: 'inherit', textDecoration: 'none' }}>Cancellation Policy</Link>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: '700', color: 'inherit', opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            © 2026 Kanvi India • All Rights Reserved.
          </div>
          {(settings?.fssaiNumber || '23324010000854') && (
            <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--border)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border)' }}>
              <span>🍃 FSSAI License No: {settings?.fssaiNumber || '23324010000854'}</span>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div 
          onClick={() => setIsMenuOpen(false)}
          style={{ 
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.4)', 
            backdropFilter: 'blur(8px)', zIndex: 999 
          }}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div 
        style={{ 
          position: 'fixed', top: 0, right: 0, bottom: 0, width: '300px', 
          background: 'var(--surface)', zIndex: 1000, boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', 
          transform: isMenuOpen ? 'translateX(0)' : 'translateX(100%)', 
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column', padding: '40px 30px', gap: '30px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', fontFamily: 'Fraunces, serif' }}>Menu</span>
          <button 
            onClick={() => setIsMenuOpen(false)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar in Mobile Menu */}
        <div style={{ position: 'relative' }}>
          <form onSubmit={handleSearchSubmit}>
            <Search style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input
              type="text"
              placeholder="Search pickles..."
              className="search-input"
              style={{ ...styles.searchInput, padding: '0.8rem 1rem 0.8rem 2.5rem', fontSize: '0.9rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Link href="/" onClick={() => setIsMenuOpen(false)} className={`nav-link ${pathname === '/' ? 'active' : ''}`} style={{ fontSize: '1.2rem', fontWeight: '800' }}>Home</Link>
          <Link href="/products" onClick={() => setIsMenuOpen(false)} className={`nav-link ${pathname === '/products' || pathname?.startsWith('/product/') ? 'active' : ''}`} style={{ fontSize: '1.2rem', fontWeight: '800' }}>Pickles</Link>
          <Link href="/categories" onClick={() => setIsMenuOpen(false)} className={`nav-link ${pathname === '/categories' ? 'active' : ''}`} style={{ fontSize: '1.2rem', fontWeight: '800' }}>Categories</Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className={`nav-link ${pathname === '/about' ? 'active' : ''}`} style={{ fontSize: '1.2rem', fontWeight: '800' }}>Our Story</Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)} className={`nav-link ${pathname === '/contact' ? 'active' : ''}`} style={{ fontSize: '1.2rem', fontWeight: '800' }}>Contact Us</Link>
        </nav>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {mounted && user ? (
            <Link 
              href="/dashboard" 
              onClick={() => setIsMenuOpen(false)} 
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', 
                color: 'var(--text-main)', background: 'var(--surface)', padding: '16px', borderRadius: '16px', 
                border: '1px solid var(--border)', textDecoration: 'none', fontWeight: '800', fontFamily: 'Fraunces, serif' 
              }}
            >
              <UserIcon size={18} color="var(--primary)" />
              <span>My Account</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setIsMenuOpen(false)} 
              style={{ 
                textDecoration: 'none', color: 'white', background: 'var(--primary)', padding: '16px', 
                borderRadius: '16px', fontWeight: '800', textAlign: 'center', fontFamily: 'Fraunces, serif',
                display: 'block'
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

