'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { useWishlistStore } from '@/lib/wishlistStore';
import toast from 'react-hot-toast';
import { ShoppingBasket, Star, Check, Heart, Flame } from 'lucide-react';

export default function ProductCard({ p, defaultImage }: { p: any, defaultImage?: string }) {
  const [selectedWeight, setSelectedWeight] = useState('250g');
  const [isHovered, setIsHovered] = useState(false);
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

  const getSpiceLevel = () => {
    if (p.spiceLevel) {
      if (p.spiceLevel === 'Hot') return 3;
      if (p.spiceLevel === 'Mild') return 1;
      return 2;
    }
    const name = p.name.toLowerCase();
    const cat = p.category?.toLowerCase() || '';
    if (name.includes('avakaya') || name.includes('chilli') || name.includes('spicy') || cat.includes('chilli') || name.includes('gongura')) {
      return 3;
    }
    if (name.includes('sweet') || name.includes('bellam') || name.includes('jaggery') || name.includes('mild')) {
      return 1;
    }
    return 2;
  };

  const currentPrice = getPrice();
  const spiceLevel = getSpiceLevel();
  
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
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        background: 'var(--surface)', 
        borderRadius: '32px', 
        padding: '16px', 
        boxShadow: isHovered ? 'var(--shadow-hover)' : 'var(--shadow)', 
        border: `1px solid ${isHovered ? 'var(--primary)' : 'var(--border)'}`, 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
      }}
    >
      <Link href={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#ffffff', marginBottom: '20px', aspectRatio: '1/1' }}>
          <img 
            src={p.image || defaultImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'} 
            alt={p.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)'
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800';
            }}
          />
          {p.category && (
            <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--surface)', padding: '6px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid var(--border)' }}>
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
              background: isWishlisted ? 'var(--secondary)' : 'var(--surface)',
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
              fill={isWishlisted ? 'var(--primary)' : 'none'}
              color={isWishlisted ? 'var(--primary)' : 'var(--text-muted)'}
              style={{ transition: 'all 0.3s' }}
            />
          </button>
        </div>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '800', 
          color: 'var(--text-main)', 
          marginBottom: '8px', 
          fontFamily: 'Fraunces, serif',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: '2.8rem',
          lineHeight: '1.3'
        }}>{p.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" />)}
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', marginLeft: '4px' }}>({p.rating || 4.9}/5)</span>
          
          {/* Dynamic Spice Level Indicator */}
          <div style={{ display: 'flex', gap: '1px', marginLeft: 'auto', background: 'var(--secondary)', padding: '4px 8px', borderRadius: '8px', border: '1px solid var(--border)' }} title={`Spice: ${spiceLevel === 3 ? 'Hot' : spiceLevel === 2 ? 'Medium' : 'Mild'}`}>
            {Array.from({ length: 3 }).map((_, idx) => (
              <Flame
                key={idx}
                size={12}
                fill={idx < spiceLevel ? '#ef4444' : 'none'}
                color={idx < spiceLevel ? '#ef4444' : 'var(--text-muted)'}
                style={{ opacity: idx < spiceLevel ? 1 : 0.15 }}
              />
            ))}
          </div>
        </div>
        <p style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '16px' }}>₹{currentPrice.toFixed(2)}</p>
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
              border: `2px solid ${selectedWeight === w ? 'var(--primary)' : 'var(--border)'}`,
              background: selectedWeight === w ? 'var(--primary)' : 'var(--surface)',
              color: selectedWeight === w ? 'white' : 'var(--text-muted)',
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
          background: isInCart ? 'var(--primary)' : 'var(--text-main)', 
          color: isInCart ? 'white' : 'var(--background)', 
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
