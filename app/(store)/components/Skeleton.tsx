'use client';
import React from 'react';

export function Skeleton({ width, height, borderRadius = '8px', style }: { width?: string | number, height?: string | number, borderRadius?: string, style?: React.CSSProperties }) {
  return (
    <div 
      className="skeleton" 
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width || '100%', 
        height: typeof height === 'number' ? `${height}px` : height || '20px', 
        borderRadius,
        ...style 
      }} 
    />
  );
}

export function HeroSkeleton() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '120px 20px', background: '#0f172a', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap', width: '100%' }}>
        {/* Left Side: Text / Info */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Skeleton width="220px" height="36px" borderRadius="30px" />
          <Skeleton width="90%" height="80px" borderRadius="16px" />
          <Skeleton width="70%" height="80px" borderRadius="16px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            <Skeleton width="100%" height="20px" />
            <Skeleton width="80%" height="20px" />
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '30px' }}>
            <Skeleton width="180px" height="66px" borderRadius="30px" />
            <Skeleton width="150px" height="66px" borderRadius="30px" />
          </div>
        </div>
        
        {/* Right Side: Image Card */}
        <div style={{ flex: '1 1 500px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '450px', aspectRatio: '4/5', borderRadius: '48px', overflow: 'hidden', transform: 'rotate(2deg)' }}>
            <Skeleton width="100%" height="100%" borderRadius="48px" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryItemSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
      <div style={{
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        overflow: 'hidden',
        border: '6px solid var(--surface)',
        boxShadow: 'var(--shadow)',
      }}>
        <Skeleton width="100%" height="100%" borderRadius="50%" />
      </div>
      <Skeleton width="100px" height="24px" borderRadius="8px" />
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Image box */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
        <Skeleton width="100%" height="100%" borderRadius="0px" />
      </div>
      {/* Content box */}
      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="80px" height="20px" borderRadius="10px" />
          <Skeleton width="60px" height="20px" borderRadius="10px" />
        </div>
        <Skeleton width="90%" height="24px" borderRadius="8px" style={{ marginTop: '4px' }} />
        <Skeleton width="60%" height="16px" borderRadius="6px" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
          <Skeleton width="80px" height="28px" borderRadius="8px" />
          <Skeleton width="40px" height="40px" borderRadius="12px" />
        </div>
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
        <Skeleton width="180px" height="20px" borderRadius="4px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '80px' }}>
        {/* Left: Image Skeleton */}
        <div>
          <div style={{ position: 'relative', borderRadius: '40px', overflow: 'hidden', backgroundColor: 'var(--surface)', border: '8px solid var(--surface)', boxShadow: 'var(--shadow)', aspectRatio: '1/1' }}>
            <Skeleton width="100%" height="100%" borderRadius="0px" />
          </div>
        </div>

        {/* Right: Info Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '32px' }}>
            <Skeleton width="100px" height="14px" borderRadius="4px" style={{ marginBottom: '8px' }} />
            <Skeleton width="85%" height="56px" borderRadius="12px" style={{ marginBottom: '16px' }} />
            <Skeleton width="220px" height="22px" borderRadius="6px" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
            <Skeleton width="160px" height="50px" borderRadius="10px" />
            <Skeleton width="100px" height="28px" borderRadius="8px" />
          </div>

          {/* Weight Selection Skeleton */}
          <div style={{ marginBottom: '40px' }}>
            <Skeleton width="120px" height="14px" borderRadius="4px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '12px' }}>
              <Skeleton width="100%" height="70px" borderRadius="16px" style={{ flex: 1 }} />
              <Skeleton width="100%" height="70px" borderRadius="16px" style={{ flex: 1 }} />
              <Skeleton width="100%" height="70px" borderRadius="16px" style={{ flex: 1 }} />
            </div>
          </div>

          {/* Description Paragraph Skeleton */}
          <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton width="100%" height="18px" borderRadius="4px" />
            <Skeleton width="100%" height="18px" borderRadius="4px" />
            <Skeleton width="75%" height="18px" borderRadius="4px" />
          </div>

          {/* Action Buttons Skeleton */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '48px' }}>
            <Skeleton width="130px" height="55px" borderRadius="16px" />
            <Skeleton width="100%" height="55px" borderRadius="20px" style={{ flex: 1 }} />
          </div>

          {/* Trust Factors Skeleton */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', paddingTop: '40px', borderTop: '2px solid var(--border)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Skeleton width="24px" height="24px" borderRadius="50%" />
              <Skeleton width="60px" height="12px" borderRadius="4px" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Skeleton width="24px" height="24px" borderRadius="50%" />
              <Skeleton width="65px" height="12px" borderRadius="4px" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Skeleton width="24px" height="24px" borderRadius="50%" />
              <Skeleton width="60px" height="12px" borderRadius="4px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '40px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow)', marginBottom: '25px' }}>
      {/* Card Header Skeleton */}
      <div style={{ padding: '30px 40px', borderBottom: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', background: 'var(--secondary)' }}>
        <div style={{ display: 'flex', gap: '30px' }}>
          <div>
            <Skeleton width="80px" height="12px" style={{ marginBottom: '6px' }} />
            <Skeleton width="100px" height="16px" />
          </div>
          <div>
            <Skeleton width="80px" height="12px" style={{ marginBottom: '6px' }} />
            <Skeleton width="80px" height="16px" />
          </div>
          <div>
            <Skeleton width="60px" height="12px" style={{ marginBottom: '6px' }} />
            <Skeleton width="100px" height="16px" />
          </div>
        </div>
        <div>
          <Skeleton width="60px" height="12px" style={{ marginBottom: '6px' }} />
          <Skeleton width="140px" height="16px" />
        </div>
      </div>

      {/* Items Section Skeleton */}
      <div style={{ padding: '30px 40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Skeleton width="60px" height="60px" borderRadius="14px" />
          <div style={{ flex: 1 }}>
            <Skeleton width="180px" height="18px" style={{ marginBottom: '6px' }} />
            <Skeleton width="120px" height="14px" />
          </div>
          <Skeleton width="80px" height="38px" borderRadius="12px" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Fraunces, serif' }}>
      {/* Header Area Skeleton */}
      <div style={{ marginBottom: '60px' }}>
        <Skeleton width="300px" height="48px" style={{ marginBottom: '12px' }} />
        <Skeleton width="220px" height="20px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
        {/* Wallet Card Skeleton */}
        <div style={{ background: '#0d0707', borderRadius: '40px', padding: '40px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Skeleton width="56px" height="56px" borderRadius="18px" />
          <Skeleton width="150px" height="14px" />
          <Skeleton width="220px" height="56px" />
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <Skeleton width="100%" height="50px" borderRadius="18px" style={{ flex: 1 }} />
            <Skeleton width="100%" height="50px" borderRadius="18px" style={{ flex: 1 }} />
          </div>
        </div>

        {/* Orders Card Skeleton */}
        <div style={{ background: 'var(--surface)', borderRadius: '40px', padding: '40px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Skeleton width="56px" height="56px" borderRadius="18px" />
          <Skeleton width="180px" height="28px" />
          <Skeleton width="250px" height="18px" />
          <Skeleton width="150px" height="24px" style={{ marginTop: 'auto' }} />
        </div>
      </div>
    </div>
  );
}

export function TrackSkeleton() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '40px' }}>
        <Skeleton width="150px" height="20px" borderRadius="4px" />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '50px' }}>
        <div>
          <Skeleton width="300px" height="48px" style={{ marginBottom: '12px' }} />
          <Skeleton width="180px" height="20px" />
        </div>
        <Skeleton width="120px" height="45px" borderRadius="18px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '50px' }}>
        {/* Timeline Skeleton */}
        <div style={{ background: 'var(--surface)', padding: '50px 40px', borderRadius: '40px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <Skeleton width="180px" height="28px" style={{ marginBottom: '10px' }} />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '20px' }}>
              <Skeleton width="50px" height="50px" borderRadius="50%" />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Skeleton width="150px" height="20px" />
                <Skeleton width="100%" height="16px" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Columns: Receipt & Destination Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '40px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Skeleton width="150px" height="24px" />
            <Skeleton width="100%" height="20px" />
            <Skeleton width="100%" height="20px" />
            <Skeleton width="100%" height="20px" />
            <Skeleton width="100%" height="60px" />
          </div>

          <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '40px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <Skeleton width="120px" height="24px" />
            <Skeleton width="180px" height="20px" />
            <Skeleton width="100%" height="16px" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutSkeleton() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <div style={{ marginBottom: '60px' }}>
        <Skeleton width="350px" height="48px" style={{ marginBottom: '12px' }} />
        <Skeleton width="250px" height="20px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '50px' }}>
        {/* Left Form Skeleton */}
        <div style={{ background: 'var(--surface)', padding: '50px', borderRadius: '48px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <Skeleton width="180px" height="30px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Skeleton width="100%" height="56px" borderRadius="18px" />
            <div style={{ display: 'flex', gap: '20px' }}>
              <Skeleton width="50%" height="56px" borderRadius="18px" style={{ flex: 1 }} />
              <Skeleton width="50%" height="56px" borderRadius="18px" style={{ flex: 1 }} />
            </div>
            <Skeleton width="100%" height="56px" borderRadius="18px" />
            <Skeleton width="100%" height="120px" borderRadius="20px" />
          </div>
        </div>

        {/* Right Info Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <Skeleton width="100%" height="110px" borderRadius="32px" />
          <div style={{ background: 'var(--surface)', padding: '50px 40px', borderRadius: '48px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Skeleton width="150px" height="30px" style={{ marginBottom: '10px' }} />
            <Skeleton width="100%" height="20px" />
            <Skeleton width="100%" height="20px" />
            <Skeleton width="100%" height="20px" />
            <Skeleton width="100%" height="60px" style={{ marginTop: '20px' }} />
            <Skeleton width="100%" height="65px" borderRadius="24px" />
          </div>
        </div>
      </div>
    </div>
  );
}
