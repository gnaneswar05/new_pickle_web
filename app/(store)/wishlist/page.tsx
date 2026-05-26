'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/lib/wishlistStore';
import { useCartStore } from '@/lib/store';
import { Heart, ShoppingBasket, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductCardSkeleton } from '../components/Skeleton';

export default function WishlistPage() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const items = useWishlistStore((state) => state.items);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);
  const addCartItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setMounted(true);
    fetch('/api/settings')
      .then(res => res.json())
      .then(setSettings)
      .catch(err => console.error(err));
  }, []);

  const handleAddToCart = (item: any) => {
    addCartItem({
      id: `${item.id}-250g`,
      name: `${item.name} (250g)`,
      price: item.price,
      image: item.image,
      selectedWeight: '250g',
    });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif', minHeight: '60vh' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'var(--secondary)', color: 'var(--primary)', padding: '10px 20px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '20px' }}>
          <Heart size={16} fill="var(--primary)" /> My Wishlist
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1rem', fontFamily: 'Fraunces, serif' }}>
          Your <span style={{ color: 'var(--primary)' }}>Favourites</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', fontWeight: '500' }}>
          {!mounted
            ? 'Loading favourites...'
            : items.length > 0
            ? `You have ${items.length} item${items.length > 1 ? 's' : ''} in your wishlist.`
            : 'Your wishlist is empty. Start adding your favourite pickles!'}
        </p>
      </div>

      {!mounted ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {Array.from({ length: 4 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--secondary)', borderRadius: '40px', border: '2px dashed var(--border)' }}>
          <Heart size={64} color="var(--border)" style={{ margin: '0 auto 20px' }} />
          <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '20px' }}>No favourites yet</p>
          <Link
            href="/products"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'var(--primary)', color: 'white', padding: '16px 32px',
              borderRadius: '18px', fontWeight: '800', fontSize: '0.95rem',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
          >
            <ArrowLeft size={18} /> Browse Pickles
          </Link>
        </div>
      ) : (
        <>
          {/* Clear All Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <button
              onClick={() => { clearWishlist(); toast.success('Wishlist cleared'); }}
              style={{
                background: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border)',
                padding: '10px 20px', borderRadius: '14px', fontWeight: '800',
                fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <Trash2 size={16} /> Clear All
            </button>
          </div>

          {/* Wishlist Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--surface)', borderRadius: '32px', padding: '16px',
                  boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
                  display: 'flex', flexDirection: 'column', transition: 'all 0.3s',
                }}
              >
                <Link href={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{
                    position: 'relative', borderRadius: '24px', overflow: 'hidden',
                    backgroundColor: 'var(--border)', marginBottom: '20px', aspectRatio: '1/1',
                  }}>
                    <img
                      src={item.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {item.category && (
                      <div style={{
                        position: 'absolute', top: '12px', left: '12px',
                        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)',
                        padding: '6px 12px', borderRadius: '99px', fontSize: '10px',
                        fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {item.category}
                      </div>
                    )}
                    {/* Filled Heart */}
                    <div style={{
                      position: 'absolute', top: '12px', right: '12px',
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Heart size={18} fill="var(--primary)" color="var(--primary)" />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px', fontFamily: 'Fraunces, serif' }}>
                    {item.name}
                  </h3>
                  <p style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '16px' }}>
                    ₹{item.price?.toFixed(2)}
                  </p>
                </Link>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button
                    onClick={() => handleAddToCart(item)}
                    style={{
                      flex: 1, padding: '14px', background: 'var(--text-main)', color: 'var(--background)',
                      border: 'none', borderRadius: '16px', fontWeight: '800',
                      fontSize: '0.85rem', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s',
                    }}
                  >
                    <ShoppingBasket size={16} /> Add to Cart
                  </button>
                  <button
                    onClick={() => { removeItem(item.id); toast.success(`${item.name} removed`); }}
                    style={{
                      width: '50px', padding: '14px', background: 'var(--secondary)', color: 'var(--primary)',
                      border: 'none', borderRadius: '16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
