'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Wallet, ArrowUpCircle, ArrowDownCircle, User as UserIcon, History, ShieldCheck, Zap } from 'lucide-react';

export default function AdminWalletManager() {
  const [phone, setPhone] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!phone) return;
    setSearching(true);
    setFoundUser(null);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await fetch(`/api/users/search?phone=${cleanPhone}`);
      const data = await res.json();
      if (res.ok && data) {
        setFoundUser(data);
      } else {
        toast.error('Customer not found');
      }
    } catch (err) {
      toast.error('Search failed');
    }
    setSearching(false);
  };

  const handleUpdate = async (type: 'Credit' | 'Debit') => {
    if (!foundUser || !amount || !remark) {
      toast.error('Please enter amount and remark');
      return;
    }
    setLoading(true);
    try {
      const finalAmount = type === 'Credit' ? parseFloat(amount) : -parseFloat(amount);
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: foundUser._id,
          amount: finalAmount,
          description: remark
        })
      });
      if (res.ok) {
        toast.success(`${type} successful!`);
        handleSearch();
        setAmount('');
        setRemark('');
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#1e293b', letterSpacing: '-0.02em', margin: 0 }}>Wallet Manager</h1>
        <p style={{ fontSize: '1.1rem', color: '#64748b', marginTop: '0.5rem' }}>Centralized manual control for customer balances.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem' }}>
              <Search size={24} color="#10b981" /> Find Profile
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Customer Phone</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: '#94a3b8', fontSize: '1rem', zIndex: 10 }}>+91</span>
                <input 
                  type="text" 
                  style={{ width: '100%', background: '#f8fafc', border: '2px solid #e2e8f0', padding: '1.25rem 1.25rem 1.25rem 4rem', borderRadius: '18px', fontSize: '1.1rem', fontWeight: '700', color: '#334155', outline: 'none' }} 
                  placeholder="98765 43210" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <button 
              onClick={handleSearch} 
              style={{ width: '100%', background: '#0f172a', color: 'white', padding: '1.25rem', borderRadius: '18px', fontWeight: '800', fontSize: '1.1rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }} 
              disabled={searching}
            >
              {searching ? 'Searching...' : 'Locate Account'}
            </button>
          </div>

          {foundUser && (
            <div style={{ background: '#0f172a', borderRadius: '40px', padding: '2.5rem', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)' }}>
              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '3rem' }}>
                  <div style={{ width: '4rem', height: '4rem', background: 'rgba(255,255,255,0.1)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <UserIcon size={32} color="#34d399" />
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '1.25rem', margin: 0 }}>{foundUser.phone}</p>
                    <p style={{ fontSize: '0.7rem', fontWeight: '900', textTransform: 'uppercase', color: '#34d399', letterSpacing: '0.15em', margin: '0.25rem 0 0 0' }}>VERIFIED CUSTOMER</p>
                  </div>
                </div>
                <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Wallet Balance</p>
                <h2 style={{ fontSize: '4rem', fontWeight: '900', margin: '0.5rem 0 1.5rem 0', letterSpacing: '-0.03em', color: 'white' }}>₹{foundUser.walletBalance.toFixed(2)}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(52, 211, 153, 0.1)', padding: '0.5rem 1rem', borderRadius: '99px', border: '1px solid rgba(52, 211, 153, 0.2)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', color: '#34d399' }}>
                  <ShieldCheck size={14} /> Active & Secured
                </div>
              </div>
              <div style={{ position: 'absolute', right: '-8rem', bottom: '-8rem', width: '20rem', height: '20rem', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', filter: 'blur(80px)' }}></div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div>
          {foundUser ? (
            <div style={{ background: 'white', borderRadius: '40px', padding: '3.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '1rem', margin: 0 }}>
                    <Zap size={36} color="#f59e0b" fill="#f59e0b" /> Adjust Balance
                  </h3>
                  <p style={{ color: '#94a3b8', marginTop: '0.5rem', fontWeight: '600', fontSize: '1rem' }}>Enter amount and remark for the audit trail.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Amount (₹)</label>
                  <input 
                    type="number" 
                    style={{ width: '100%', background: '#f8fafc', border: '3px solid #f1f5f9', padding: '1.5rem', borderRadius: '20px', fontSize: '2rem', fontWeight: '900', color: '#1e293b', outline: 'none' }} 
                    placeholder="0.00" 
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Narrative / Remark</label>
                  <input 
                    type="text" 
                    style={{ width: '100%', background: '#f8fafc', border: '3px solid #f1f5f9', padding: '1.5rem', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '700', color: '#334155', outline: 'none' }} 
                    placeholder="e.g. Refund for Order #1" 
                    value={remark}
                    onChange={e => setRemark(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <button 
                  onClick={() => handleUpdate('Credit')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '2.5rem', borderRadius: '32px', border: 'none', cursor: 'pointer', background: '#ecfdf5', color: '#065f46', transition: 'all 0.2s' }}
                  disabled={loading}
                >
                  <ArrowDownCircle size={56} />
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontWeight: '900', fontSize: '1.5rem' }}>Credit Funds</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.05em' }}>Add money to account</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleUpdate('Debit')}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: '2.5rem', borderRadius: '32px', border: 'none', cursor: 'pointer', background: '#fff1f2', color: '#9f1239', transition: 'all 0.2s' }}
                  disabled={loading}
                >
                  <ArrowUpCircle size={56} />
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontWeight: '900', fontSize: '1.5rem' }}>Debit Funds</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', opacity: 0.6, letterSpacing: '0.05em' }}>Remove money from account</span>
                  </div>
                </button>
              </div>

              <div style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '2px solid #f8fafc', display: 'flex', gap: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <History size={20} /> Secure Audit Logs
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  <ShieldCheck size={20} /> Verified Admin
                </div>
              </div>
            </div>
          ) : (
            <div style={{ height: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', background: '#f8fafc', borderRadius: '40px', border: '4px dashed #e2e8f0' }}>
              <div style={{ width: '8rem', height: '8rem', background: 'white', borderRadius: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
                <Search size={64} style={{ opacity: 0.2, color: '#1e293b' }} />
              </div>
              <h4 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#94a3b8', margin: 0 }}>Search for Profile</h4>
              <p style={{ fontSize: '1rem', fontWeight: '600', marginTop: '0.75rem' }}>Enter a mobile number to manage the wallet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
