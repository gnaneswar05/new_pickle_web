'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  CreditCard, 
  ShieldCheck, 
  Info, 
  FileText, 
  Save, 
  Globe,
  ImageIcon,
  Type,
  Upload
} from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('financial');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    cgst: 0, sgst: 0, igst: 0, platformFee: 0, maxCodAmount: 2000,
    razorpayKeyId: '', razorpayKeySecret: '', isCodEnabled: true, isRazorpayEnabled: true,
    aboutUs: '', termsConditions: '', cancellationPolicy: '', refundPolicy: '', privacyPolicy: '',
    defaultProductImage: '',
    topBannerText: 'Authentic Godavari • Global Shipping Available',
    contactPhone: '', contactEmail: '', contactAddress: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ ...form, defaultProductImage: data.url });
        toast.success('Image uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(data => {
      setForm({
        cgst: data.cgst || 0, sgst: data.sgst || 0, igst: data.igst || 0,
        platformFee: data.platformFee || 0, maxCodAmount: data.maxCodAmount || 2000,
        razorpayKeyId: data.razorpayKeyId || '', razorpayKeySecret: data.razorpayKeySecret || '',
        isCodEnabled: data.isCodEnabled ?? true, isRazorpayEnabled: data.isRazorpayEnabled ?? true,
        aboutUs: data.aboutUs || '', termsConditions: data.termsConditions || '',
        cancellationPolicy: data.cancellationPolicy || '', refundPolicy: data.refundPolicy || '',
        privacyPolicy: data.privacyPolicy || '',
        defaultProductImage: data.defaultProductImage || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000',
        topBannerText: data.topBannerText || 'Authentic Godavari • Global Shipping Available',
        contactPhone: data.contactPhone || '',
        contactEmail: data.contactEmail || '',
        contactAddress: data.contactAddress || ''
      });
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) toast.success('Settings updated!');
    else toast.error('Update failed');
  };

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Initializing...</div>;

  const tabs = [
    { id: 'financial', name: 'Financials', icon: CreditCard },
    { id: 'payment', name: 'Payments', icon: ShieldCheck },
    { id: 'content', name: 'Brand & Media', icon: Info },
    { id: 'legal', name: 'Legal Policies', icon: FileText },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem', fontFamily: 'Fraunces, serif' }}>
      <style>{`
        .settings-container { display: flex; gap: 2rem; margin-top: 3rem; align-items: flex-start; }
        .tab-btn { 
          display: flex; align-items: center; gap: 1rem; width: 100%; padding: 1.25rem 1.5rem; 
          border-radius: 20px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s;
          background: transparent; color: #94a3b8; text-align: left;
        }
        .tab-btn.active { background: white; color: #2d5a27; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .settings-card { 
          background: white; border-radius: 40px; padding: 40px; flex: 1; min-height: 500px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;
        }
        .input-group { margin-bottom: 25px; }
        .input-label { display: block; font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        .custom-input { 
          width: 100%; padding: 16px 20px; border-radius: 16px; border: 2px solid #f1f5f9; 
          outline: none; transition: all 0.2s; font-size: 1rem; background: #f8fafc; font-weight: 600;
        }
        .custom-input:focus { border-color: #2d5a27; background: white; box-shadow: 0 10px 15px -3px rgba(45, 90, 39, 0.05); }
        .toggle-card { 
          padding: 20px; border-radius: 24px; border: 2px solid #f1f5f9; cursor: pointer; transition: all 0.2s;
          display: flex; justify-content: space-between; align-items: center;
        }
        .toggle-card.active { border-color: #2d5a27; background: #f0fdf4; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Fraunces, serif' }}>System <span style={{ color: '#2d5a27' }}>Settings</span></h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: '500' }}>Global configuration for the Kanvi Pickles platform.</p>
        </div>
        <button onClick={() => handleSubmit()} style={{ background: '#2d5a27', color: 'white', padding: '16px 35px', borderRadius: '20px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(45, 90, 39, 0.2)' }}>
          <Save size={20} /> Save Changes
        </button>
      </div>

      <div className="settings-container">
        {/* Sidebar */}
        <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}>
              <tab.icon size={20} /> {tab.name}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="settings-card">
          {activeTab === 'financial' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '30px', color: '#1e293b' }}>Financial Configuration</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="input-group">
                  <label className="input-label">CGST (%)</label>
                  <input type="number" step="0.01" className="custom-input" value={form.cgst} onChange={e => setForm({...form, cgst: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label className="input-label">SGST (%)</label>
                  <input type="number" step="0.01" className="custom-input" value={form.sgst} onChange={e => setForm({...form, sgst: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Platform Fee (₹)</label>
                  <input type="number" step="0.1" className="custom-input" value={form.platformFee} onChange={e => setForm({...form, platformFee: Number(e.target.value)})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Max COD Amount (₹)</label>
                  <input type="number" className="custom-input" value={form.maxCodAmount} onChange={e => setForm({...form, maxCodAmount: Number(e.target.value)})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '30px', color: '#1e293b' }}>Payment Gateways</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div className={`toggle-card ${form.isCodEnabled ? 'active' : ''}`} onClick={() => setForm({...form, isCodEnabled: !form.isCodEnabled})}>
                  <p style={{ margin: 0, fontWeight: '800', color: form.isCodEnabled ? '#142911' : '#64748b' }}>Cash on Delivery</p>
                  <div style={{ width: '44px', height: '24px', background: form.isCodEnabled ? '#2d5a27' : '#cbd5e1', borderRadius: '12px', position: 'relative', transition: '0.2s' }}>
                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', transition: '0.2s', left: form.isCodEnabled ? '23px' : '3px' }}></div>
                  </div>
                </div>
                <div className={`toggle-card ${form.isRazorpayEnabled ? 'active' : ''}`} onClick={() => setForm({...form, isRazorpayEnabled: !form.isRazorpayEnabled})}>
                  <p style={{ margin: 0, fontWeight: '800', color: form.isRazorpayEnabled ? '#142911' : '#64748b' }}>Razorpay Online</p>
                  <div style={{ width: '44px', height: '24px', background: form.isRazorpayEnabled ? '#2d5a27' : '#cbd5e1', borderRadius: '12px', position: 'relative', transition: '0.2s' }}>
                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', transition: '0.2s', left: form.isRazorpayEnabled ? '23px' : '3px' }}></div>
                  </div>
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Razorpay Key ID</label>
                <input className="custom-input" placeholder="rzp_live_..." value={form.razorpayKeyId} onChange={e => setForm({...form, razorpayKeyId: e.target.value})} />
              </div>
              <div className="input-group">
                <label className="input-label">Razorpay Key Secret</label>
                <input type="password" className="custom-input" placeholder="••••••••••••" value={form.razorpayKeySecret} onChange={e => setForm({...form, razorpayKeySecret: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '30px', color: '#1e293b' }}>Brand Assets & Content</h2>
              
              {/* DYNAMIC BANNER TEXT ADDED HERE */}
              <div className="input-group" style={{ background: '#f0f7f0', padding: '25px', borderRadius: '24px', border: '2px solid #d1fae5', marginBottom: '35px' }}>
                <label className="input-label" style={{ color: '#2d5a27', display: 'flex', alignItems: 'center', gap: '8px' }}><Type size={16} /> Top Announcement Banner</label>
                <input className="custom-input" style={{ borderColor: '#d1fae5' }} value={form.topBannerText} onChange={e => setForm({...form, topBannerText: e.target.value})} placeholder="e.g. Free shipping on orders above ₹1000" />
                <p style={{ margin: '12px 0 0 0', fontSize: '0.75rem', color: '#2d5a27', fontWeight: '700' }}>This text appears at the very top of every page in your store.</p>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={16} /> Default Product Image</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input className="custom-input" value={form.defaultProductImage} onChange={e => setForm({...form, defaultProductImage: e.target.value})} placeholder="https://..." />
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', border: '2px solid #e2e8f0', padding: '0 15px', borderRadius: '16px', cursor: 'pointer', color: '#64748b', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#2d5a27'} onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                    <Upload size={20} />
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {uploading && <p style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '5px' }}>Uploading...</p>}
                {form.defaultProductImage && <img src={form.defaultProductImage} alt="Preview" style={{ marginTop: '15px', width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #f1f5f9' }} />}
              </div>
              
              <div className="input-group">
                <label className="input-label">About Us</label>
                <textarea className="custom-input" style={{ minHeight: '180px', resize: 'none' }} value={form.aboutUs} onChange={e => setForm({...form, aboutUs: e.target.value})} />
              </div>

              {/* CONTACT INFORMATION */}
              <div style={{ background: '#f0f7f0', padding: '25px', borderRadius: '24px', border: '2px solid #d1fae5', marginTop: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', color: '#2d5a27', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>📞 Contact Information (shown on Contact Us page)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="input-group">
                    <label className="input-label">Phone Number</label>
                    <input className="custom-input" placeholder="+91 98765 43210" value={form.contactPhone} onChange={e => setForm({...form, contactPhone: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input type="email" className="custom-input" placeholder="support@kanvipickles.com" value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} />
                  </div>
                </div>
                <div className="input-group">
                  <label className="input-label">Address / Location</label>
                  <input className="custom-input" placeholder="e.g. Godavari Region, Andhra Pradesh" value={form.contactAddress} onChange={e => setForm({...form, contactAddress: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '30px', color: '#1e293b' }}>Compliance & Legal</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="input-group">
                  <label className="input-label">Terms & Conditions</label>
                  <textarea className="custom-input" style={{ minHeight: '300px', resize: 'none' }} value={form.termsConditions} onChange={e => setForm({...form, termsConditions: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Privacy Policy</label>
                  <textarea className="custom-input" style={{ minHeight: '300px', resize: 'none' }} value={form.privacyPolicy} onChange={e => setForm({...form, privacyPolicy: e.target.value})} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

