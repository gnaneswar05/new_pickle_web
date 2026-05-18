'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { ShoppingBasket, Star, ShieldCheck, Clock } from 'lucide-react';
import ProductCard from '../components/ProductCard';

import LoadingLogo from '../components/LoadingLogo';

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const addItem = useCartStore((state) => state.addItem);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = products;
    if (category) {
      result = result.filter((p: any) => p.category?.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      result = result.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredProducts(result);
  }, [category, search, products]);

  if (loading) {
    return <LoadingLogo message="Curating our handcrafted collections..." />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}>
          {category ? `${category} Collection` : search ? `Search Results for "${search}"` : 'Our Collections'}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, fontWeight: '500' }}>
          Traditional recipes, sun-dried ingredients, and the authentic taste of heritage Godavari pickles.
        </p>

        {/* Category Quick Filter */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '40px', flexWrap: 'wrap' }}>
          <Link 
            href="/products"
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              fontSize: '0.875rem',
              fontWeight: '800',
              textDecoration: 'none',
              transition: 'all 0.2s',
              background: !category ? '#480D18' : 'white',
              color: !category ? 'white' : '#64748b',
              border: '1px solid',
              borderColor: !category ? '#480D18' : '#e2e8f0',
              boxShadow: !category ? '0 10px 15px -3px rgba(72, 13, 24, 0.2)' : 'none'
            }}
          >
            All Pickles
          </Link>
          {categories.map((cat: any) => {
            const isSelected = category?.toLowerCase() === cat.name.toLowerCase();
            return (
              <Link 
                key={cat._id}
                href={`/products?category=${cat.name}`}
                style={{
                  padding: '12px 24px',
                  borderRadius: '14px',
                  fontSize: '0.875rem',
                  fontWeight: '800',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  background: isSelected ? '#480D18' : 'white',
                  color: isSelected ? 'white' : '#64748b',
                  border: '1px solid',
                  borderColor: isSelected ? '#480D18' : '#e2e8f0',
                  boxShadow: isSelected ? '0 10px 15px -3px rgba(72, 13, 24, 0.2)' : 'none'
                }}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#94a3b8' }}>No pickles found in this collection yet.</p>
          <Link href="/products" style={{ color: '#480D18', fontWeight: '800', marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}>View All Products →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
          {filteredProducts.map((p: any) => (
            <ProductCard key={p._id} p={p} defaultImage={settings?.defaultProductImage} />
          ))}
        </div>
      )}

      {/* Trust Section */}
      <div style={{ marginTop: '100px', padding: '60px', background: 'white', borderRadius: '40px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#480D18' }}>
            <ShieldCheck size={24} />
          </div>
          <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>100% Natural</h4>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>No artificial preservatives used</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#fef3c7', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#d97706' }}>
            <Star size={24} />
          </div>
          <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>Premium Quality</h4>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Selected sun-dried ingredients</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#2563eb' }}>
            <Clock size={24} />
          </div>
          <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>Freshly Packed</h4>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Made in small artisan batches</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}

