'use client';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Download, Scale, Upload } from 'lucide-react';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const initialForm = { 
    name: '', 
    description: '', 
    price: '', 
    image: '', 
    category: '', 
    isTopSelling: false,
    variants: [
      { weight: '250g', price: '' },
      { weight: '500g', price: '' },
      { weight: '1kg', price: '' }
    ]
  };

  const [form, setForm] = useState(initialForm);

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name", "Category", "Base Price", "Top Selling"].join(",") + "\n"
      + products.map((p: any) => [p.name, p.category, p.price, p.isTopSelling].join(",").replace(/\n/g, " ")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products-list.csv");
    document.body.appendChild(link);
    link.click();
  };

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/categories')
    ]);
    const prodData = await prodRes.json();
    const catData = await catRes.json();
    setProducts(prodData);
    setCategories(catData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/products/${editId}` : '/api/products';
    const method = editId ? 'PUT' : 'POST';
    
    // Clean variants: only keep ones with a price
    const cleanedVariants = form.variants.map(v => ({
      weight: v.weight,
      price: Number(v.price)
    })).filter(v => v.price > 0);

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...form, 
        price: Number(form.price),
        variants: cleanedVariants
      })
    });
    
    if (res.ok) {
      toast.success(editId ? 'Product updated' : 'Product added');
      setShowModal(false);
      setEditId(null);
      setForm(initialForm);
      fetchData();
    } else {
      toast.error('Operation failed');
    }
  };

  const handleEdit = (p: any) => {
    setEditId(p._id);
    const pVariants = p.variants || [];
    setForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      image: p.image,
      category: p.category,
      isTopSelling: !!p.isTopSelling,
      variants: [
        { weight: '250g', price: pVariants.find((v: any) => v.weight === '250g')?.price || '' },
        { weight: '500g', price: pVariants.find((v: any) => v.weight === '500g')?.price || '' },
        { weight: '1kg', price: pVariants.find((v: any) => v.weight === '1kg')?.price || '' }
      ]
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Product deleted');
        fetchData();
      }
    }
  };

  const handleVariantChange = (index: number, value: string) => {
    const newVariants = [...form.variants];
    newVariants[index].price = value;
    setForm({ ...form, variants: newVariants });
  };

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

  if (loading) return <div className="p-8">Loading products...</div>;

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h1 className="text-4xl font-bold">Manage Products</h1>
        <div className="flex gap-4">
          <button onClick={exportToCSV} className="export-btn">
            <Download size={20} /> Export to Excel
          </button>
          <button className="btn btn-primary" onClick={() => { setEditId(null); setForm(initialForm); setShowModal(true); }}>
            <Plus size={20} /> Add New Product
          </button>
        </div>
      </div>

      <div className="admin-card">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Base Price</th>
              <th>Variants</th>
              <th>Top Selling</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p._id}>
                <td><img src={p.image} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>₹{p.price}</td>
                <td>
                  <div className="flex gap-1">
                    {(p.variants || []).map((v: any) => (
                      <span key={v.weight} style={{ fontSize: '10px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {v.weight}: ₹{v.price}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{p.isTopSelling ? '✅' : '❌'}</td>
                <td className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="btn btn-outline" style={{ padding: '0.4rem' }}>Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="btn btn-outline" style={{ padding: '0.4rem', color: '#ef4444' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '600px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="text-2xl mb-6">{editId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Name</label>
                  <input required className="input" placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Category</label>
                  <select required className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400">Description</label>
                <textarea required className="input" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: '80px' }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Base Price (for 250g)</label>
                  <input required type="number" step="0.01" className="input" placeholder="Price (₹)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400">Image (Upload or URL)</label>
                  <div className="flex gap-2">
                    <input className="input" placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                    <label className="btn btn-outline cursor-pointer flex items-center justify-center" style={{ padding: '0 0.5rem' }}>
                      <Upload size={18} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  {uploading && <p className="text-xs text-blue-500">Uploading...</p>}
                  {form.image && <img src={form.image} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded" />}
                </div>
              </div>

              {/* Weight Pricing Section */}
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <h4 className="font-bold text-sm text-slate-700 mb-4 flex items-center gap-2">
                  <Scale size={16} /> Weight-Based Pricing (Addons)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {form.variants.map((v, idx) => (
                    <div key={v.weight} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{v.weight} Price</label>
                      <input 
                        type="number" 
                        className="input" 
                        style={{ padding: '0.5rem' }} 
                        placeholder="₹" 
                        value={v.price} 
                        onChange={(e) => handleVariantChange(idx, e.target.value)} 
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">Note: If left empty, 250g price will be used as base.</p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isTopSelling} onChange={e => setForm({...form, isTopSelling: e.target.checked})} />
                <span className="text-sm font-medium">Mark as Top Selling Delicacy</span>
              </label>

              <div className="flex justify-end gap-4" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Product' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
