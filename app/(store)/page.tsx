'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { ArrowRight, Star } from 'lucide-react';
import ProductCard from './components/ProductCard';

export default function Home() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch('/api/sliders').then(res => res.json()).then(setSliders);
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data));
    fetch('/api/products').then(res => res.json()).then(data => {
      setTopSelling(data.filter((p: any) => p.isTopSelling).slice(0, 4));
    });
  }, []);

  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % sliders.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sliders]);

  const activeSlide = sliders.length > 0 ? sliders[currentSlideIndex] : null;

  return (
    <div>
      {/* Dynamic Unique Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 20px', background: '#0f172a', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <style>{`
          .hero-btn:hover { transform: translateY(-5px); box-shadow: 0 25px 30px -5px rgba(45, 90, 39, 0.5) !important; }
          .hero-btn-alt:hover { background: rgba(255,255,255,0.2) !important; }
          .hero-img { transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
          .hero-img:hover { transform: scale(1.02) rotate(0deg) !important; }
          .fade-transition { transition: opacity 0.5s ease-in-out; }
        `}</style>
        
        {/* Glowing Orbs */}
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '600px', height: '600px', background: '#2d5a27', filter: 'blur(150px)', opacity: 0.35, borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', background: '#b91c1c', filter: 'blur(150px)', opacity: 0.15, borderRadius: '50%' }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 500px' }} className="fade-transition" key={activeSlide?._id || 'default'}>
            <div style={{ display: 'inline-block', padding: '10px 20px', background: 'rgba(45, 90, 39, 0.15)', color: '#ca8a04', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '30px', border: '1px solid rgba(45, 90, 39, 0.5)' }}>
              {activeSlide?.subtitle || '100% Authentic Godavari Recipe'}
            </div>
            <h1 style={{ fontSize: 'clamp(3.5rem, 6vw, 5.5rem)', fontWeight: '900', color: 'white', lineHeight: 1.1, fontFamily: 'Fraunces, serif', marginBottom: '30px' }}>
              {activeSlide?.title ? (
                <>
                  {activeSlide.title.split(' ').slice(0, -1).join(' ')}{' '}
                  <span style={{ color: '#ca8a04', fontStyle: 'italic' }}>{activeSlide.title.split(' ').slice(-1)}</span>
                </>
              ) : (
                <>Taste the <span style={{ color: '#ca8a04', fontStyle: 'italic' }}>Our Story</span> of India.</>
              )}
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '50px', maxWidth: '600px', fontWeight: '500' }}>
              Handcrafted with premium ingredients and time-honored traditions. Experience the burst of authentic, bold flavors in every single bite.
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <Link href={activeSlide?.link || "/products"} className="hero-btn" style={{ background: '#2d5a27', color: 'white', padding: '22px 45px', borderRadius: '30px', textDecoration: 'none', fontWeight: '900', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 20px 25px -5px rgba(45, 90, 39, 0.3)', transition: 'all 0.3s' }}>
                Shop Collection <ArrowRight size={20} />
              </Link>
              <Link href="/about" className="hero-btn-alt" style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '22px 45px', borderRadius: '30px', textDecoration: 'none', fontWeight: '800', fontSize: '1.1rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s' }}>
                Our Story
              </Link>
            </div>
          </div>
          
          <div style={{ flex: '1 1 500px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div className="hero-img fade-transition" key={activeSlide?.image || 'img'} style={{ position: 'relative', width: '100%', maxWidth: '450px', aspectRatio: '4/5', borderRadius: '48px', overflow: 'hidden', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8)', transform: 'rotate(2deg)' }}>
              <img src={activeSlide?.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'} alt="Kanvi Premium Pickles" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0f172a, transparent 70%)' }}></div>
              <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', padding: '20px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '50px', height: '50px', background: '#2d5a27', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div>
                    <div style={{ color: 'white', fontWeight: '900', fontSize: '1.1rem' }}>Premium Quality</div>
                    <div style={{ color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '600' }}>Loved by 10,000+ families</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Slider Dots */}
            {sliders.length > 1 && (
              <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {sliders.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlideIndex(idx)}
                    style={{ 
                      width: '12px', height: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                      background: currentSlideIndex === idx ? '#ca8a04' : 'rgba(255,255,255,0.2)',
                      transform: currentSlideIndex === idx ? 'scale(1.3)' : 'scale(1)'
                    }} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Categories */}
      <section className="container" style={{ padding: '6rem 20px' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', marginBottom: '4rem', fontFamily: 'Fraunces, serif', textAlign: 'center' }}>
          Shop by <span style={{ color: '#2d5a27' }}>Category</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '40px', justifyItems: 'center' }}>
          {categories.map((cat: any) => (
            <Link 
              href={`/products?category=${cat.name}`} 
              key={cat._id} 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}
            >
              <div style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '6px solid white',
                boxShadow: '0 20px 25px -5px rgba(45, 90, 39, 0.15)',
                marginBottom: '20px',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05) translateY(-5px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 25px 30px -5px rgba(45, 90, 39, 0.3)';
                (e.currentTarget as HTMLElement).style.borderColor = '#2d5a27';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1) translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 25px -5px rgba(45, 90, 39, 0.15)';
                (e.currentTarget as HTMLElement).style.borderColor = 'white';
              }}
              >
                <img 
                  src={cat.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'} 
                  alt={cat.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', margin: 0, fontFamily: 'Fraunces, serif', textAlign: 'center' }}>{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Selling Section */}
      <section style={{ background: 'var(--secondary)', padding: '6rem 20px' }}>
        <div className="container">
          <h2 className="text-4xl text-center" style={{ marginBottom: '4rem' }}>Our Top Selling Delicacies</h2>
          <div className="grid grid-cols-4 gap-8">
            {topSelling.map((p: any) => (
              <ProductCard key={p._id} p={p} defaultImage={settings?.defaultProductImage} />
            ))}
          </div>
          <div className="flex justify-center" style={{ marginTop: '4rem' }}>
            <Link href="/products" className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>View All Products</Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ background: 'var(--primary)', color: 'white', padding: '6rem 20px' }}>
        <div className="container grid grid-cols-3 gap-12 text-center">
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🏺</div>
            <h3 className="text-2xl mb-4">Traditional Recipes</h3>
          </div>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🌿</div>
            <h3 className="text-2xl mb-4">100% Natural</h3>
          </div>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🚀</div>
            <h3 className="text-2xl mb-4">Express Delivery</h3>
          </div>
        </div>
      </section>
    </div>
  );
}

