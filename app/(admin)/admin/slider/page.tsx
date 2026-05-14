'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminSlider() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', subtitle: '', image: '', link: '' });
  const [showModal, setShowModal] = useState(false);

  const fetchSliders = () => {
    fetch('/api/sliders').then(res => res.json()).then(data => { setSliders(data); setLoading(false); });
  };

  useEffect(() => fetchSliders(), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/sliders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    toast.success('Slider added');
    setShowModal(false);
    setForm({ title: '', subtitle: '', image: '', link: '' });
    fetchSliders();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/sliders/${id}`, { method: 'DELETE' });
    fetchSliders();
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
            <button onClick={() => handleDelete(s._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
            <h2 className="text-2xl mb-4">Add Slide</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input required className="input" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <input className="input" placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} />
              <input required className="input" placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
              <div className="flex justify-end gap-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
