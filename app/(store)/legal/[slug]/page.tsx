'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function LegalPage() {
  const { slug } = useParams();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (slug === 'terms') {
          setContent(data.termsConditions);
          setTitle('Terms & Conditions');
        } else if (slug === 'privacy') {
          setContent(data.privacyPolicy);
          setTitle('Privacy Policy');
        } else if (slug === 'cancellation') {
          setContent(data.cancellationPolicy);
          setTitle('Cancellation Policy');
        } else if (slug === 'refund') {
          setContent(data.refundPolicy);
          setTitle('Refund Policy');
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <div className="container p-20 text-center">Loading policies...</div>;

  return (
    <div className="container" style={{ padding: '6rem 20px', maxWidth: '900px' }}>
      <h1 className="text-4xl font-bold mb-10 text-slate-800">{title}</h1>
      <div className="card" style={{ padding: '3rem', lineHeight: '1.6', color: '#555', whiteSpace: 'pre-wrap' }}>
        {content || `The ${title} is currently being updated. Please check back later.`}
      </div>
    </div>
  );
}
