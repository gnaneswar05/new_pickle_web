'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useThemeStore } from '@/lib/themeStore';
import Link from 'next/link';
import { PlusCircle, ArrowUpRight, ArrowDownLeft, Wallet, Calendar, History, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WalletPage() {
  const user = useAuthStore((state) => state.user);
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>({ balance: 0, transactions: [], totalPages: 0, currentPage: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setLoading(true);
      fetch(`/api/wallet?userId=${user.id}&page=${page}`)
        .then(res => res.json())
        .then(resData => {
          setData(resData);
          setLoading(false);
        })
        .catch(() => {
          toast.error("Failed to sync wallet");
          setLoading(false);
        });
    }
  }, [user, page]);

  if (!mounted || !user) return null;

  return (
    <div style={{ minHeight: '90vh', background: 'var(--background)', padding: '60px 20px', fontFamily: 'Fraunces, serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '50px', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: '900', color: 'var(--text-main)', margin: 0, fontFamily: 'Fraunces, serif', lineHeight: 1.1 }}>
              <span style={{ color: 'var(--primary)' }}>Wallet</span>
            </h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontWeight: '500', fontSize: '1.1rem' }}>Manage your funds for seamless shopping.</p>
          </div>
          <Link href="/dashboard" style={{ background: 'var(--primary)', color: 'white', padding: '16px 28px', borderRadius: '18px', textDecoration: 'none', fontWeight: '800', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 20px -5px var(--secondary)', transition: '0.3s' }}>
            Back
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 4vw, 40px)', alignItems: 'flex-start' }}>

          {/* Balance Card */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', color: 'white', padding: '50px', borderRadius: '48px', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px -15px var(--secondary)' }}>
              <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
              <Wallet size={40} style={{ opacity: 0.3, marginBottom: '30px' }} />
              <p style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8, marginBottom: '10px' }}>Available Balance</p>
              <h2 style={{ fontSize: '4rem', fontWeight: '900', margin: 0, letterSpacing: '-0.02em' }}>₹{data.balance.toFixed(2)}</h2>
              <div style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
                <Sparkles size={16} /> 100% Secured Wallet
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div style={{ background: 'var(--surface)', padding: '50px 40px', borderRadius: '48px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '35px', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'Fraunces, serif' }}>
              <History size={24} color="var(--primary)" /> Transaction History
            </h3>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Syncing your vault...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {data.transactions.map((t: any) => {
                  const isCredit = t.type === 'Credit';
                  const bg = isCredit 
                    ? (theme === 'dark' ? '#064e3b' : '#dcfce7') 
                    : (theme === 'dark' ? '#7f1d1d' : '#fee2e2');
                  const fg = isCredit 
                    ? (theme === 'dark' ? '#a7f3d0' : '#166534') 
                    : (theme === 'dark' ? '#fca5a5' : '#b91c1c');

                  return (
                    <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '24px', border: '1px solid var(--border)', background: 'var(--background)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                        <div style={{ width: '45px', height: '45px', background: bg, color: fg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isCredit ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: '800', color: 'var(--text-main)', fontSize: '0.95rem' }}>{t.description}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar size={12} /> {new Date(t.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: '900', color: fg, fontSize: '1.1rem' }}>
                          {isCredit ? '+' : '-'}₹{Math.abs(t.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {data.transactions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--border)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                      <History size={30} color="var(--text-muted)" />
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.9rem' }}>No transactions yet.</p>
                  </div>
                )}

                {data.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px 15px', borderRadius: '12px', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{page} / {data.totalPages}</span>
                    <button
                      disabled={page === data.totalPages}
                      onClick={() => setPage(p => p + 1)}
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '10px 15px', borderRadius: '12px', cursor: page === data.totalPages ? 'not-allowed' : 'pointer', opacity: page === data.totalPages ? 0.5 : 1 }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        a:hover { transform: translateY(-2px); filter: brightness(1.1); }
      `}</style>
    </div>
  );
}

