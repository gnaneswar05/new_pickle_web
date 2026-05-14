'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import { ShoppingBasket, Star, ShieldCheck, Clock } from 'lucide-react';

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
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
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '1.25rem', fontWeight: '600' }}>
        Curating our handcrafted collections...
      </div>
    );
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
          {['All', 'Mango', 'Garlic', 'Tomato', 'Veg', 'Non-Veg'].map((cat) => (
            <Link 
              key={cat}
              href={cat === 'All' ? '/products' : `/products?category=${cat}`}
              style={{
                padding: '12px 24px',
                borderRadius: '14px',
                fontSize: '0.875rem',
                fontWeight: '800',
                textDecoration: 'none',
                transition: 'all 0.2s',
                background: (category === cat || (cat === 'All' && !category)) ? '#059669' : '#white',
                color: (category === cat || (cat === 'All' && !category)) ? 'white' : '#64748b',
                border: '1px solid',
                borderColor: (category === cat || (cat === 'All' && !category)) ? '#059669' : '#e2e8f0',
                boxShadow: (category === cat || (cat === 'All' && !category)) ? '0 10px 15px -3px rgba(5, 150, 105, 0.2)' : 'none'
              }}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', background: '#f8fafc', borderRadius: '40px', border: '2px dashed #e2e8f0' }}>
          <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#94a3b8' }}>No pickles found in this collection yet.</p>
          <Link href="/products" style={{ color: '#059669', fontWeight: '800', marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}>View All Products →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '40px' }}>
          {filteredProducts.map((p: any) => (
            <div key={p._id} style={{ background: 'white', borderRadius: '32px', padding: '16px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', transition: 'all 0.3s' }}>
              <Link href={`/product/${p._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#f1f5f9', marginBottom: '20px', aspectRatio: '1/1' }}>
                  <img 
                    src={p.image || 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800'} 
                    alt={p.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', padding: '6px 12px', borderRadius: '99px', fontSize: '10px', fontWeight: '800', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {p.category}
                  </div>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px', fontFamily: 'Playfair Display, serif' }}>{p.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={12} fill="#f59e0b" color="#f59e0b" />)}
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '700', marginLeft: '4px' }}>(4.9/5)</span>
                </div>
                <p style={{ fontSize: '1.75rem', fontWeight: '900', color: '#059669', marginBottom: '24px' }}>₹{(p.price || 0).toFixed(2)}</p>
              </Link>
              
              <button 
                style={{ marginTop: 'auto', width: '100%', padding: '16px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '18px', fontWeight: '800', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                onClick={() => {
                  addItem({ id: p._id, name: p.name, price: p.price, image: p.image || '' });
                  toast.success(`${p.name} added to cart`);
                }}
              >
                <ShoppingBasket size={18} /> Add to Basket
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Trust Section */}
      <div style={{ marginTop: '100px', padding: '60px', background: 'white', borderRadius: '40px', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: '#ecfdf5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#059669' }}>
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
