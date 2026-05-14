'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="container" style={{ padding: '8rem 20px', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 className="text-4xl text-primary" style={{ marginBottom: '1rem' }}>Order Confirmed!</h1>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>
          Thank you for your order. We're preparing your delicious pickles and will ship them soon.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {orderId && (
            <Link href={`/track/${orderId}`} className="btn btn-primary">
              Track Order
            </Link>
          )}
          <Link href="/products" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '8rem 20px', textAlign: 'center' }}>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
