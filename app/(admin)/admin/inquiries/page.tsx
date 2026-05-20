'use client';
import { useState, useEffect } from 'react';
import { MessageSquare, User, Phone, Mail, Clock } from 'lucide-react';

export default function AdminInquiries() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contact')
      .then(res => res.json())
      .then(data => {
        setMessages(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading inquiries...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <div style={{ width: '3rem', height: '3rem', background: '#f0f7f0', color: '#2d5a27', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MessageSquare size={24} />
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>Customer Inquiries</h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px solid #f1f5f9', color: '#94a3b8' }}>
            No inquiries received yet.
          </div>
        ) : (
          messages.map((m: any) => (
            <div key={m._id} style={{ background: 'white', padding: '30px', borderRadius: '32px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #f8fafc', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} color="#94a3b8" />
                    <span style={{ fontWeight: '800', color: '#1e293b' }}>{m.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} color="#94a3b8" />
                    <span style={{ fontWeight: '700', color: '#64748b' }}>{m.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} color="#94a3b8" />
                    <span style={{ fontWeight: '700', color: '#64748b' }}>{m.email}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '700' }}>
                  <Clock size={14} />
                  {new Date(m.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2d5a27', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Subject: {m.subject}</h4>
                <p style={{ color: '#334155', lineHeight: 1.6, fontWeight: '500' }}>{m.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

