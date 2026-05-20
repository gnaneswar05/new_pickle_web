'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RotateCcw, Scale, Check } from 'lucide-react';
import LoadingLogo from '../../components/LoadingLogo';

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

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('Product not found');
        router.push('/products');
      });
  }, [id, router]);

  if (loading) return <LoadingLogo message="Loading product details..." />;
  if (!product) return null;

  // Calculate price based on selected weight
  const getPrice = () => {
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
      <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: '800', marginBottom: '40px', fontSize: '0.875rem' }}>
        <ArrowLeft size={18} /> BACK TO COLLECTION
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px' }}>
        {/* Left: Image */}
        <div>
          <div style={{ position: 'relative', borderRadius: '40px', overflow: 'hidden', backgroundColor: 'white', border: '8px solid white', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}>
            <img 
              src={product.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000'} 
              alt={product.name} 
              style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }}
            />
          </div>
        </div>

        {/* Right: Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '32px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: '900', color: '#2d5a27', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Handcrafted</span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', marginTop: '8px', fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
              {product.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '16px' }}>
              <span style={{ display: 'flex', gap: '4px', color: '#f59e0b' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg key={s} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={s <= Math.round(product.rating || 4.9) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                ))}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '800', marginLeft: '8px' }}>({product.rating || 4.9}/5) Customer Reviews</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <span style={{ fontSize: '3rem', fontWeight: '900', color: '#2d5a27' }}>₹{currentPrice.toFixed(2)}</span>
            {selectedWeight !== '250g' && (
              <span style={{ background: '#f0f7f0', color: '#2d5a27', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '800' }}>BEST VALUE</span>
            )}
          </div>

          {/* Weight Selection - IMPORTANT ADDITION */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Select Weight</label>
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
                    borderColor: selectedWeight === w ? '#2d5a27' : '#f1f5f9',
                    background: selectedWeight === w ? '#2d5a27' : 'white',
                    color: selectedWeight === w ? 'white' : '#1e293b',
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

          <p style={{ fontSize: '1.1rem', color: '#64748b', lineHeight: 1.7, marginBottom: '40px' }}>
            {product.description || "Indulge in the true essence of Indian flavors. Our pickles are crafted using traditional family recipes, premium quality spices, and the freshest ingredients."}
          </p>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '4px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '45px', height: '45px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem', fontWeight: '900', color: '#64748b' }}>−</button>
              <span style={{ width: '40px', textAlign: 'center', fontWeight: '900', fontSize: '1.1rem' }}>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} style={{ width: '45px', height: '45px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.25rem', fontWeight: '900', color: '#64748b' }}>+</button>
            </div>
            
            {items.some(i => i.id === `${product._id}-${selectedWeight}`) ? (
              <button 
                onClick={() => router.push('/cart')}
                style={{ flex: 1, background: '#2d5a27', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(45, 90, 39, 0.2)' }}
              >
                <Check size={24} /> Go to Cart
              </button>
            ) : (
              <button 
                onClick={handleAddToCart}
                style={{ flex: 1, background: '#0f172a', color: 'white', border: 'none', borderRadius: '20px', fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}
              >
                <ShoppingCart size={24} /> Add to Basket
              </button>
            )}
          </div>

          {/* Trust Factors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', paddingTop: '40px', borderTop: '2px solid #f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
              <ShieldCheck size={24} color="#2d5a27" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>100% Pure</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Truck size={24} color="#2d5a27" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Express Delivery</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <RotateCcw size={24} color="#2d5a27" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '0.6rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Easy Returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
