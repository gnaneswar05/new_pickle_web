'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, MapPin, X, Info, Edit, Upload, Download, FileSpreadsheet } from 'lucide-react';

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] || ''; });
    return obj;
  });
}

export default function AdminPincodes() {
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', city: '', deliveryCharge: '' });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (!/^\d{6}$/.test(form.code)) {
      toast.error('Pincode must be exactly 6 digits');
      return;
    }
    const url = editId ? `/api/pincodes/${editId}` : '/api/pincodes';
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, deliveryCharge: Number(form.deliveryCharge) })
    });
    if (res.ok) {
      toast.success(editId ? 'Service area updated' : 'Service area added');
      setShowModal(false);
      setEditId(null);
      setForm({ code: '', city: '', deliveryCharge: '' });
      fetchPincodes();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to save area');
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p._id);
    setForm({ code: p.code || '', city: p.city || '', deliveryCharge: (p.deliveryCharge ?? '').toString() });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this delivery area?')) {
      const res = await fetch(`/api/pincodes/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Area removed'); fetchPincodes(); }
    }
  };

  const handleToggleActive = async (p: any) => {
    const res = await fetch(`/api/pincodes/${p._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: p.code, city: p.city, deliveryCharge: p.deliveryCharge, isActive: !p.isActive })
    });
    if (res.ok) { toast.success(`${p.city} ${p.isActive ? 'deactivated' : 'activated'}`); fetchPincodes(); }
  };

  const activeCount = pincodes.filter(p => p.isActive !== false).length;
  const inactiveCount = pincodes.filter(p => p.isActive === false).length;

  const downloadTemplate = () => {
    const csv = 'code,city,deliveryCharge,isActive\n530001,Visakhapatnam,50,true\n530002,Vizag,40,true';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pincodes-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPincodes = () => {
    const csv = 'code,city,deliveryCharge,isActive\n' + pincodes.map(p =>
      `${p.code},${p.city},${p.deliveryCharge},${p.isActive !== false}`
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'pincodes-export.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkUploading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      if (data.length === 0) { toast.error('No valid data in CSV'); setBulkUploading(false); return; }
      const mapped = data.map(row => ({
        code: row.code || row.pincode || '',
        city: row.city || row.region || '',
        deliveryCharge: Number(row.deliverycharge || row.delivery_charge || row.charge || 0),
        isActive: (row.isactive || row.active || 'true') !== 'false'
      }));
      const res = await fetch('/api/pincodes/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincodes: mapped })
      });
      const result = await res.json();
      if (res.ok) {
        setBulkResult(result);
        toast.success(result.message);
        fetchPincodes();
      } else {
        toast.error(result.error || 'Bulk upload failed');
      }
    } catch (err) { toast.error('Failed to process CSV'); }
    setBulkUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ padding: '20px 0', fontFamily: 'Fraunces, serif' }}>
      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleBulkUpload} style={{ display: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#1e293b', margin: 0, fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
            Service <span style={{ color: '#2d5a27' }}>Areas</span>
          </h1>
          <p style={{ color: '#64748b', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Manage delivery zones and charges.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={downloadTemplate}
            style={{ background: '#f8fafc', color: '#64748b', padding: '12px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} /> Template
          </button>
          <button onClick={exportPincodes}
            style={{ background: '#f8fafc', color: '#64748b', padding: '12px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Download size={16} /> Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={bulkUploading}
            style={{ background: '#1e40af', color: 'white', padding: '12px 20px', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: bulkUploading ? 0.7 : 1 }}>
            <Upload size={16} /> {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
          </button>
          <button onClick={() => { setEditId(null); setForm({ code: '', city: '', deliveryCharge: '' }); setShowModal(true); }}
            style={{ background: '#2d5a27', color: 'white', padding: '12px 20px', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', boxShadow: '0 10px 15px -3px rgba(45, 90, 39, 0.2)' }}>
            <Plus size={16} /> Add Pincode
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: '#f0f7f0', border: '1px solid #d1fae5', padding: '20px 25px', borderRadius: '24px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#2d5a27', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Zones</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{activeCount}</p>
        </div>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '20px 25px', borderRadius: '24px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inactive Zones</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{inactiveCount}</p>
        </div>
        <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '20px 25px', borderRadius: '24px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Zones</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>{pincodes.length}</p>
        </div>
      </div>

      <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '20px', borderRadius: '24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><Info size={20} /></div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e3a8a', fontWeight: '600' }}>
          Only <strong>active</strong> pincodes are checked during checkout. If zero active pincodes exist, delivery is allowed to all addresses with ₹0 charge. Toggle zones on/off without deleting them.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Loading service areas...</div>
      ) : (
        <div style={{ background: 'white', borderRadius: '40px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
                <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pincode</th>
                <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>City/Region</th>
                <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Delivery Fee</th>
                <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                <th style={{ padding: '25px 30px', color: '#64748b', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pincodes.map((p: any) => (
                <tr key={p._id} style={{ borderBottom: '1px solid #f8fafc', transition: '0.2s', opacity: p.isActive === false ? 0.5 : 1 }}>
                  <td style={{ padding: '25px 30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><MapPin size={18} /></div>
                      <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>{p.code}</span>
                    </div>
                  </td>
                  <td style={{ padding: '25px 30px', color: '#64748b', fontWeight: '600', textTransform: 'capitalize' }}>{p.city}</td>
                  <td style={{ padding: '25px 30px' }}>
                    <span style={{ background: '#f0f7f0', color: '#2d5a27', padding: '6px 14px', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem' }}>₹{p.deliveryCharge}</span>
                  </td>
                  <td style={{ padding: '25px 30px' }}>
                    <div onClick={() => handleToggleActive(p)}
                      style={{ width: '50px', height: '28px', borderRadius: '14px', cursor: 'pointer', transition: '0.2s', background: p.isActive !== false ? '#2d5a27' : '#cbd5e1', position: 'relative' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: '0.2s', left: p.isActive !== false ? '25px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </td>
                  <td style={{ padding: '25px 30px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(p)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {pincodes.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8', fontWeight: '600' }}>No delivery zones configured yet. Delivery is currently allowed to all addresses.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '40px', width: '100%', maxWidth: '450px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '30px', top: '30px', background: '#f8fafc', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '12px', fontFamily: 'Fraunces, serif' }}>{editId ? 'Edit Delivery Zone' : 'Add Delivery Zone'}</h2>
            <p style={{ color: '#64748b', marginBottom: '35px', fontWeight: '500' }}>{editId ? 'Update serviceable details.' : 'Define a new serviceable pincode and fee.'}</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Pincode (6 digits)</label>
                <input required maxLength={6} pattern="\d{6}" title="Pincode must be exactly 6 digits"
                  style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600', letterSpacing: '0.1em', fontSize: '1.1rem' }}
                  value={form.code} onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 6); setForm({...form, code: val}); }} placeholder="e.g. 530004" />
                {form.code.length > 0 && form.code.length < 6 && (
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600' }}>⚠ Enter all 6 digits</p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>City Name</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="e.g. Vizag" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>Delivery Fee (₹)</label>
                <input required type="number" min="0" style={{ padding: '16px', borderRadius: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', outline: 'none', fontWeight: '600' }} value={form.deliveryCharge} onChange={e => setForm({...form, deliveryCharge: e.target.value})} placeholder="0" />
              </div>
              <button type="submit" style={{ marginTop: '10px', background: '#2d5a27', color: 'white', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(45, 90, 39, 0.2)' }}>{editId ? 'Update Delivery Area' : 'Save Delivery Area'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
