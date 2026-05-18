'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import LoadingLogo from '../components/LoadingLogo';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingLogo message="Curating categories..." />;

  return (
    <div className="container" style={{ padding: '60px 20px', minHeight: '70vh' }}>
      <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif', textAlign: 'center' }}>
        Shop by <span style={{ color: '#480D18' }}>Category</span>
      </h1>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1.1rem', marginBottom: '60px', fontWeight: '500' }}>
        Discover our authentic, handcrafted Godavari delicacies.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '50px', justifyItems: 'center' }}>
        {categories.map((cat: any) => (
          <Link href={`/products?category=${cat.name}`} key={cat._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', group: 'true' }}>
            <div style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '6px solid white',
              boxShadow: '0 20px 25px -5px rgba(72, 13, 24, 0.15)',
              marginBottom: '20px',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              position: 'relative'
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.05) translateY(-5px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 25px 30px -5px rgba(72, 13, 24, 0.3)';
              (e.currentTarget as HTMLElement).style.borderColor = '#480D18';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1) translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 25px -5px rgba(72, 13, 24, 0.15)';
              (e.currentTarget as HTMLElement).style.borderColor = 'white';
            }}
            >
              <img 
                src={cat.image || settings?.defaultProductImage || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'} 
                alt={cat.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', margin: 0, fontFamily: 'Playfair Display, serif', textAlign: 'center' }}>{cat.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
}

