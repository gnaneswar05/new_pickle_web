'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Upload } from 'lucide-react';

export default function AdminSlider() {
  const [sliders, setSliders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '', description: '', buttonText: '' });
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

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

  const fetchSliders = () => {
    fetch('/api/sliders').then(res => res.json()).then(data => { setSliders(data); setLoading(false); });
  };

  useEffect(() => fetchSliders(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/sliders/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      toast.success('Slider updated');
    } else {
      await fetch('/api/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      toast.success('Slider added');
    }
    closeModal();
    fetchSliders();
  };

  const handleEdit = (slider: any) => {
    setForm({ title: slider.title || '', subtitle: slider.subtitle || '', image: slider.image || '', link: slider.link || '', description: slider.description || '', buttonText: slider.buttonText || '' });
    setEditId(slider._id);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ title: '', subtitle: '', image: '', link: '', description: '', buttonText: '' });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this slider image?')) {
      await fetch(`/api/sliders/${id}`, { method: 'DELETE' });
      toast.success('Slider deleted');
      fetchSliders();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl">Home Slider</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add Slide
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {sliders.map((s: any) => (
          <div key={s._id} className="card">
            <img src={s.image} alt={s.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} />
            <h3 className="text-xl font-bold mt-4">{s.title}</h3>
            <div style={{ display: 'flex', gap: '15px', marginTop: '1rem' }}>
              <button onClick={() => handleEdit(s)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Edit2 size={18} /> Edit
              </button>
              <button onClick={() => handleDelete(s._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Trash2 size={18} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
            <h2 className="text-2xl mb-4">{editId ? 'Edit Slide' : 'Add Slide'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input required className="input" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <input className="input" placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} />
              <textarea className="input" placeholder="Description" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ resize: 'vertical' }} />
              <div className="flex gap-2">
                <input className="input w-1/2" placeholder="Button Text (e.g., Shop Now)" value={form.buttonText} onChange={e => setForm({...form, buttonText: e.target.value})} />
                <input className="input w-1/2" placeholder="Button Link (e.g., /products)" value={form.link} onChange={e => setForm({...form, link: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <div className="flex gap-2">
                  <input className="input w-full" placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                  <label className="btn btn-outline cursor-pointer flex items-center justify-center shrink-0" style={{ padding: '0 1rem' }}>
                    <Upload size={18} />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                {uploading && <p className="text-xs text-blue-500">Uploading...</p>}
                {form.image && <img src={form.image} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />}
              </div>
              <div className="flex justify-end gap-4">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
