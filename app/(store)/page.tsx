'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { ArrowRight, Star, Sparkles, Leaf, Truck } from 'lucide-react';
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
                <>Taste the <span style={{ color: '#ca8a04', fontStyle: 'italic' }}>Tradition</span> of India.</>
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

      {/* Dynamic Trust Section */}
      <section style={{ 
        background: 'linear-gradient(180deg, #1b3d18 0%, #0c1a0c 100%)', 
        color: 'white', 
        padding: '100px 20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Effects */}
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: '#ca8a04', filter: 'blur(150px)', opacity: 0.1, borderRadius: '50%', pointerEvents: 'none' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.25em', color: '#ca8a04', display: 'inline-block', marginBottom: '12px' }}>
              The Kanvi Promise
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '900', fontFamily: 'Fraunces, serif', marginBottom: '20px', color: 'white' }}>
              Why Choose Kanvi Pickles?
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', fontSize: '1.05rem', lineHeight: 1.6 }}>
              We bring the authentic, sun-dried, traditional taste of Andhra pickles right to your dining table, crafted with love and absolute purity.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '30px' 
          }}>
            <style>{`
              .trust-card {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 32px;
                padding: 40px 30px;
                text-align: center;
                transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(12px);
              }
              .trust-card:hover {
                transform: translateY(-8px);
                background: rgba(255, 255, 255, 0.05);
                border-color: rgba(202, 138, 4, 0.4);
                box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3);
              }
              .trust-icon-box {
                width: 72px;
                height: 72px;
                border-radius: 24px;
                background: rgba(202, 138, 4, 0.1);
                color: #ca8a04;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px auto;
                transition: all 0.4s;
              }
              .trust-card:hover .trust-icon-box {
                background: #ca8a04;
                color: #1e293b;
                transform: scale(1.1) rotate(5deg);
              }
            `}</style>

            {(settings?.trustFeatures && settings.trustFeatures.length > 0 ? settings.trustFeatures : [
              { icon: 'Sparkles', title: 'Traditional Recipes', description: 'Handed down through generations, cooked with authentic Godavari spices, sun-dried ingredients, and traditional cold-pressed oils.' },
              { icon: 'Leaf', title: '100% Natural & Pure', description: 'No chemical preservatives, zero artificial colors, and no MSG. We only pack pure, wholesome flavor inspired by nature.' },
              { icon: 'Truck', title: 'Express Fresh Delivery', description: 'Directly shipped from our kitchen in Visakhapatnam to your home. Double-sealed premium glass jars ensure freshness.' }
            ]).map((feature: any, idx: number) => {
              let IconComponent = Sparkles;
              if (feature.icon === 'Leaf') IconComponent = Leaf;
              else if (feature.icon === 'Truck') IconComponent = Truck;

              return (
                <div key={idx} className="trust-card">
                  <div className="trust-icon-box">
                    <IconComponent size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'Fraunces, serif', marginBottom: '12px', color: 'white' }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

