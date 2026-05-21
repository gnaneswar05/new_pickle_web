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
          <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
            Service <span style={{ color: 'var(--primary)' }}>Areas</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Manage delivery zones and charges.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={downloadTemplate}
            style={{ background: 'var(--secondary)', color: 'var(--text-main)', padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--border)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} /> Template
          </button>
          <button onClick={exportPincodes}
            style={{ background: 'var(--secondary)', color: 'var(--text-main)', padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--border)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Download size={16} /> Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={bulkUploading}
            style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: bulkUploading ? 0.7 : 1 }}>
            <Upload size={16} /> {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
          </button>
          <button onClick={() => { setEditId(null); setForm({ code: '', city: '', deliveryCharge: '' }); setShowModal(true); }}
            style={{ background: 'var(--primary)', color: 'white', padding: '12px 20px', borderRadius: '14px', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)' }}>
            <Plus size={16} /> Add Pincode
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', padding: '20px 25px', borderRadius: '24px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Zones</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>{activeCount}</p>
        </div>
        <div style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '20px 25px', borderRadius: '24px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inactive Zones</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>{inactiveCount}</p>
        </div>
        <div style={{ background: 'var(--background)', border: '1px solid var(--border)', padding: '20px 25px', borderRadius: '24px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Zones</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)' }}>{pincodes.length}</p>
        </div>
      </div>

      <div style={{ background: 'var(--secondary)', border: '1px solid var(--border)', padding: '20px', borderRadius: '24px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}><Info size={20} /></div>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600' }}>
          Only <strong>active</strong> pincodes are checked during checkout. If zero active pincodes exist, delivery is allowed to all addresses with ₹0 charge. Toggle zones on/off without deleting them.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading service areas...</div>
      ) : (
        <div style={{ background: 'var(--surface)', borderRadius: '40px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pincode</th>
                <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>City/Region</th>
                <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Delivery Fee</th>
                <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                <th style={{ padding: '25px 30px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pincodes.map((p: any) => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s', opacity: p.isActive === false ? 0.5 : 1 }}>
                  <td style={{ padding: '25px 30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--background)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><MapPin size={18} /></div>
                      <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '1.1rem' }}>{p.code}</span>
                    </div>
                  </td>
                  <td style={{ padding: '25px 30px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'capitalize' }}>{p.city}</td>
                  <td style={{ padding: '25px 30px' }}>
                    <span style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '12px', fontWeight: '900', fontSize: '0.9rem' }}>₹{p.deliveryCharge}</span>
                  </td>
                  <td style={{ padding: '25px 30px' }}>
                    <div onClick={() => handleToggleActive(p)}
                      style={{ width: '50px', height: '28px', borderRadius: '14px', cursor: 'pointer', transition: '0.2s', background: p.isActive !== false ? 'var(--primary)' : 'var(--border)', position: 'relative' }}>
                      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', transition: '0.2s', left: p.isActive !== false ? '25px' : '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                    </div>
                  </td>
                  <td style={{ padding: '25px 30px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(p)} style={{ background: 'var(--background)', color: 'var(--text-muted)', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Edit size={18} /></button>
                      <button onClick={() => handleDelete(p._id)} style={{ background: 'var(--secondary)', color: 'var(--primary)', border: 'none', width: '44px', height: '44px', borderRadius: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {pincodes.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>No delivery zones configured yet. Delivery is currently allowed to all addresses.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '40px', borderRadius: '40px', width: '100%', maxWidth: '450px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', right: '30px', top: '30px', background: 'var(--background)', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: 'var(--text-main)' }}><X size={20} /></button>
            <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'Fraunces, serif' }}>{editId ? 'Edit Delivery Zone' : 'Add Delivery Zone'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '35px', fontWeight: '500' }}>{editId ? 'Update serviceable details.' : 'Define a new serviceable pincode and fee.'}</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pincode (6 digits)</label>
                <input required maxLength={6} pattern="\d{6}" title="Pincode must be exactly 6 digits"
                  style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', outline: 'none', fontWeight: '600', letterSpacing: '0.1em', fontSize: '1.1rem', color: 'var(--text-main)' }}
                  value={form.code} onChange={e => { const val = e.target.value.replace(/\D/g, '').slice(0, 6); setForm({...form, code: val}); }} placeholder="e.g. 530004" />
                {form.code.length > 0 && form.code.length < 6 && (
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600' }}>⚠ Enter all 6 digits</p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>City Name</label>
                <input required style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', outline: 'none', fontWeight: '600', color: 'var(--text-main)' }} value={form.city} onChange={e => setForm({...form, city: e.target.value})} placeholder="e.g. Vizag" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery Fee (₹)</label>
                <input required type="number" min="0" style={{ padding: '16px', borderRadius: '16px', border: '2px solid var(--border)', background: 'var(--background)', outline: 'none', fontWeight: '600', color: 'var(--text-main)' }} value={form.deliveryCharge} onChange={e => setForm({...form, deliveryCharge: e.target.value})} placeholder="0" />
              </div>
              <button type="submit" style={{ marginTop: '10px', background: 'var(--primary)', color: 'white', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: '900', fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.2)' }}>{editId ? 'Update Delivery Area' : 'Save Delivery Area'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
