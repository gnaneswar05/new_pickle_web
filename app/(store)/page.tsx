'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  Star,
  Sparkles,
  Leaf,
  Truck,
  Flame,
  ChevronLeft,
  ChevronRight,
  Quote,
  Award,
  Compass,
  Heart,
  Droplet,
  Plus,
  Trash2,
  Check
} from 'lucide-react';
import ProductCard from './components/ProductCard';
import ScrollReveal from './components/ScrollReveal';
import { HeroSkeleton, CategoryItemSkeleton, ProductCardSkeleton } from './components/Skeleton';

export default function Home() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [topSelling, setTopSelling] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Flavor Finder Filter States
  const [selectedSpice, setSelectedSpice] = useState('All');
  const [selectedIngredient, setSelectedIngredient] = useState('All');

  // Selected Gourmet Bundle Items
  const [selectedBundleItems, setSelectedBundleItems] = useState<any[]>([]);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/sliders').then(res => res.json()).then(setSliders).catch(err => console.error(err)),
      fetch('/api/categories').then(res => res.json()).then(setCategories).catch(err => console.error(err)),
      fetch('/api/settings').then(res => res.json()).then(data => setSettings(data)).catch(err => console.error(err)),
      fetch('/api/products').then(res => res.json()).then(data => {
        setAllProducts(data || []);
        setTopSelling((data || []).filter((p: any) => p.isTopSelling).slice(0, 4));
      }).catch(err => console.error(err))
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  // Hero Slider Autoplay
  useEffect(() => {
    if (sliders.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % sliders.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sliders]);

  // Testimonials Autoplay
  const testimonials = settings?.testimonials || [];
  useEffect(() => {
    if (testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [testimonials]);

  const activeSlide = sliders.length > 0 ? sliders[currentSlideIndex] : null;

  // Dynamic Content Declarations
  const middleTickerTexts = settings?.middleBannerText
    ? settings.middleBannerText.split('•').map((t: string) => t.trim())
    : [
      '100% Sun-Dried Godavari Recipes',
      'No Chemical Preservatives',
      'Cured in Cold-Pressed Oils',
      'Free Shipping Above ₹999'
    ];

  const craftSteps = settings?.craftSteps && settings.craftSteps.length > 0
    ? settings.craftSteps
    : [
      { stepNumber: 1, title: 'Godavari Sourcing', description: 'We source fresh green mangoes, aromatic ginger, plump garlic, and local red chillies directly from Godavari farmers at their peak harvest.' },
      { stepNumber: 2, title: 'Sun-Dried Curing', description: 'Sliced ingredients are dried under natural sunlight to remove excess moisture and preserve their structural goodness and natural tang.' },
      { stepNumber: 3, title: 'Cold-Pressed Oils', description: 'We cure our pickles in high-quality cold-pressed mustard oil and sesame oil, ensuring they stay preserved naturally and taste richly aromatic.' },
      { stepNumber: 4, title: 'Hand-Spiced & Sealed', description: 'Each batch is hand-mixed with ancestral spice ratios and sealed in premium glass jars to protect the home-made aroma and taste.' }
    ];

  // Interactive Gourmet Bundle Selector
  const toggleBundleItem = (product: any) => {
    const isSelected = selectedBundleItems.some(item => item._id === product._id);
    const maxQty = settings?.bundleQuantity || 3;

    if (isSelected) {
      setSelectedBundleItems(selectedBundleItems.filter(item => item._id !== product._id));
    } else {
      if (selectedBundleItems.length >= maxQty) {
        toast.error(`You can only select up to ${maxQty} pickles for this box!`);
        return;
      }
      setSelectedBundleItems([...selectedBundleItems, product]);
    }
  };

  const handleAddBundleToCart = () => {
    const maxQty = settings?.bundleQuantity || 3;
    if (selectedBundleItems.length < maxQty) {
      toast.error(`Please select exactly ${maxQty} pickles to build your box!`);
      return;
    }

    const bundleItemsNames = selectedBundleItems.map(item => item.name).join(', ');
    const bundleIdsStr = selectedBundleItems.map(item => item._id).join('-');

    addItem({
      id: `bundle-${bundleIdsStr}`,
      name: `${settings?.bundleTitle || 'Gourmet Sample Box'} (${bundleItemsNames})`,
      price: settings?.bundlePrice || 499,
      image: selectedBundleItems[0]?.image || settings?.defaultProductImage || '',
      selectedWeight: `${maxQty} Jars`
    });

    toast.success('Custom Gourmet Box added to cart!');
    setSelectedBundleItems([]);
  };

  // Real-Time Spice Finder Logic
  const filteredPickles = allProducts.filter((p: any) => {
    let matchesSpice = true;
    const nameLower = p.name.toLowerCase();
    const descLower = p.description.toLowerCase();

    if (selectedSpice === 'Fiery Hot') {
      matchesSpice = p.spiceLevel ? (p.spiceLevel === 'Hot') : (nameLower.includes('avakaya') || nameLower.includes('chilli') || nameLower.includes('spicy') || nameLower.includes('gongura') || descLower.includes('hot') || descLower.includes('fiery'));
    } else if (selectedSpice === 'Medium & Tangy') {
      matchesSpice = p.spiceLevel ? (p.spiceLevel === 'Medium') : (nameLower.includes('lemon') || nameLower.includes('ginger') || nameLower.includes('garlic') || nameLower.includes('tomato') || nameLower.includes('tangy') || (!nameLower.includes('avakaya') && !nameLower.includes('chilli') && !nameLower.includes('spicy') && !nameLower.includes('gongura') && !nameLower.includes('sweet') && !nameLower.includes('bellam') && !nameLower.includes('jaggery') && !nameLower.includes('mild')));
    } else if (selectedSpice === 'Mild & Sweet') {
      matchesSpice = p.spiceLevel ? (p.spiceLevel === 'Mild') : (nameLower.includes('sweet') || nameLower.includes('bellam') || nameLower.includes('jaggery') || nameLower.includes('mild'));
    }

    let matchesIngredient = true;
    if (selectedIngredient !== 'All') {
      const ingSearch = selectedIngredient.toLowerCase().replace(/pickles?/, '').trim();
      matchesIngredient = nameLower.includes(ingSearch) || descLower.includes(ingSearch) || (p.category && p.category.toLowerCase().includes(ingSearch));
    }

    return matchesSpice && matchesIngredient;
  });

  return (
    <div>
      <style>{`
        /* Hero Animations & Micro-Interactions */
        .hero-btn:hover { 
          transform: translateY(-4px); 
          box-shadow: 0 20px 30px -10px rgba(220, 38, 38, 0.4) !important; 
        }
        .hero-btn-alt:hover { 
          background: rgba(255,255,255,0.15) !important;
          border-color: rgba(255,255,255,0.4) !important;
        }
        .hero-img { 
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); 
        }
        .hero-img:hover { 
          transform: scale(1.03) rotate(-1deg); 
        }
        
        /* Continuous Ticker Animation */
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }

        /* Glassmorphism Category Cards */
        .category-card {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          background: var(--surface);
          border: 1px solid var(--border);
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow);
          text-decoration: none;
        }
        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-hover);
          border-color: var(--primary);
        }
        .category-img-container {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid var(--border);
          transition: all 0.4s;
          margin-bottom: 20px;
        }
        .category-card:hover .category-img-container {
          transform: scale(1.08);
          border-color: var(--primary);
        }

        /* Dynamic Spice Finder Tabs */
        .filter-tab {
          padding: 12px 24px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 0.9rem;
          border: 2px solid var(--border);
          background: var(--surface);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.25s;
        }
        .filter-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.15);
        }
        .filter-tab:hover:not(.active) {
          border-color: var(--primary);
          color: var(--primary);
        }

        /* Testimonial Transitions */
        .testimonial-fade {
          animation: fadeIn 0.6s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Curing Timeline Visual */
        .timeline-step {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 30px;
          position: relative;
          transition: all 0.3s;
        }
        .timeline-step:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-hover);
          border-color: var(--primary);
        }

        /* Dynamic Drifting Particles */
        @keyframes float-particle-1 {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(360deg); }
        }
        @keyframes float-particle-2 {
          0% { transform: translateY(0px) rotate(360deg); }
          50% { transform: translateY(-35px) rotate(180deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .spice-floater {
          position: absolute;
          pointer-events: none;
          z-index: 1;
        }

        /* Gourmet Box Curation Cards */
        .bundle-builder-card {
          background: var(--surface);
          border: 2px dashed var(--border);
          border-radius: 24px;
          padding: 16px;
          transition: all 0.3s;
          cursor: pointer;
          position: relative;
          text-align: center;
        }
        .bundle-builder-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
        }
        .bundle-builder-card.selected {
          border-color: var(--primary);
          background: var(--secondary);
          box-shadow: var(--shadow-hover);
        }

        /* Mobile responsive overrides */
        .bundle-builder-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 40px;
          align-items: flex-start;
        }
        .hero-container {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          width: 100%;
          padding: 80px 20px;
        }
        .slider-dots {
          position: absolute;
          right: 40px;
          bottom: 40px;
          display: flex;
          gap: 12px;
          z-index: 30;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(10, 5, 5, 0.95) 0%, rgba(10, 5, 5, 0.85) 35%, rgba(10, 5, 5, 0.4) 65%, transparent 100%);
        }
        @media (max-width: 991px) {
          .bundle-builder-grid {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }
        @media (max-width: 768px) {
          .hero-container {
            justify-content: center;
            text-align: center;
            padding: 120px 20px 80px 20px;
          }
          .hero-container p {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-container div {
            justify-content: center;
          }
          .slider-dots {
            right: 50% !important;
            transform: translateX(50%) !important;
            bottom: 25px !important;
          }
          .hero-overlay {
            background: rgba(10, 5, 5, 0.8) !important;
          }
          .spice-floater {
            display: none !important;
          }
        }
      `}</style>

      {/* Immersive Luxury Hero */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', alignItems: 'center', background: '#0a0505' }}>
          {/* Dynamic Full-Bleed Slide Backgrounds */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, overflow: 'hidden' }}>
            {sliders.length > 0 ? (
              sliders.map((slide, idx) => (
                <div
                  key={slide._id || idx}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${slide.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center right',
                    transform: currentSlideIndex === idx ? 'translateX(0)' : currentSlideIndex > idx ? 'translateX(-100%)' : 'translateX(100%)',
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: currentSlideIndex === idx ? 2 : 1,
                  }}
                >
                  {/* Left-side dark gradient to create premium "empty space" for readable text overlay */}
                  <div className="hero-overlay" />
                </div>
              ))
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${settings?.defaultProductImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center right',
                  opacity: 1,
                  zIndex: 2,
                }}
              >
                <div className="hero-overlay" />
              </div>
            )}
          </div>

          {/* Subtle Dynamic Gradients overlayed on top of slides */}
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(220,38,38,0.2) 0%, transparent 70%)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 3, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 3, pointerEvents: 'none' }}></div>

          {/* Drifting Spice Particles */}
          <div className="spice-floater" style={{ top: '15%', left: '8%', animation: 'float-particle-1 8s infinite ease-in-out', zIndex: 4 }}>
            <Flame size={28} color="#ef4444" style={{ opacity: 0.15, transform: 'rotate(15deg)' }} />
          </div>
          <div className="spice-floater" style={{ top: '65%', left: '85%', animation: 'float-particle-2 10s infinite ease-in-out', zIndex: 4 }}>
            <Sparkles size={24} color="#f59e0b" style={{ opacity: 0.2 }} />
          </div>
          <div className="spice-floater" style={{ top: '80%', left: '15%', animation: 'float-particle-1 12s infinite ease-in-out', zIndex: 4 }}>
            <Leaf size={28} color="#16a34a" style={{ opacity: 0.15, transform: 'rotate(-25deg)' }} />
          </div>
          <div className="spice-floater" style={{ top: '25%', left: '75%', animation: 'float-particle-2 9s infinite ease-in-out', zIndex: 4 }}>
            <Droplet size={24} color="#f59e0b" style={{ opacity: 0.15, transform: 'rotate(45deg)' }} />
          </div>

          <div className="container hero-container">
            <div style={{ maxWidth: '650px', width: '100%' }} key={activeSlide?._id || 'default'}>
              {activeSlide?.subtitle && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(220, 38, 38, 0.15)', color: '#ef4444', borderRadius: '30px', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '25px', border: '1px solid rgba(220, 38, 38, 0.25)', backdropFilter: 'blur(5px)' }}>
                  <Sparkles size={14} /> {activeSlide.subtitle}
                </div>
              )}

              {activeSlide?.title && (
                <h1 style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)', fontWeight: '900', color: 'white', lineHeight: 1.1, fontFamily: 'Fraunces, serif', marginBottom: '25px' }}>
                  {activeSlide.title.split(' ').length > 2 ? (
                    <>
                      {activeSlide.title.split(' ').slice(0, -2).join(' ')}{' '}
                      <span style={{ color: '#ef4444', fontStyle: 'italic' }}>
                        {activeSlide.title.split(' ').slice(-2).join(' ')}
                      </span>
                    </>
                  ) : (
                    <span style={{ color: '#ef4444', fontStyle: 'italic' }}>{activeSlide.title}</span>
                  )}
                </h1>
              )}

              {activeSlide?.description && (
                <p style={{ fontSize: '1.2rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '40px', maxWidth: '550px', fontWeight: '500' }}>
                  {activeSlide.description}
                </p>
              )}

              {activeSlide?.buttonText && (
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '45px' }}>
                  <Link href={activeSlide?.link || "#"} className="hero-btn" style={{ background: 'var(--primary)', color: 'white', padding: '18px 36px', borderRadius: '30px', textDecoration: 'none', fontWeight: '900', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.3s', boxShadow: '0 15px 25px -5px rgba(220, 38, 38, 0.4)' }}>
                    {activeSlide.buttonText} <ArrowRight size={18} />
                  </Link>
                </div>
              )}
            </div>

            {/* Slider Dots */}
            {sliders.length > 1 && (
              <div className="slider-dots">
                {sliders.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      background: currentSlideIndex === idx ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                      transform: currentSlideIndex === idx ? 'scale(1.4)' : 'scale(1)',
                      boxShadow: currentSlideIndex === idx ? '0 0 10px var(--primary)' : 'none',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Brand Announcement Ticker Marquee */}
      <section style={{ background: '#ef4444', color: 'white', padding: '10px 0', overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="marquee-container" style={{ display: 'flex', overflow: 'hidden' }}>
          <div className="animate-marquee">
            {Array.from({ length: 4 }).map((_, repeatIdx) => (
              <span key={repeatIdx} style={{ display: 'inline-flex', alignItems: 'center', gap: '30px' }}>
                {middleTickerTexts.map((text: string, txtIdx: number) => (
                  <span key={txtIdx} style={{ fontSize: '0.9rem', fontWeight: '900', letterSpacing: '0.15em', textTransform: 'uppercase', paddingRight: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🌶️ {text}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Categories Section */}
      <section className="container" style={{ padding: '8rem 20px 6rem 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '5px' }}>

          </span>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-main)', fontFamily: 'Fraunces, serif', margin: 0 }}>
            Shop by <span style={{ color: 'var(--primary)' }}>Category</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'clamp(16px, 3vw, 30px)' }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <CategoryItemSkeleton key={i} />)
          ) : (
            categories.map((cat: any, idx: number) => (
              <ScrollReveal key={cat._id} direction="up" delay={idx * 100}>
                <Link
                  href={`/products?category=${cat.name}`}
                  className="category-card"
                  style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div className="category-img-container">
                    <img
                      src={cat.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800';
                      }}
                    />
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 8px 0', fontFamily: 'Fraunces, serif', textAlign: 'center' }}>
                    {cat.name}
                  </h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Explore Range →
                  </span>
                </Link>
              </ScrollReveal>
            ))
          )}
        </div>
      </section>

      {/* Interactive Spice & Flavor Finder */}
      <section style={{ background: 'var(--secondary)', padding: '7rem 20px' }}>
        <div className="container">
          <ScrollReveal direction="up">
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '10px' }}>
                Pickle Matcher
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Fraunces, serif', color: 'var(--text-main)', margin: 0 }}>
                Find Your Perfect <span style={{ color: 'var(--primary)' }}>Spice Match</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '15px auto 0 auto', fontSize: '1rem', fontWeight: '600' }}>
                Choose your ideal spice level and key ingredient to instantly discover the pickles customized for your taste buds.
              </p>
            </div>
          </ScrollReveal>

          {/* Interactive Filters Panel */}
          <ScrollReveal direction="up" delay={200}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px', padding: '30px', marginBottom: '50px', boxShadow: 'var(--shadow)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {/* Spice Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                    🌶️ Select Heat Tolerance
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['All', 'Mild & Sweet', 'Medium & Tangy', 'Fiery Hot'].map(spice => (
                      <button
                        key={spice}
                        onClick={() => setSelectedSpice(spice)}
                        className={`filter-tab ${selectedSpice === spice ? 'active' : ''}`}
                      >
                        {spice}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ingredient Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
                    🥭 Select Main Ingredient
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['All', ...categories.map(c => c.name)].map(ing => (
                      <button
                        key={ing}
                        onClick={() => setSelectedIngredient(ing)}
                        className={`filter-tab ${selectedIngredient === ing ? 'active' : ''}`}
                      >
                        {ing}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Filtered Results Grid */}
          <div>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : filteredPickles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {filteredPickles.slice(0, 4).map((p: any, idx: number) => (
                  <div key={p._id} className="testimonial-fade">
                    <ScrollReveal direction="up" delay={idx * 100}>
                      <ProductCard p={p} defaultImage={settings?.defaultProductImage} />
                    </ScrollReveal>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', border: '2px dashed var(--border)', borderRadius: '32px' }}>
                <Compass size={48} style={{ color: 'var(--text-muted)', marginBottom: '15px' }} />
                <h4 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '10px' }}>No Exact Match Found</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '25px', maxWidth: '400px', margin: '0 auto 25px auto' }}>
                  We couldn't find a pickle matching those filters, but we think you will love our top selling recommendations!
                </p>
                <button
                  onClick={() => { setSelectedSpice('All'); setSelectedIngredient('All'); }}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}
                >
                  Reset Taste Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Selling Showcase */}
      <section style={{ padding: '7rem 20px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '10px' }}>
                Customer Favorites
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', fontFamily: 'Fraunces, serif', margin: 0 }}>
                Our Top Selling <span style={{ color: 'var(--primary)' }}>Delicacies</span>
              </h2>
            </div>
            <Link href="/products" style={{ fontSize: '0.95rem', fontWeight: '900', color: 'var(--primary)', textDecoration: 'none', borderBottom: '2px solid var(--primary)', paddingBottom: '4px' }}>
              View All Pickles →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            ) : (
              topSelling.map((p: any, idx: number) => (
                <ScrollReveal key={p._id} direction="up" delay={idx * 100}>
                  <ProductCard p={p} defaultImage={settings?.defaultProductImage} />
                </ScrollReveal>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Traditional Godavari Curing Process timeline */}
      <section style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '7rem 20px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '10px' }}>
              The Culinary Journey
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Fraunces, serif', color: 'var(--text-main)', margin: 0 }}>
              How We Craft The <span style={{ color: 'var(--primary)' }}>Gold Standard</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '15px auto 0 auto', fontSize: '1rem', fontWeight: '600' }}>
              Every jar of Kanvi is a labor of love, aged slowly and mixed meticulously according to centuries-old Godavari traditions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'clamp(20px, 3vw, 30px)' }}>
            {craftSteps.map((step: any, idx: number) => (
              <ScrollReveal key={idx} direction={idx % 2 === 0 ? 'left' : 'right'} delay={idx * 100}>
                <div className="timeline-step" style={{ height: '100%' }}>
                  <div style={{ width: '56px', height: '56px', background: 'var(--secondary)', color: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', fontWeight: '900', fontSize: '1.2rem' }}>
                    {step.stepNumber || (idx + 1)}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', fontFamily: 'Fraunces, serif', marginBottom: '12px' }}>{step.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Gourmet Box Builder Section */}
      {settings?.isBundleEnabled && (
        <section style={{ padding: '7rem 20px', background: 'var(--secondary)', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
          {/* Drifting Spice Particles in Builder section */}
          <div className="spice-floater" style={{ top: '10%', left: '80%', animation: 'float-particle-1 9s infinite ease-in-out' }}>
            <Leaf size={24} color="#16a34a" style={{ opacity: 0.1, transform: 'rotate(45deg)' }} />
          </div>
          <div className="spice-floater" style={{ top: '75%', left: '10%', animation: 'float-particle-2 11s infinite ease-in-out' }}>
            <Flame size={26} color="#ef4444" style={{ opacity: 0.15, transform: 'rotate(-15deg)' }} />
          </div>

          <div className="container" style={{ position: 'relative', zIndex: 5 }}>
            <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '10px' }}>
                Exclusive Curations
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Fraunces, serif', color: 'var(--text-main)', margin: 0 }}>
                {settings?.bundleTitle || 'Curate Your Gourmet Sample Box'}
              </h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '15px auto 0 auto', fontSize: '1.05rem', fontWeight: '600' }}>
                {settings?.bundleDescription || 'Choose your favorite pickles to build a customized gift set packed with traditional Godavari flavor.'}
              </p>
            </div>

            <div className="bundle-builder-grid">

              {/* Left Side: Pickle Selection List */}
              <ScrollReveal direction="left" duration={1000}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🏺 Select Pickles ({selectedBundleItems.length}/{settings?.bundleQuantity || 3})
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'clamp(12px, 3vw, 20px)' }}>
                    {allProducts.map((p: any) => {
                      const isSelected = selectedBundleItems.some(item => item._id === p._id);
                      return (
                        <div
                          key={p._id}
                          onClick={() => toggleBundleItem(p)}
                          className={`bundle-builder-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px', background: 'var(--border)' }}>
                            <img 
                              src={p.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000'} 
                              alt={p.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000';
                              }}
                            />
                            {isSelected && (
                              <div style={{ position: 'absolute', inset: 0, background: 'rgba(220, 38, 38, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <Check size={36} style={{ strokeWidth: 3 }} />
                              </div>
                            )}
                          </div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {p.name}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>{p.category}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>

              {/* Right Side: Selected Items & Add to Cart Box Panel */}
              <ScrollReveal direction="right" duration={1000} style={{ position: 'sticky', top: '120px' }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '32px', padding: '40px 30px', boxShadow: 'var(--shadow)' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: '900', fontFamily: 'Fraunces, serif', marginBottom: '20px', textAlign: 'center' }}>
                    Your Custom Gift Box
                  </h3>

                  <div style={{ position: 'relative', width: '100%', maxWidth: '200px', aspectRatio: '1/1', margin: '0 auto 30px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Decorative Wooden Box Graphic */}
                    <div style={{
                      width: '100%', height: '100%', borderRadius: '24px',
                      background: 'linear-gradient(135deg, #7c2d12 0%, #431407 100%)',
                      border: '4px solid #b45309', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', color: '#fef3c7', gap: '8px',
                      boxShadow: '0 15px 30px rgba(67, 20, 7, 0.3)'
                    }}>
                      <span style={{ fontSize: '3rem' }}>🎁</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Kanvi Wooden Box</span>
                    </div>
                  </div>

                  {/* Selected Slots List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '30px' }}>
                    {Array.from({ length: settings?.bundleQuantity || 3 }).map((_, idx) => {
                      const item = selectedBundleItems[idx];
                      return (
                        <div
                          key={idx}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 18px',
                            borderRadius: '16px', border: '2px dashed var(--border)', background: item ? 'var(--background)' : 'transparent'
                          }}
                        >
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item ? 'var(--primary)' : 'var(--border)' }}></div>
                          {item ? (
                            <>
                              <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>{item.name}</span>
                              <button
                                type="button"
                                onClick={() => setSelectedBundleItems(selectedBundleItems.filter((_, i) => i !== idx))}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Empty Slot #{idx + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ borderTop: '2px solid var(--border)', paddingTop: '20px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-muted)' }}>Flat Bundle Price:</span>
                    <span style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)' }}>₹{settings?.bundlePrice || 499}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddBundleToCart}
                    disabled={selectedBundleItems.length < (settings?.bundleQuantity || 3)}
                    style={{
                      width: '100%', padding: '18px', background: selectedBundleItems.length < (settings?.bundleQuantity || 3) ? 'var(--border)' : 'var(--primary)',
                      color: selectedBundleItems.length < (settings?.bundleQuantity || 3) ? 'var(--text-muted)' : 'white',
                      border: 'none', borderRadius: '18px', fontWeight: '900', cursor: selectedBundleItems.length < (settings?.bundleQuantity || 3) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
                      boxShadow: selectedBundleItems.length < (settings?.bundleQuantity || 3) ? 'none' : '0 10px 20px rgba(220, 38, 38, 0.2)'
                    }}
                  >
                    <Check size={20} /> Add Custom Box to Cart
                  </button>
                </div>
              </ScrollReveal>

            </div>
          </div>
        </section>
      )}

      {/* Dynamic Testimonials Carousel Section */}
      {testimonials.length > 0 && (
        <section style={{ background: '#0a0505', color: 'white', padding: '8px 0 100px 0', position: 'relative', overflow: 'hidden' }}>
          {/* Accent glow behind testimonials */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '450px', height: '450px', background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)', filter: 'blur(80px)', borderRadius: '50%', pointerEvents: 'none' }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ textAlign: 'center', marginBottom: '5rem', marginTop: '6rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.25em', display: 'inline-block', marginBottom: '10px' }}>
                Customer Voices
              </span>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Fraunces, serif', margin: 0, color: 'white' }}>
                Loved by India's <span style={{ color: '#ef4444' }}>Pickle Connoisseurs</span>
              </h2>
            </div>

            {/* Carousel Display */}
            <ScrollReveal direction="up">
              <div style={{ maxWidth: '800px', margin: '0 auto', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '40px', padding: '60px 50px', position: 'relative', backdropFilter: 'blur(20px)' }} className="testimonial-fade" key={currentTestimonialIndex}>
                <div style={{ position: 'absolute', top: '30px', left: '40px', color: 'rgba(220,38,38,0.15)' }}>
                  <Quote size={80} fill="currentColor" />
                </div>

                <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '25px' }}>
                    {Array.from({ length: testimonials[currentTestimonialIndex]?.rating || 5 }).map((_, starIdx) => (
                      <Star key={starIdx} size={20} fill="#f59e0b" color="#f59e0b" />
                    ))}
                  </div>

                  <blockquote style={{ fontSize: '1.45rem', fontWeight: '600', lineHeight: 1.6, color: '#f3f4f6', margin: '0 0 35px 0', fontFamily: 'Fraunces, serif', fontStyle: 'italic' }}>
                    "{testimonials[currentTestimonialIndex]?.quote}"
                  </blockquote>

                  <cite style={{ display: 'block', fontStyle: 'normal' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: '900', color: 'white', marginBottom: '6px' }}>
                      {testimonials[currentTestimonialIndex]?.author}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', background: 'rgba(220, 38, 38, 0.15)', color: '#ef4444', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(220, 38, 38, 0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      {testimonials[currentTestimonialIndex]?.roleOrLocation}
                    </span>
                  </cite>
                </div>

                {/* Navigation Controls */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '40px' }}>
                  <button
                    onClick={() => setCurrentTestimonialIndex(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentTestimonialIndex(prev => (prev + 1) % testimonials.length)}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: '0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                    onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Dynamic Trust Features Section */}
      <section style={{
        background: 'linear-gradient(180deg, #170d0d 0%, #0d0707 100%)',
        color: 'white',
        padding: '100px 20px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #271111'
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)', filter: 'blur(100px)', borderRadius: '50%', pointerEvents: 'none' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#ef4444', display: 'inline-block', marginBottom: '10px' }}>
              The Kanvi Promise
            </span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Fraunces, serif', marginBottom: '20px', color: 'white' }}>
              Why Choose Kanvi Pickles?
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '600px', margin: '0 auto', fontSize: '1rem', fontWeight: '500', lineHeight: 1.6 }}>
              We bring the authentic, traditional taste of Godavari home-cooking right to your dining table, crafted with love and absolute purity.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            <style>{`
              .trust-card {
                background: rgba(255, 255, 255, 0.01);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 28px;
                padding: 40px 30px;
                text-align: center;
                transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                backdrop-filter: blur(12px);
              }
              .trust-card:hover {
                transform: translateY(-8px);
                background: rgba(255, 255, 255, 0.03);
                border-color: #ef4444;
                box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
              }
              .trust-icon-box {
                width: 64px;
                height: 64px;
                border-radius: 20px;
                background: rgba(220,38,38,0.15);
                color: #ef4444;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 24px auto;
                transition: all 0.4s;
              }
              .trust-card:hover .trust-icon-box {
                background: #ef4444;
                color: white;
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
                  <div className="timeline-step-icon-wrapper">
                    <div className="trust-icon-box">
                      <IconComponent size={28} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', fontFamily: 'Fraunces, serif', marginBottom: '12px', color: 'white' }}>
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


