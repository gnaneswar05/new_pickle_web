'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Scale, Check } from 'lucide-react';
import { ProductDetailSkeleton } from '../../components/Skeleton';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();
  const items = useCartStore((state) => state.items);
  const [product, setProduct] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setActiveImage(data.image || '');
        setLoading(false);
      })
      .catch(() => {
        toast.error('Product not found');
        router.push('/products');
      });
  }, [id, router]);

  // Calculate price based on selected weight
  const getPrice = () => {
    if (!product) return 0;
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants.find((v: any) => v.weight === selectedWeight);
      if (variant) return variant.price;
    }
    // Fallback multipliers if variants are not set in DB
    const basePrice = product.price || 0;
    if (selectedWeight === '250g') return basePrice;
    if (selectedWeight === '500g') return basePrice * 1.9; // Slight discount for more
    if (selectedWeight === '1kg') return basePrice * 3.6; // More discount for 1kg
    return basePrice;
  };

  const currentPrice = getPrice();

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      ...product,
      id: `${product._id}-${selectedWeight}`, // Unique ID for different weights
      name: `${product.name} (${selectedWeight})`,
      price: currentPrice,
      selectedWeight
    });
    toast.success(`${product.name} (${selectedWeight}) added!`);
  };

  const weights = ['250g', '500g', '1kg'];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '800', marginBottom: '40px', fontSize: '0.875rem' }}>
        <ArrowLeft size={18} /> BACK TO COLLECTION
      </button>

      {loading ? (
        <ProductDetailSkeleton />
      ) : !product ? null : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px' }}>
        {/* Left: Image Viewport and Thumbnail Gallery */}
        <div>
          <div style={{ position: 'relative', borderRadius: '40px', overflow: 'hidden', backgroundColor: 'var(--surface)', border: '8px solid var(--surface)', boxShadow: 'var(--shadow)' }}>
            <img 
              src={activeImage || product.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000'} 
              alt={product.name} 
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', transition: 'all 0.3s ease' }}
            />
          </div>
          {/* Gallery Thumbnails row */}
          {(() => {
            const allImages = [product.image, ...(product.images || [])].filter(Boolean);
            if (allImages.length <= 1) return null;
            return (
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', overflowX: 'auto', padding: '5px 0' }}>
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    style={{
                      width: '75px',
                      height: '75px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `3px solid ${activeImage === img ? 'var(--primary)' : 'var(--border)'}`,
                      background: 'var(--surface)',
                      cursor: 'pointer',
                      padding: 0,
                      flexShrink: 0,
                      transition: 'all 0.2s',
                      boxShadow: activeImage === img ? '0 10px 15px -3px rgba(220, 38, 38, 0.15)' : 'none'
                    }}
                  >
                    <img src={img} alt="Product Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Right: Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Handcrafted</span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', marginTop: '8px', fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px' }}>
              <span style={{ display: 'flex', gap: '4px', color: '#f59e0b' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={s <= Math.round(product.rating || 4.9) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                ))}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '800', marginLeft: '8px' }}>({product.rating || 4.9}/5) Customer Reviews</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <span style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--primary)' }}>₹{currentPrice.toFixed(2)}</span>
            {selectedWeight !== '250g' && (
              <span style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>BEST VALUE</span>
            )}
          </div>

          {/* Weight Selection - IMPORTANT ADDITION */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Select Weight</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {weights.map((w) => (
                <button
                   key={w}
                  onClick={() => setSelectedWeight(w)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '16px',
                    border: '2px solid',
                    borderColor: selectedWeight === w ? 'var(--primary)' : 'var(--border)',
                    background: selectedWeight === w ? 'var(--primary)' : 'var(--surface)',
                    color: selectedWeight === w ? 'white' : 'var(--text-main)',
                    fontWeight: '800',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Scale size={16} />
                  {w}
                </button>
              ))}
            </div>
          </div>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '40px' }}>
            {product.description || "Indulge in the true essence of Indian flavors. Our pickles are crafted using traditional family recipes, premium quality spices, and the freshest ingredients."}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--secondary)', padding: '4px', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '45px', height: '45px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-muted)' }}>−</button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: '900', fontSize: '1.1rem' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: '45px', height: '45px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-muted)' }}>+</button>
            </div>
            
            {items.some(i => i.id === `${product._id}-${selectedWeight}`) ? (
              <button 
                onClick={() => router.push('/cart')}
                style={{ flex: 1, background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)' }}
              >
                <Check size={24} /> Go to Cart
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                style={{ flex: 1, background: 'var(--text-main)', color: 'var(--background)', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              >
                <ShoppingCart size={24} /> Add to Basket
              </button>
            )}
          </div>

          {/* Redesigned Premium Trust Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', paddingTop: '40px', borderTop: '2px solid var(--border)' }}>
            <style>{`
              .trust-card {
                background: var(--secondary);
                border: 1px solid var(--border);
                border-radius: 20px;
                padding: 18px 10px;
                text-align: center;
                transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                cursor: default;
              }
              .trust-card:hover {
                transform: translateY(-5px);
                border-color: var(--primary) !important;
                box-shadow: 0 12px 20px -5px rgba(220, 38, 38, 0.08);
              }
            `}</style>
            <div className="trust-card">
              <ShieldCheck size={26} color="var(--primary)" style={{ marginBottom: '6px' }} />
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '0.05em' }}>100% Pure</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>No Preservatives</p>
            </div>
            <div className="trust-card">
              <Truck size={26} color="var(--primary)" style={{ marginBottom: '6px' }} />
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '0.05em' }}>Express Shipping</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>Dispatch in 24h</p>
            </div>
            <div className="trust-card">
              <RotateCcw size={26} color="var(--primary)" style={{ marginBottom: '6px' }} />
              <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '0.05em' }}>Easy Returns</p>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>100% Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
