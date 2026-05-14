'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="container" style={{ padding: '4rem 20px', textAlign: 'center' }}>Loading categories...</div>;

  return (
    <div className="container" style={{ padding: '4rem 20px' }}>
      <h1 className="text-5xl text-center" style={{ marginBottom: '4rem' }}>Our Traditional Categories</h1>
      <div className="grid grid-cols-4 gap-8">
        {categories.map((cat: any) => (
          <Link href={`/products?category=${cat.name}`} key={cat._id} className="card product-card text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>{cat.icon}</div>
            <h2 className="text-3xl font-bold">{cat.name}</h2>
            <p className="text-muted" style={{ marginTop: '1rem' }}>Handcrafted with love</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
