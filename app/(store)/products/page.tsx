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
  const [currentPage, setCurrentPage] = useState(1);
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
    setCurrentPage(1);
  }, [category, search, products]);

  if (loading) {
    return <LoadingLogo message="Curating our handcrafted collections..." />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '1.5rem', fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
          {category ? `${category} Collection` : search ? `Search Results for "${search}"` : 'Our Collections'}
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6, fontWeight: '500' }}>
          Traditional recipes, sun-dried ingredients, and the authentic taste of Godavari pickles.
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
              background: !category ? '#2d5a27' : 'white',
              color: !category ? 'white' : '#64748b',
              border: '1px solid',
              borderColor: !category ? '#2d5a27' : '#e2e8f0',
              boxShadow: !category ? '0 10px 15px -3px rgba(45, 90, 39, 0.2)' : 'none'
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
                  background: isSelected ? '#2d5a27' : 'white',
                  color: isSelected ? 'white' : '#64748b',
                  border: '1px solid',
                  borderColor: isSelected ? '#2d5a27' : '#e2e8f0',
                  boxShadow: isSelected ? '0 10px 15px -3px rgba(45, 90, 39, 0.2)' : 'none'
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
          <Link href="/products" style={{ color: '#2d5a27', fontWeight: '800', marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}>View All Products →</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
            {(() => {
              const productsPerPage = settings?.productsPerPage || 8;
              const indexOfLastProduct = currentPage * productsPerPage;
              const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
              return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
            })().map((p: any) => (
              <ProductCard key={p._id} p={p} defaultImage={settings?.defaultProductImage} />
            ))}
          </div>

          {(() => {
            const productsPerPage = settings?.productsPerPage || 8;
            const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
            if (totalPages <= 1) return null;
            return (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '60px' }}>
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '800',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    background: 'white',
                    color: currentPage === 1 ? '#cbd5e1' : '#2d5a27',
                    border: '1px solid',
                    borderColor: currentPage === 1 ? '#cbd5e1' : '#e2e8f0',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.borderColor = '#2d5a27';
                      e.currentTarget.style.background = '#f0f7f0';
                    }
                  }}
                  onMouseOut={e => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  ← Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isSelected = pageNum === currentPage;
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '12px',
                        fontSize: '0.875rem',
                        fontWeight: '800',
                        cursor: 'pointer',
                        background: isSelected ? '#2d5a27' : 'white',
                        color: isSelected ? 'white' : '#64748b',
                        border: '1px solid',
                        borderColor: isSelected ? '#2d5a27' : '#e2e8f0',
                        boxShadow: isSelected ? '0 10px 15px -3px rgba(45, 90, 39, 0.2)' : 'none',
                        transition: 'all 0.2s',
                      }}
                      onMouseOver={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#2d5a27';
                          e.currentTarget.style.color = '#2d5a27';
                          e.currentTarget.style.background = '#f0f7f0';
                        }
                      }}
                      onMouseOut={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#64748b';
                          e.currentTarget.style.background = 'white';
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: '800',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    background: 'white',
                    color: currentPage === totalPages ? '#cbd5e1' : '#2d5a27',
                    border: '1px solid',
                    borderColor: currentPage === totalPages ? '#cbd5e1' : '#e2e8f0',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={e => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.borderColor = '#2d5a27';
                      e.currentTarget.style.background = '#f0f7f0';
                    }
                  }}
                  onMouseOut={e => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            );
          })()}
        </>
      )}

      {/* Trust Section */}
      <div style={{ marginTop: '100px', padding: '60px', background: 'white', borderRadius: '40px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
        {(settings?.trustFeatures && settings.trustFeatures.length > 0 ? settings.trustFeatures : [
          { icon: 'Sparkles', title: 'Traditional Recipes', description: 'Handed down through generations, cooked with authentic Godavari spices, sun-dried ingredients, and traditional cold-pressed oils.' },
          { icon: 'Leaf', title: '100% Natural & Pure', description: 'No chemical preservatives, zero artificial colors, and no MSG. We only pack pure, wholesome flavor inspired by nature.' },
          { icon: 'Truck', title: 'Express Fresh Delivery', description: 'Directly shipped from our kitchen in Visakhapatnam to your home. Double-sealed premium glass jars ensure freshness.' }
        ]).map((feature: any, idx: number) => {
          let IconComponent = ShieldCheck;
          if (feature.icon === 'Leaf') IconComponent = Star;
          else if (feature.icon === 'Truck') IconComponent = Clock;
          
          const colors = ['#2d5a27', '#d97706', '#2563eb'];
          const bgs = ['#f0f7f0', '#fef3c7', '#eff6ff'];

          return (
            <div key={idx} style={{ textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', background: bgs[idx % 3], borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: colors[idx % 3] }}>
                <IconComponent size={24} />
              </div>
              <h4 style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b', marginBottom: '8px' }}>{feature.title}</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{feature.description}</p>
            </div>
          );
        })}
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

