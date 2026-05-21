'use client';
import { useState, useEffect } from 'react';
import { Search, Download, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
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

    if (loading) return <div className="p-8" style={{ color: 'var(--text-muted)' }}>Loading customer base...</div>;

  return (
    <div style={{ fontFamily: 'Fraunces, serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 className="text-4xl font-extrabold" style={{ color: 'var(--text-main)' }}>Customers</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Managing {customers.length} registered users.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder="Search by phone..." 
              className="input pl-10" 
              style={{ width: '300px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={exportToCSV}
            style={{ background: 'var(--surface)', color: 'var(--text-muted)', padding: '10px 18px', borderRadius: '12px', border: '1px solid var(--border)', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
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
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.isBlocked ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                      <UserIcon size={20} />
                    </div>
                    <div className="font-bold" style={{ color: 'var(--text-main)' }}>{c.phone}</div>
                  </div>
                </td>
                <td className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>#{c._id.toUpperCase()}</td>
                <td style={{ color: 'var(--text-main)' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${c.isBlocked ? 'cancelled' : 'delivered'}`} style={{ fontSize: '10px' }}>
                    {c.isBlocked ? 'Suspended' : 'Active'}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => toggleBlock(c._id, c.isBlocked)}
                    className="text-xs font-bold px-4 py-2 rounded-xl transition-all"
                    style={{
                      background: c.isBlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: c.isBlocked ? '#10b981' : '#ef4444',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = c.isBlocked ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = c.isBlocked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                    }}
                  >
                    {c.isBlocked ? 'Restore Access' : 'Suspend User'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No customers found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
