'use client';
import { useEffect, useState } from 'react';
import { Heart, Target, Users, Award, ShieldCheck, Leaf, Sparkles, Truck } from 'lucide-react';

export default function AboutPage() {
  const [content, setContent] = useState('');
  const [mission, setMission] = useState('');
  const [trustFeatures, setTrustFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setContent(data.aboutUs);
        setMission(data.ourMission);
        setTrustFeatures(data.trustFeatures || []);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTopColor: '#2d5a27', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: 'Fraunces, serif', color: '#1e293b' }}>
      {/* Hero Section */}
      <section style={{ background: '#0f172a', color: 'white', padding: '120px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, background: 'radial-gradient(circle at center, #2d5a27 0%, transparent 70%)' }}></div>
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 4.5rem)', fontWeight: '900', fontFamily: 'Fraunces, serif', marginBottom: '20px' }}>Our <span style={{ color: '#2d5a27' }}>Story</span></h1>
          <p style={{ fontSize: '1.25rem', color: '#94a3b8', lineHeight: 1.6 }}>Bringing the authentic, sun-dried flavors of the Godavaccccccccccri delta to the global stage.</p>
        </div>
      </section>

      {/* Story & Mission Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '80px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0f7f0', color: '#2d5a27', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '25px' }}>
              <Heart size={16} /> Our Story
            </div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '30px', fontFamily: 'Fraunces, serif' }}>Handcrafted with Love for Generations</h2>
            <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#64748b', whiteSpace: 'pre-wrap' }}>
              {content || "Kanvi Pickles began as a small family kitchen in the heart of Godavari. We take pride in our age-old recipes, where every jar is a labor of love, sun-dried to perfection and spiced with care."}
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '60px', borderRadius: '50px', border: '1px solid #f1f5f9' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '25px' }}>
              <Target size={16} /> Our Mission
            </div>
            <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '20px', fontFamily: 'Fraunces, serif' }}>Taste the Tradition</h3>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#64748b', marginBottom: '30px' }}>
              {mission || "Our mission is to preserve the authentic flavors of Godavari and deliver them to pickle lovers across the globe. We believe in quality without compromise, using only the finest ingredients sourced directly from local farmers."}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', fontWeight: '700' }}>
                <ShieldCheck size={20} color="#2d5a27" /> 100% Pure & Preservative Free
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', fontWeight: '700' }}>
                <Leaf size={20} color="#2d5a27" /> Sustainably Sourced Ingredients
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', fontWeight: '700' }}>
                <Award size={20} color="#2d5a27" /> Traditional Stone-Ground Spices
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section style={{ background: '#f1f5f9', padding: '100px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '900', fontFamily: 'Fraunces, serif' }}>Why Pickle Lovers <span style={{ color: '#2d5a27' }}>Trust Us</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
            {(trustFeatures && trustFeatures.length > 0 ? trustFeatures : [
              { icon: 'Sparkles', title: 'Traditional Recipes', description: 'Handed down through generations, cooked with authentic Godavari spices, sun-dried ingredients, and traditional cold-pressed oils.' },
              { icon: 'Leaf', title: '100% Natural & Pure', description: 'No chemical preservatives, zero artificial colors, and no MSG. We only pack pure, wholesome flavor inspired by nature.' },
              { icon: 'Truck', title: 'Express Fresh Delivery', description: 'Directly shipped from our kitchen in Visakhapatnam to your home. Double-sealed premium glass jars ensure freshness.' }
            ]).map((item: any, i: number) => {
              const IconComponent = item.icon === 'Leaf' ? Leaf : item.icon === 'Truck' ? Truck : Sparkles;
              const colors = ['#2d5a27', '#2563eb', '#ca8a04'];
              const bgs = ['#f0f7f0', '#eff6ff', '#fef8e6'];
              return (
                <div key={i} style={{ background: 'white', padding: '40px', borderRadius: '32px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <div style={{ width: '64px', height: '64px', background: bgs[i % 3], color: colors[i % 3], borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' }}>
                    <IconComponent size={30} />
                  </div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '15px' }}>{item.title}</h4>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

