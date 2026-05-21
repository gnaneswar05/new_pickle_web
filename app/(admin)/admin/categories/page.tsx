'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Upload, Edit, Download, FileSpreadsheet } from 'lucide-react';

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

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', image: '', icon: '' });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setForm({ ...form, image: data.url });
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

  const fetchCategories = () => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      });
  };

  useEffect(() => fetchCategories(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/categories/${editId}` : '/api/categories';
    const method = editId ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    
    if (res.ok) {
      toast.success(editId ? 'Category updated' : 'Category added');
      setShowModal(false);
      setEditId(null);
      setForm({ name: '', image: '', icon: '' });
      fetchCategories();
    } else {
      toast.error('Failed to save category');
    }
  };

  const handleEdit = (category: any) => {
    setEditId(category._id);
    setForm({
      name: category.name || '',
      image: category.image || '',
      icon: category.icon || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete category?')) {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    }
  };

  const downloadTemplate = () => {
    const csv = 'name,icon,image\nMango,🥭,https://example.com/mango.jpg\nLemon,🍋,https://example.com/lemon.jpg';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'categories-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCategories = () => {
    const csv = 'name,icon,image\n' + categories.map(c => `${c.name},${c.icon || ''},${c.image || ''}`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'categories-export.csv'; a.click();
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
        name: row.name || row.category || '',
        icon: row.icon || row.emoji || '🏷️',
        image: row.image || row.imageurl || row.image_url || ''
      }));
      const res = await fetch('/api/categories/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: mapped })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        fetchCategories();
      } else {
        toast.error(result.error || 'Bulk upload failed');
      }
    } catch (err) { toast.error('Failed to process CSV'); }
    setBulkUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ fontFamily: 'Fraunces, serif' }}>
      <input type="file" accept=".csv" ref={fileInputRef} onChange={handleBulkUpload} style={{ display: 'none' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '15px' }}>
        <h1 className="text-4xl font-bold" style={{ color: 'var(--text-main)' }}>Categories</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={downloadTemplate}
            style={{ background: 'var(--surface)', color: 'var(--text-muted)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} /> Template
          </button>
          <button onClick={exportCategories}
            style={{ background: 'var(--surface)', color: 'var(--text-muted)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Download size={16} /> Export
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={bulkUploading}
            style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: bulkUploading ? 0.7 : 1 }}>
            <Upload size={16} /> {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
          </button>
          <button className="btn btn-primary" onClick={() => { setEditId(null); setForm({ name: '', image: '', icon: '' }); setShowModal(true); }}>
            <Plus size={20} /> Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((c: any) => (
            <div key={c._id} className="card text-center" style={{ background: 'var(--surface)', padding: '30px', borderRadius: '30px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>{c.icon}</div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-main)', marginBottom: '20px' }}>{c.name}</h3>
              <div className="flex gap-2 w-full justify-center">
                <button onClick={() => handleEdit(c)} className="btn" style={{ background: 'var(--secondary)', color: 'var(--primary)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '10px', cursor: 'pointer' }}>
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => handleDelete(c._id)} style={{ background: 'var(--secondary)', color: 'var(--primary)', border: 'none', width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px', background: 'var(--surface)', padding: '40px', borderRadius: '30px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid var(--border)' }}>
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>{editId ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Category Name</label>
                <input required className="input" placeholder="Name (e.g. Mango)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ padding: '12px 16px', borderRadius: '12px', outline: 'none' }} />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Icon (Emoji)</label>
                <input required className="input" placeholder="Icon (e.g. 🥭)" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} style={{ padding: '12px 16px', borderRadius: '12px', outline: 'none' }} />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Image (Upload or URL)</label>
                <div className="flex gap-2">
                  <input className="input w-full" placeholder="Image URL" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} style={{ padding: '12px 16px', borderRadius: '12px', outline: 'none' }} />
                  <label className="btn cursor-pointer flex items-center justify-center shrink-0" style={{ padding: '0 1rem', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-muted)' }}>
                    <Upload size={18} />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {uploading && <p className="text-xs text-blue-500">Uploading...</p>}
                {form.image && <img src={form.image} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded-xl" />}
              </div>

              <div className="flex justify-end gap-4" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: 'var(--secondary)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '12px' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', borderRadius: '12px' }}>{editId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
