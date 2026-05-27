'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryItemSkeleton } from '../components/Skeleton';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  const showSkeletons = !mounted || loading;

  return (
    <div className="container" style={{ padding: '60px 20px', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1.5rem', fontFamily: 'Fraunces, serif', textAlign: 'center' }}>
        Shop by <span style={{ color: 'var(--primary)' }}>Category</span>
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '60px', fontWeight: '500' }}>
        Discover our authentic, handcrafted Godavari delicacies.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'clamp(20px, 4vw, 50px)', justifyItems: 'center' }}>
        {showSkeletons ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <CategoryItemSkeleton key={idx} />
          ))
        ) : (
          categories.map((cat: any) => (
            <Link href={`/products?category=${cat.name}`} key={cat._id} className="group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none' }}>
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '6px solid var(--border)',
              boxShadow: 'var(--shadow)',
              marginBottom: '20px',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05) translateY(-5px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 25px 30px -5px rgba(220, 38, 38, 0.2)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1) translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
            }}
            >
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
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif', textAlign: 'center' }}>{cat.name}</h2>
          </Link>
        )))}
      </div>
    </div>
  );
}

