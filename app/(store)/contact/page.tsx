'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send, ShieldCheck, RefreshCw } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dynamic contact info from admin settings
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: ''
  });

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
    setMounted(true);
    generateCaptcha();
    // Fetch contact info from admin settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setContactInfo({
          phone: data.contactPhone || '+91 8247812474',
          email: data.contactEmail || 'support@kanvipickles.com',
          address: data.contactAddress || 'Dabagardense,visakhapatnam, Andhra Pradesh'
        });
      })
      .catch(() => {
        setContactInfo({
          phone: '+91 8247812474',
          email: 'support@kanvipickles.com',
          address: 'Dabagardense,visakhapatnam, Andhra Pradesh'
        });
      });
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

  if (!mounted) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 20px', fontFamily: 'Fraunces, serif' }}>
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1.5rem', fontFamily: 'Fraunces, serif' }}>Get in <span style={{ color: 'var(--primary)' }}>Touch</span></h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Have a question about our pickles or an order? We are here to help!</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 5vw, 60px)' }}>
        {/* Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '40px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '30px', color: 'var(--text-main)', fontFamily: 'Fraunces, serif' }}>Contact Information</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: 'var(--secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Phone size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone</p>
                  <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                    {contactInfo.phone ? (
                      <a href={`tel:${contactInfo.phone.replace(/\s+/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{contactInfo.phone}</a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Not set yet</span>
                    )}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: 'var(--secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Mail size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email</p>
                  <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                    {contactInfo.email ? (
                      <a href={`mailto:${contactInfo.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{contactInfo.email}</a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Not set yet</span>
                    )}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', background: 'var(--secondary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <MapPin size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Location</p>
                  <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', fontSize: '1.1rem' }}>
                    {contactInfo.address || <span style={{ color: 'var(--text-muted)' }}>Not set yet</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ background: 'var(--surface)', padding: '50px', borderRadius: '40px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginLeft: '4px' }}>Name</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', outline: 'none', fontWeight: '600' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginLeft: '4px' }}>Email</label>
                <input required type="email" style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', outline: 'none', fontWeight: '600' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginLeft: '4px' }}>Phone</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', outline: 'none', fontWeight: '600' }} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Mobile Number" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginLeft: '4px' }}>Subject</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', outline: 'none', fontWeight: '600' }} value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="How can we help?" />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginLeft: '4px' }}>Message</label>
              <textarea required style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', outline: 'none', fontWeight: '600', minHeight: '120px', resize: 'none' }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Your inquiry..." />
            </div>

            {/* MATH CAPTCHA SECTION */}
            <div style={{ background: 'var(--background)', padding: '20px', borderRadius: '24px', border: '2px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontWeight: '800' }}>
                  <ShieldCheck size={18} color="var(--primary)" />
                  <span>Security Verification</span>
                </div>
                <button type="button" onClick={generateCaptcha} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', fontWeight: '700' }}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--primary)', background: 'var(--surface)', padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  {captcha.num1} + {captcha.num2} = ?
                </div>
                <input
                  required
                  type="number"
                  value={captcha.userAnswer}
                  onChange={e => setCaptcha({ ...captcha, userAnswer: e.target.value })}
                  placeholder="Answer"
                  style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-main)', outline: 'none', fontWeight: '800', fontSize: '1.1rem', textAlign: 'center' }}
                />
              </div>
            </div>

            <button disabled={loading} style={{ background: 'var(--text-main)', color: 'var(--background)', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '10px', boxShadow: 'var(--shadow)', opacity: loading ? 0.7 : 1 }}>
              <Send size={20} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

