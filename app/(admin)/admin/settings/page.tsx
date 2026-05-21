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
  Upload,
  Sparkles,
  Lock
} from 'lucide-react';
import { useAdminStore } from '@/lib/adminStore';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('financial');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>({
    cgst: 0, sgst: 0, igst: 0, platformFee: 0, maxCodAmount: 2000,
    productsPerPage: 8,
    razorpayKeyId: '', razorpayKeySecret: '', isCodEnabled: true, isRazorpayEnabled: true,
    aboutUs: '', ourMission: '', termsConditions: '', cancellationPolicy: '', refundPolicy: '', privacyPolicy: '',
    defaultProductImage: '',
    topBannerText: 'Authentic Godavari • Global Shipping Available',
    contactPhone: '', contactEmail: '', contactAddress: '',
    fssaiNumber: '', instagramUrl: '', whatsappUrl: '',
    trustFeatures: [
      { icon: 'Sparkles', title: '', description: '' },
      { icon: 'Leaf', title: '', description: '' },
      { icon: 'Truck', title: '', description: '' }
    ]
  });
  const [uploading, setUploading] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const adminUser = useAdminStore((state) => state.adminUser);

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
        productsPerPage: data.productsPerPage || 8,
        razorpayKeyId: data.razorpayKeyId || '', razorpayKeySecret: data.razorpayKeySecret || '',
        isCodEnabled: data.isCodEnabled ?? true, isRazorpayEnabled: data.isRazorpayEnabled ?? true,
        aboutUs: data.aboutUs || '', 
        ourMission: data.ourMission || '',
        termsConditions: data.termsConditions || '',
        cancellationPolicy: data.cancellationPolicy || '', refundPolicy: data.refundPolicy || '',
        privacyPolicy: data.privacyPolicy || '',
        defaultProductImage: data.defaultProductImage || 'https://images.unsplash.com/photo-1599021419847-d8a7a6ac599d?q=80&w=1000',
        topBannerText: data.topBannerText || 'Authentic Godavari • Global Shipping Available',
        contactPhone: data.contactPhone || '',
        contactEmail: data.contactEmail || '',
        contactAddress: data.contactAddress || '',
        fssaiNumber: data.fssaiNumber || '',
        instagramUrl: data.instagramUrl || '',
        whatsappUrl: data.whatsappUrl || '',
        trustFeatures: data.trustFeatures || [
          { icon: 'Sparkles', title: 'Traditional Recipes', description: 'Handed down through generations, cooked with authentic Godavari spices, sun-dried ingredients, and traditional cold-pressed oils.' },
          { icon: 'Leaf', title: '100% Natural & Pure', description: 'No chemical preservatives, zero artificial colors, and no MSG. We only pack pure, wholesome flavor inspired by nature.' },
          { icon: 'Truck', title: 'Express Fresh Delivery', description: 'Directly shipped from our kitchen in Visakhapatnam to your home. Double-sealed premium glass jars ensure freshness.' }
        ]
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

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUser,
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully!');
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
    setPwLoading(false);
  };

  const tabs = [
    { id: 'financial', name: 'Financial & Shop', icon: CreditCard },
    { id: 'payment', name: 'Payments', icon: ShieldCheck },
    { id: 'content', name: 'Brand & Media', icon: Info },
    { id: 'legal', name: 'Legal Policies', icon: FileText },
    { id: 'extra', name: 'Trust Section', icon: Sparkles },
    { id: 'security', name: 'Security', icon: Lock },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '5rem', fontFamily: 'Fraunces, serif' }}>
      <style>{`
        .settings-container { display: flex; gap: 2rem; margin-top: 3rem; align-items: flex-start; }
        .tab-btn { 
          display: flex; align-items: center; gap: 1rem; width: 100%; padding: 1.25rem 1.5rem; 
          border-radius: 20px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s;
          background: transparent; color: var(--text-muted); text-align: left;
        }
        .tab-btn.active { background: var(--surface); color: var(--primary); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
        .settings-card { 
          background: var(--surface); border-radius: 40px; padding: 40px; flex: 1; min-height: 500px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05); border: 1px solid var(--border);
        }
        .input-group { margin-bottom: 25px; }
        .input-label { display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        .custom-input { 
          width: 100%; padding: 16px 20px; border-radius: 16px; border: 2px solid var(--border); 
          outline: none; transition: all 0.2s; font-size: 1rem; background: var(--background); color: var(--text-main); font-weight: 600;
        }
        .custom-input:focus { border-color: var(--primary); background: var(--surface); box-shadow: 0 10px 15px -3px rgba(220, 38, 38, 0.05); }
        .toggle-card { 
          padding: 20px; border-radius: 24px; border: 2px solid var(--border); cursor: pointer; transition: all 0.2s;
          display: flex; justify-content: space-between; align-items: center;
          background: var(--surface); color: var(--text-main);
        }
        .toggle-card.active { border-color: var(--primary); background: var(--secondary); }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif' }}>System <span style={{ color: 'var(--primary)' }}>Settings</span></h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem', fontWeight: '500' }}>Global configuration for the Kanvi Pickles platform.</p>
        </div>
        <button onClick={() => handleSubmit()} style={{ background: 'var(--primary)', color: 'white', padding: '16px 35px', borderRadius: '20px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)' }}>
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
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '30px', color: 'var(--text-main)' }}>Financial & Storefront Config</h2>
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
                <div className="input-group">
                  <label className="input-label">Products Per Page (Pagination Limit)</label>
                  <input type="number" min="1" className="custom-input" value={form.productsPerPage} onChange={e => setForm({...form, productsPerPage: Math.max(1, parseInt(e.target.value) || 1)})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '30px', color: 'var(--text-main)' }}>Payment Gateways</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                <div className={`toggle-card ${form.isCodEnabled ? 'active' : ''}`} onClick={() => setForm({...form, isCodEnabled: !form.isCodEnabled})}>
                  <p style={{ margin: 0, fontWeight: '800', color: form.isCodEnabled ? 'var(--text-main)' : 'var(--text-muted)' }}>Cash on Delivery</p>
                  <div style={{ width: '44px', height: '24px', background: form.isCodEnabled ? 'var(--primary)' : 'var(--border)', borderRadius: '12px', position: 'relative', transition: '0.2s' }}>
                    <div style={{ width: '18px', height: '18px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', transition: '0.2s', left: form.isCodEnabled ? '23px' : '3px' }}></div>
                  </div>
                </div>
                <div className={`toggle-card ${form.isRazorpayEnabled ? 'active' : ''}`} onClick={() => setForm({...form, isRazorpayEnabled: !form.isRazorpayEnabled})}>
                  <p style={{ margin: 0, fontWeight: '800', color: form.isRazorpayEnabled ? 'var(--text-main)' : 'var(--text-muted)' }}>Razorpay Online</p>
                  <div style={{ width: '44px', height: '24px', background: form.isRazorpayEnabled ? 'var(--primary)' : 'var(--border)', borderRadius: '12px', position: 'relative', transition: '0.2s' }}>
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
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '30px', color: 'var(--text-main)' }}>Brand Assets & Content</h2>
              
              {/* DYNAMIC BANNER TEXT ADDED HERE */}
              <div className="input-group" style={{ background: 'var(--secondary)', padding: '25px', borderRadius: '24px', border: '2px solid var(--border)', marginBottom: '35px' }}>
                <label className="input-label" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}><Type size={16} /> Top Announcement Banner</label>
                <input className="custom-input" style={{ borderColor: 'var(--border)' }} value={form.topBannerText} onChange={e => setForm({...form, topBannerText: e.target.value})} placeholder="e.g. Free shipping on orders above ₹1000" />
                <p style={{ margin: '12px 0 0 0', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>This text appears at the very top of every page in your store.</p>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={16} /> Default Product Image</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input className="custom-input" value={form.defaultProductImage} onChange={e => setForm({...form, defaultProductImage: e.target.value})} placeholder="https://..." />
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '2px solid var(--border)', padding: '0 15px', borderRadius: '16px', cursor: 'pointer', color: 'var(--text-muted)', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                    <Upload size={20} />
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                {uploading && <p style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '5px' }}>Uploading...</p>}
                {form.defaultProductImage && <img src={form.defaultProductImage} alt="Preview" style={{ marginTop: '15px', width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px', border: '1px solid var(--border)' }} />}
              </div>
              
              <div className="input-group">
                <label className="input-label">Our Story (About Us)</label>
                <textarea className="custom-input" style={{ minHeight: '180px', resize: 'none' }} value={form.aboutUs} onChange={e => setForm({...form, aboutUs: e.target.value})} />
              </div>

              <div className="input-group">
                <label className="input-label">Our Mission</label>
                <textarea className="custom-input" style={{ minHeight: '120px', resize: 'none' }} value={form.ourMission} onChange={e => setForm({...form, ourMission: e.target.value})} />
              </div>

              {/* CONTACT & SOCIAL INFORMATION */}
              <div style={{ background: 'var(--secondary)', padding: '25px', borderRadius: '24px', border: '2px solid var(--border)', marginTop: '10px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>📞 Contact & Social Details</h3>
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
                <div className="input-group" style={{ marginBottom: '20px' }}>
                  <label className="input-label">Address / Location</label>
                  <input className="custom-input" placeholder="e.g. Godavari Region, Andhra Pradesh" value={form.contactAddress} onChange={e => setForm({...form, contactAddress: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Instagram URL</label>
                    <input className="custom-input" placeholder="https://instagram.com/kanvipickles" value={form.instagramUrl} onChange={e => setForm({...form, instagramUrl: e.target.value})} />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">WhatsApp URL / Chat Link</label>
                    <input className="custom-input" placeholder="https://wa.me/918247812474" value={form.whatsappUrl} onChange={e => setForm({...form, whatsappUrl: e.target.value})} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '30px', color: 'var(--text-main)' }}>Compliance & Legal</h2>
              <div className="input-group" style={{ marginBottom: '30px', maxWidth: '400px' }}>
                <label className="input-label">FSSAI License Number</label>
                <input className="custom-input" placeholder="e.g. 23324010000854" value={form.fssaiNumber} onChange={e => setForm({...form, fssaiNumber: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                <div className="input-group">
                  <label className="input-label">Terms & Conditions</label>
                  <textarea className="custom-input" style={{ minHeight: '300px', resize: 'none' }} value={form.termsConditions} onChange={e => setForm({...form, termsConditions: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Privacy Policy</label>
                  <textarea className="custom-input" style={{ minHeight: '300px', resize: 'none' }} value={form.privacyPolicy} onChange={e => setForm({...form, privacyPolicy: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Cancellation Policy</label>
                  <textarea className="custom-input" style={{ minHeight: '300px', resize: 'none' }} value={form.cancellationPolicy} onChange={e => setForm({...form, cancellationPolicy: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Refund & Return Policy</label>
                  <textarea className="custom-input" style={{ minHeight: '300px', resize: 'none' }} value={form.refundPolicy} onChange={e => setForm({...form, refundPolicy: e.target.value})} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'extra' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '10px', color: 'var(--text-main)' }}>Homepage Trust Features</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '30px', fontWeight: '500' }}>
                Configure the three highlight cards displayed on the homepage above the footer.
              </p>

              {(form.trustFeatures || []).map((feature: any, index: number) => (
                <div key={index} style={{ background: 'var(--background)', padding: '30px', borderRadius: '24px', border: '2px solid var(--border)', marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✨ Feature Card #{index + 1}
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Icon Name</label>
                      <select 
                        className="custom-input" 
                        value={feature.icon || 'Sparkles'} 
                        onChange={e => {
                          const updated = [...(form.trustFeatures || [])];
                          updated[index] = { ...updated[index], icon: e.target.value };
                          setForm({ ...form, trustFeatures: updated });
                        }}
                      >
                        <option value="Sparkles">Sparkles (Traditional Recipes)</option>
                        <option value="Leaf">Leaf (Natural & Pure)</option>
                        <option value="Truck">Truck (Express Delivery)</option>
                      </select>
                    </div>
                    
                    <div className="input-group" style={{ marginBottom: 0 }}>
                      <label className="input-label">Title</label>
                      <input 
                        className="custom-input" 
                        value={feature.title || ''} 
                        onChange={e => {
                          const updated = [...(form.trustFeatures || [])];
                          updated[index] = { ...updated[index], title: e.target.value };
                          setForm({ ...form, trustFeatures: updated });
                        }}
                        placeholder="e.g. Traditional Recipes"
                      />
                    </div>
                  </div>

                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Description</label>
                    <textarea 
                      className="custom-input" 
                      style={{ minHeight: '80px', resize: 'none' }}
                      value={feature.description || ''} 
                      onChange={e => {
                        const updated = [...(form.trustFeatures || [])];
                        updated[index] = { ...updated[index], description: e.target.value };
                        setForm({ ...form, trustFeatures: updated });
                      }}
                      placeholder="Explain this trust feature..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '10px', color: 'var(--text-main)' }}>Change Admin Password</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '30px', fontWeight: '500' }}>
                Update your administrator password. You will need to enter your current password for verification.
              </p>

              <div style={{ maxWidth: '450px' }}>
                <div style={{ background: '#fef3c7', padding: '16px 20px', borderRadius: '16px', border: '1px solid #fde68a', marginBottom: '30px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <ShieldCheck size={20} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', fontWeight: '600', lineHeight: 1.5 }}>
                    For security, choose a strong password with at least 6 characters. After changing, you will need to use the new password on your next login.
                  </p>
                </div>

                <div className="input-group">
                  <label className="input-label">Current Password</label>
                  <input 
                    type="password" 
                    className="custom-input" 
                    placeholder="Enter your current password"
                    value={pwForm.currentPassword} 
                    onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">New Password</label>
                  <input 
                    type="password" 
                    className="custom-input" 
                    placeholder="Enter new password (min 6 characters)"
                    value={pwForm.newPassword} 
                    onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="custom-input" 
                    placeholder="Re-enter new password"
                    value={pwForm.confirmPassword} 
                    onChange={e => setPwForm({...pwForm, confirmPassword: e.target.value})} 
                  />
                </div>

                <button 
                  onClick={handleChangePassword}
                  disabled={pwLoading}
                  style={{ 
                    background: 'var(--primary)', color: 'white', padding: '16px 35px', borderRadius: '20px', 
                    border: 'none', fontSize: '1rem', fontWeight: '900', cursor: pwLoading ? 'not-allowed' : 'pointer', 
                    display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px',
                    opacity: pwLoading ? 0.7 : 1,
                    boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)' 
                  }}
                >
                  <Lock size={18} />
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

