'use client';
import { useState } from 'react';
import { useAdminStore } from '@/lib/adminStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAdmin = useAdminStore((state) => state.setAdmin);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Admin logged in!');
        setAdmin(data.user.username);
        router.push('/admin');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ padding: '8rem 20px', maxWidth: '400px' }}>
      <div className="card">
        <h1 className="text-3xl text-center" style={{ marginBottom: '2rem' }}>Admin Login</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="font-bold">Username</label>
            <input required className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="font-bold">Password</label>
            <input required type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
