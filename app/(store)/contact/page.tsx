'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  // CAPTCHA State
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, userAnswer: '' });
  
  const generateCaptcha = () => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1,
      userAnswer: ''
    });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate CAPTCHA
    if (parseInt(captcha.userAnswer) !== (captcha.num1 + captcha.num2)) {
      toast.error('Incorrect CAPTCHA answer. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success('Message sent! We will contact you soon.');
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
        generateCaptcha();
      } else {
        toast.error('Failed to send message');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '1.5rem', fontFamily: 'Playfair Display, serif' }}>Get in <span style={{ color: '#480D18' }}>Touch</span></h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>Have a question about our heritage pickles or an order? We are here to help!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px' }}>
        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '40px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '30px', color: '#1e293b', fontFamily: 'Playfair Display, serif' }}>Contact Information</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: '#ecfdf5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#480D18' }}>
                  <Phone size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Phone</p>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '1.1rem' }}>+91 98765 43210</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Email</p>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '1.1rem' }}>support@kanvipickles.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: '#fff1f2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Location</p>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', fontSize: '1.1rem' }}>Godavari Region, Andhra Pradesh</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: 'white', padding: '50px', borderRadius: '40px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginLeft: '4px' }}>Name</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full Name" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginLeft: '4px' }}>Email</label>
                <input required type="email" style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginLeft: '4px' }}>Phone</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Mobile Number" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginLeft: '4px' }}>Subject</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="How can we help?" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginLeft: '4px' }}>Message</label>
              <textarea required style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600', minHeight: '120px', resize: 'none' }} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Your inquiry..." />
            </div>

            {/* MATH CAPTCHA SECTION */}
            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '24px', border: '2px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b', fontWeight: '800' }}>
                  <ShieldCheck size={18} color="#480D18" />
                  <span>Security Verification</span>
                </div>
                <button type="button" onClick={generateCaptcha} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '700' }}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#480D18', background: 'white', padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  {captcha.num1} + {captcha.num2} = ?
                </div>
                <input 
                  required
                  type="number" 
                  value={captcha.userAnswer} 
                  onChange={e => setCaptcha({...captcha, userAnswer: e.target.value})}
                  placeholder="Answer"
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', outline: 'none', fontWeight: '800', fontSize: '1.1rem', textAlign: 'center' }}
                />
              </div>
            </div>

            <button disabled={loading} style={{ background: '#0f172a', color: 'white', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)', opacity: loading ? 0.7 : 1 }}>
              <Send size={20} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

