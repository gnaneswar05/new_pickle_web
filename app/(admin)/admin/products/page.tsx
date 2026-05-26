'use client';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Download, Scale, Upload, FileSpreadsheet } from 'lucide-react';

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

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  
  const initialForm = { 
    name: '', 
    description: '', 
    price: '', 
    image: '', 
    images: [] as string[],
    category: '', 
    isTopSelling: false,
    rating: '4.9',
    spiceLevel: 'Medium',
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
        rating: Number(form.rating),
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
      images: p.images || [],
      category: p.category,
      isTopSelling: !!p.isTopSelling,
      rating: p.rating ? p.rating.toString() : '4.9',
      spiceLevel: p.spiceLevel || 'Medium',
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

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</div>;

  const downloadTemplate = () => {
    const csv = 'name,description,price,category,image,stock,isTopSelling,rating,price_250g,price_500g,price_1kg\nMango Pickle,Spicy mango pickle,199,Mango,https://example.com/img.jpg,100,false,4.9,199,379,699';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products-template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportProducts = () => {
    const csv = 'name,description,price,category,image,stock,isTopSelling,rating,price_250g,price_500g,price_1kg\n' + products.map(p => {
      const v250 = (p.variants || []).find((v: any) => v.weight === '250g');
      const v500 = (p.variants || []).find((v: any) => v.weight === '500g');
      const v1kg = (p.variants || []).find((v: any) => v.weight === '1kg');
      return `"${p.name}","${(p.description || '').replace(/"/g, '""')}",${p.price},"${p.category}","${p.image || ''}",${p.stock || 0},${!!p.isTopSelling},${p.rating || 4.9},${v250?.price || ''},${v500?.price || ''},${v1kg?.price || ''}`;
    }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products-export.csv'; a.click();
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
        name: row.name || '',
        description: row.description || '',
        price: Number(row.price) || 0,
        category: row.category || '',
        image: row.image || row.imageurl || row.image_url || '',
        stock: Number(row.stock) || 0,
        isTopSelling: (row.istopselling || row.topselling || 'false') === 'true',
        featured: (row.featured || 'false') === 'true',
        rating: Number(row.rating) || 4.9,
        price_250g: Number(row.price_250g || row['price_250g']) || 0,
        price_500g: Number(row.price_500g || row['price_500g']) || 0,
        price_1kg: Number(row.price_1kg || row['price_1kg']) || 0,
      }));
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: mapped })
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        if (result.errors?.length > 0) {
          result.errors.slice(0, 5).forEach((err: string) => toast.error(err, { duration: 5000 }));
        }
        fetchData();
      } else {
        toast.error(result.error || 'Bulk upload failed');
      }
    } catch (err) { toast.error('Failed to process CSV'); }
    setBulkUploading(false);
    if (bulkFileRef.current) bulkFileRef.current.value = '';
  };

  return (
    <div>
      <input type="file" accept=".csv" ref={bulkFileRef} onChange={handleBulkUpload} style={{ display: 'none' }} />
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '15px' }}>
        <h1 className="text-4xl font-bold" style={{ color: 'var(--text-main)' }}>Manage Products</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={downloadTemplate}
            style={{ background: 'var(--surface)', color: 'var(--text-muted)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <FileSpreadsheet size={16} /> Template
          </button>
          <button onClick={exportProducts}
            style={{ background: 'var(--surface)', color: 'var(--text-muted)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <Download size={16} /> Export
          </button>
          <button onClick={() => bulkFileRef.current?.click()} disabled={bulkUploading}
            style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--primary)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: bulkUploading ? 0.7 : 1 }}>
            <Upload size={16} /> {bulkUploading ? 'Uploading...' : 'Bulk Upload'}
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
                      <span key={v.weight} style={{ fontSize: '10px', background: 'var(--border)', color: 'var(--text-main)', padding: '2px 6px', borderRadius: '4px' }}>
                        {v.weight}: ₹{v.price}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{p.isTopSelling ? '✅' : '❌'}</td>
                <td className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="btn" style={{ background: 'var(--secondary)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '10px' }}>Edit</button>
                  <button onClick={() => handleDelete(p._id)} className="btn" style={{ background: 'var(--secondary)', color: 'var(--primary)', border: 'none', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: '10px' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="admin-card" style={{ width: '100%', maxWidth: '600px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="text-2xl mb-6" style={{ color: 'var(--text-main)', fontWeight: 800 }}>{editId ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Name</label>
                  <input required className="input" placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Category</label>
                  <select required className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea required className="input" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ minHeight: '80px' }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Base Price (for 250g)</label>
                  <input required type="number" step="0.01" className="input" placeholder="Price (₹)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Image (Upload or URL)</label>
                  <div className="flex gap-2">
                    <input className="input" placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                    <label className="btn cursor-pointer flex items-center justify-center" style={{ padding: '0 1rem', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--background)', color: 'var(--text-muted)' }}>
                      <Upload size={18} />
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  </div>
                  {uploading && <p className="text-xs text-blue-500">Uploading...</p>}
                  {form.image && <img src={form.image} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded" />}
                </div>
              </div>

              {/* Gallery Images Section */}
              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <label className="text-xs font-bold block mb-2" style={{ color: 'var(--text-main)' }}>Additional Gallery Images (Optional)</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                  {(form.images || []).map((imgUrl, imgIdx) => (
                    <div key={imgIdx} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={imgUrl} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = form.images.filter((_, idx) => idx !== imgIdx);
                          setForm({ ...form, images: updated });
                        }}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.8)', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    id="gallery-input"
                    className="input"
                    placeholder="Additional Image URL"
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val) {
                          setForm({ ...form, images: [...(form.images || []), val] });
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <label className="btn cursor-pointer flex items-center justify-center" style={{ padding: '0 1.2rem', borderRadius: '12px', border: '2px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)' }}>
                    <Upload size={16} style={{ marginRight: '6px' }} /> Upload
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
                        const uploadData = await uploadRes.json();
                        if (uploadRes.ok) {
                          setForm({ ...form, images: [...(form.images || []), uploadData.url] });
                          toast.success('Gallery image uploaded');
                        }
                      } catch (err) { toast.error('Upload failed'); }
                    }} />
                  </label>
                </div>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>Press Enter to add image URL or click Upload to upload files.</p>
              </div>

              {/* Weight Pricing Section */}
              <div style={{ background: 'var(--background)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                  <Scale size={16} /> Weight-Based Pricing (Addons)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  {form.variants.map((v, idx) => (
                    <div key={v.weight} className="space-y-1">
                      <label className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>{v.weight} Price</label>
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
                <p className="text-[10px] mt-2 italic" style={{ color: 'var(--text-muted)' }}>Note: If left empty, 250g price will be used as base.</p>
              </div>

              <div className="grid grid-cols-3 gap-4 items-end">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input type="checkbox" checked={form.isTopSelling} onChange={e => setForm({...form, isTopSelling: e.target.checked})} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>Top Selling</span>
                </label>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Spice Level</label>
                  <select required className="input" value={form.spiceLevel} onChange={e => setForm({...form, spiceLevel: e.target.value})}>
                    <option value="Mild">Mild</option>
                    <option value="Medium">Medium</option>
                    <option value="Hot">Hot</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Rating (0-5)</label>
                  <input required type="number" step="0.1" min="0" max="5" className="input" placeholder="4.9" value={form.rating} onChange={e => setForm({...form, rating: e.target.value})} />
                </div>
              </div>

              <div className="flex justify-end gap-4" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: 'var(--secondary)', color: 'var(--text-main)', border: '1px solid var(--border)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Product' : 'Save Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
