'use client';
import { useState, useEffect } from 'react';
import { Search, Download, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      });
  }, []);

  const filteredCustomers = customers.filter((c: any) => 
    c.phone?.includes(searchTerm) || c.id?.includes(searchTerm)
  );

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Customer ID", "Phone", "Registered Date"].join(",") + "\n"
      + customers.map((c: any) => [c._id, c.phone, new Date(c.createdAt).toLocaleDateString()].join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers-list.csv");
    document.body.appendChild(link);
    link.click();
  };

  const toggleBlock = async (id: string, currentStatus: boolean) => {
    const res = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: !currentStatus })
    });
    if (res.ok) {
      toast.success(currentStatus ? 'User restored' : 'User suspended');
      // Refresh data
      fetch('/api/users').then(res => res.json()).then(setCustomers);
    }
  };

  if (loading) return <div className="p-8 text-slate-500">Loading customer base...</div>;

  return (
    <div>
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800" style={{ fontFamily: 'Playfair Display, serif' }}>Customers</h1>
          <p className="text-slate-500 mt-2">Managing {customers.length} registered users.</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by phone..." 
              className="input pl-10" 
              style={{ width: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={exportToCSV} className="export-btn">
            <Download size={20} /> Export CSV
          </button>
        </div>
      </div>

      <div className="admin-card">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Customer ID</th>
              <th>Join Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((c: any) => (
              <tr key={c._id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.isBlocked ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <UserIcon size={20} />
                    </div>
                    <div className="font-bold text-slate-700">{c.phone}</div>
                  </div>
                </td>
                <td className="font-mono text-xs text-slate-400">#{c._id.toUpperCase()}</td>
                <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${c.isBlocked ? 'cancelled' : 'delivered'}`} style={{ fontSize: '10px' }}>
                    {c.isBlocked ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => toggleBlock(c._id, c.isBlocked)}
                    className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${c.isBlocked ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'}`}
                  >
                    {c.isBlocked ? 'Restore Access' : 'Suspend User'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No customers found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
