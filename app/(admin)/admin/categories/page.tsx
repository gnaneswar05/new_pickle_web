'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', image: '', icon: '' });
  const [showModal, setShowModal] = useState(false);

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
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      toast.success('Category added');
      setShowModal(false);
      setForm({ name: '', image: '', icon: '' });
      fetchCategories();
    } else {
      toast.error('Failed to add category');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete category?')) {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1 className="text-4xl">Categories</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {categories.map((c: any) => (
          <div key={c._id} className="card text-center">
            <div style={{ fontSize: '3rem' }}>{c.icon}</div>
            <h3 className="text-xl font-bold">{c.name}</h3>
            <button onClick={() => handleDelete(c._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
            <h2 className="text-2xl mb-4">Add Category</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input required className="input" placeholder="Name (e.g. Mango)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input required className="input" placeholder="Icon (e.g. 🥭)" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} />
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
