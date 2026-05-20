'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlistStore';
import toast from 'react-hot-toast';
import { ShoppingBasket, Star, Check, Heart } from 'lucide-react';

export default function ProductCard({ p, defaultImage }: { p: any, defaultImage?: string }) {
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const addItem = useCartStore((state) => state.addItem);
  const items = useCartStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const wishlistItems = useWishlistStore((state) => state.items);
  const isWishlisted = wishlistItems.some(item => item.id === p._id);
  const router = useRouter();

  const getPrice = () => {
    if (p.variants && p.variants.length > 0) {
      const variant = p.variants.find((v: any) => v.weight === selectedWeight);
      if (variant) return variant.price;
    }
    const basePrice = p.price || 0;
    if (selectedWeight === '250g') return basePrice;
    if (selectedWeight === '500g') return basePrice * 1.9;
    if (selectedWeight === '1kg') return basePrice * 3.6;
    return basePrice;
  };

  const currentPrice = getPrice();
  
  // Check if exactly this product variant is in cart
  const cartItemId = `${p._id}-${selectedWeight}`;
  const isInCart = items.some(item => item.id === cartItemId);

  const handleAction = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCart) {
      router.push('/cart');
    } else {
      addItem({
        ...p,
        id: cartItemId,
        name: `${p.name} (${selectedWeight})`,
        price: currentPrice,
        selectedWeight,
        image: p.image || ''
      });
      toast.success(`${p.name} (${selectedWeight}) added to cart`);
    }
  };

  const weights = ['250g', '500g', '1kg'];

  return (
    <div style={{ background: 'white', borderRadius: '32px', padding: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
      <Link href={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#f1f5f9', marginBottom: '20px', aspectRatio: '1/1' }}>
          <img 
            src={p.image || defaultImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'} 
            alt={p.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {p.category && (
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {p.category}
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist({
                id: p._id,
                name: p.name,
                price: p.price,
                image: p.image || defaultImage || '',
                category: p.category,
                rating: p.rating,
              });
              toast.success(isWishlisted ? `${p.name} removed from wishlist` : `${p.name} added to wishlist`);
            }}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: isWishlisted ? '#fee2e2' : 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Heart
              size={18}
              fill={isWishlisted ? '#ef4444' : 'none'}
              color={isWishlisted ? '#ef4444' : '#94a3b8'}
              style={{ transition: 'all 0.3s' }}
            />
          </button>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>{p.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" />)}
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginLeft: '4px' }}>({p.rating || 4.9}/5)</span>
        </div>
        <p style={{ fontSize: '1.75rem', fontWeight: '900', color: '#2d5a27', marginBottom: '16px' }}>₹{currentPrice.toFixed(2)}</p>
      </Link>

      {/* Weight Selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {weights.map(w => (
          <button
            key={w}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedWeight(w);
            }}
            style={{
              flex: 1,
              padding: '8px 4px',
              borderRadius: '12px',
              border: `2px solid ${selectedWeight === w ? '#2d5a27' : '#f1f5f9'}`,
              background: selectedWeight === w ? '#2d5a27' : 'white',
              color: selectedWeight === w ? 'white' : '#64748b',
              fontSize: '0.75rem',
              fontWeight: '800',
              cursor: 'pointer',
              transition: '0.2s'
            }}
          >
            {w}
          </button>
        ))}
      </div>
      
      <button 
        style={{ 
          marginTop: 'auto', 
          width: '100%', 
          padding: '16px', 
          background: isInCart ? '#2d5a27' : '#0f172a', 
          color: 'white', 
          border: 'none', 
          borderRadius: '18px', 
          fontWeight: '800', 
          fontSize: '0.875rem', 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px', 
          transition: 'all 0.2s' 
        }}
        onClick={handleAction}
      >
        {isInCart ? (
          <><Check size={18} /> Go to Cart</>
        ) : (
          <><ShoppingBasket size={18} /> Add to Cart</>
        )}
      </button>
    </div>
  );
}

