'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function Home() {
  const [sliders, setSliders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    fetch('/api/sliders').then(res => res.json()).then(setSliders);
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/products').then(res => res.json()).then(data => {
      setTopSelling(data.filter((p: any) => p.isTopSelling).slice(0, 4));
    });
  }, []);

  return (
    <div>
      {/* Dynamic Slider */}
      <section className="hero" style={{ padding: 0, height: '500px', position: 'relative' }}>
        {sliders.length > 0 ? (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <img src={sliders[0].image} alt={sliders[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white', textAlign: 'center' }}>
              <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>{sliders[0].title}</h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{sliders[0].subtitle}</p>
              <Link href="/products" className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>Shop Now</Link>
            </div>
          </div>
        ) : (
          <div className="container animate-fade-in" style={{ padding: '6rem 0' }}>
            <h1 className="text-4xl text-primary" style={{ marginBottom: '1rem', fontSize: '3.5rem' }}>Kanvi Pickles</h1>
            <p className="text-2xl text-muted" style={{ marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>Experience the authentic taste of tradition.</p>
            <Link href="/products" className="btn btn-primary">Explore All</Link>
          </div>
        )}
      </section>

      {/* Dynamic Categories */}
      <section className="container" style={{ padding: '4rem 20px' }}>
        <h2 className="text-4xl text-center" style={{ marginBottom: '3rem' }}>Shop by Category</h2>
        <div className="grid grid-cols-4 gap-8">
          {categories.map((cat: any) => (
            <Link href={`/products?category=${cat.name}`} key={cat._id} className="card text-center" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{cat.icon}</div>
              <h3 className="text-2xl">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Top Selling Section */}
      <section style={{ background: 'var(--secondary)', padding: '6rem 20px' }}>
        <div className="container">
          <h2 className="text-4xl text-center" style={{ marginBottom: '4rem' }}>Our Top Selling Delicacies</h2>
          <div className="grid grid-cols-4 gap-8">
            {topSelling.map((p: any) => (
              <div key={p._id} className="card product-card" style={{ background: 'white' }}>
                <Link href={`/products/${p._id}`}>
                  <div className="product-img-wrapper" style={{ height: '250px', overflow: 'hidden', borderRadius: '8px', marginBottom: '1.5rem' }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ marginBottom: '0.5rem' }}>{p.name}</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-primary font-bold text-xl">₹{p.price}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>250g / 500g</span>
                  </div>
                </Link>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.5rem', borderRadius: '50px' }}
                  onClick={() => {
                    addItem({ id: p._id, name: p.name, price: p.price, image: p.image });
                    toast.success(`${p.name} added to cart`);
                  }}
                >Add to Cart</button>
              </div>
            ))}
          </div>
          <div className="flex justify-center" style={{ marginTop: '4rem' }}>
            <Link href="/products" className="btn btn-outline" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>View All Products</Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ background: 'var(--primary)', color: 'white', padding: '6rem 20px' }}>
        <div className="container grid grid-cols-3 gap-12 text-center">
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🏺</div>
            <h3 className="text-2xl mb-4">Traditional Recipes</h3>
          </div>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🌿</div>
            <h3 className="text-2xl mb-4">100% Natural</h3>
          </div>
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🚀</div>
            <h3 className="text-2xl mb-4">Express Delivery</h3>
          </div>
        </div>
      </section>
    </div>
  );
}
