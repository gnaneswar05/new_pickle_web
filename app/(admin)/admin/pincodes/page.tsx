'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, MapPin, X, Info } from 'lucide-react';

export default function AdminPincodes() {
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', city: '', deliveryCharge: '' });
  const [showModal, setShowModal] = useState(false);

  const fetchPincodes = () => {
    fetch('/api/pincodes')
      .then(res => res.json())
      .then(data => {
        setPincodes(data);
        setLoading(false);
      });
  };

  useEffect(() => fetchPincodes(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/pincodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, deliveryCharge: Number(form.deliveryCharge) })
    });
    if (res.ok) {
      toast.success('Service area added');
      setShowModal(false);
      setForm({ code: '', city: '', deliveryCharge: '' });
      fetchPincodes();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to add area');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this delivery area?')) {
      const res = await fetch(`/api/pincodes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Area removed');
        fetchPincodes();
      }
    }
  };

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Fraunces, serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '60px' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
            Service <span style={{ color: '#2d5a27' }}>Areas</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Manage delivery zones and charges.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: '#2d5a27', color: 'white', padding: '14px 28px', borderRadius: '18px', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(45, 90, 39, 0.2)' }}
        >
          <Plus size={20} /> Add Pincode
        </button>
      </div>

      {/* Info Alert */}
      <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '20px', borderRadius: '24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <Info size={20} />
        </div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a', fontWeight: '600' }}>
          Customers entering these pincodes during checkout will be charged the specified amount. If no pincodes are added, delivery is allowed everywhere with zero charge.
        </p>
      </div>

      {/* Table Container */}
      <div style={{ background: 'white', borderRadius: '40px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
              <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pincode</th>
              <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>City/Region</th>
              <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Delivery Fee</th>
              <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pincodes.map((p: any) => (
              <tr key={p._id} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s' }}>
                <td style={{ padding: '25px 30px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                      <MapPin size={18} />
                    </div>
                    <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{p.code}</span>
                  </div>
                </td>
                <td style={{ padding: '25px 30px', color: '#64748b', fontWeight: '600', textTransform: 'capitalize' }}>{p.city}</td>
                <td style={{ padding: '25px 30px' }}>
                  <span style={{ background: '#f0f7f0', color: '#2d5a27', padding: '6px 14px', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem' }}>
                    ₹{p.deliveryCharge}
                  </span>
                </td>
                <td style={{ padding: '25px 30px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleDelete(p._id)}
                    style={{ background: '#fef2f2', color: '#ef4444', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {pincodes.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>
                  No delivery zones configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '40px', width: '100%', maxWidth: '450px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '30px', top: '30px', background: '#f8fafc', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '12px', fontFamily: 'Fraunces, serif' }}>Add Delivery Zone</h2>
            <p style={{ color: '#64748b', marginBottom: '35px', fontWeight: '500' }}>Define a new serviceable pincode and fee.</p>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Pincode</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="e.g. 530004" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>City Name</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="e.g. Vizag" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Delivery Fee (₹)</label>
                <input required type="number" style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.deliveryCharge} onChange={e => setForm({...form, deliveryCharge: e.target.value})} placeholder="0" />
              </div>
              <button type="submit" style={{ marginTop: '10px', background: '#2d5a27', color: 'white', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(45, 90, 39, 0.2)' }}>Save Delivery Area</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

