'use client';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Phone, ShieldCheck, ArrowRight, Lock, Sparkles, Fingerprint, ChevronLeft } from 'lucide-react';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Security code sent! Demo: ${data.otp}`);
        setStep(2);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter the full verification code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Authentication successful!');
        setUser(data.user);
        router.push('/dashboard');
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (error) {
      toast.error('Failed to verify. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ minHeight: '90vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Fraunces, serif', position: 'relative', overflow: 'hidden' }}>
      
      {/* Premium Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
 
      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
        
        {/* Main Card */}
        <div style={{ background: 'var(--surface)', borderRadius: '48px', padding: '60px 50px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '45px' }}>
            <div style={{ width: '70px', height: '70px', background: 'var(--primary)', color: 'white', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px', fontSize: '2rem', fontWeight: '900', boxShadow: '0 20px 30px -10px rgba(220, 38, 38, 0.3)', transform: 'rotate(-5deg)' }}>
              K
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
              {step === 1 ? 'Welcome Back' : 'Verify Identity'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', lineHeight: 1.5 }}>
              {step === 1 
                ? 'Sign in to access your pickle collection and wallet.' 
                : `Enter the security code sent to +91 ${phone.replace(/(\d{5})(\d{5})/, '$1 $2')}`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', borderRight: '2px solid var(--border)', paddingRight: '12px' }}>
                    <Phone size={18} color="var(--primary)" />
                    <span style={{ fontWeight: '800', color: 'var(--text-main)', fontSize: '0.95rem' }}>+91</span>
                  </div>
                  <input 
                    required 
                    type="tel"
                    maxLength={10}
                    style={{ width: '100%', background: 'var(--background)', border: '2px solid var(--border)', padding: '20px 20px 20px 85px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', outline: 'none', transition: '0.3s' }}
                    placeholder="98765 43210" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                    onFocus={(e) => e.target.parentElement!.style.transform = 'translateY(-2px)'}
                    onBlur={(e) => e.target.parentElement!.style.transform = 'translateY(0)'}
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                style={{ background: 'var(--text-main)', color: 'var(--background)', padding: '22px', borderRadius: '24px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Sending Code...' : 'Access My Account'} <ArrowRight size={20} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                  Verification Code
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} size={20} />
                  <input 
                    required 
                    maxLength={6}
                    style={{ width: '100%', background: 'var(--background)', border: '2px solid var(--border)', padding: '20px 20px 20px 55px', borderRadius: '20px', fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', outline: 'none', letterSpacing: '0.4em', transition: '0.3s' }}
                    placeholder="••••••" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                style={{ background: 'var(--primary)', color: 'white', padding: '22px', borderRadius: '24px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(220, 38, 38, 0.3)', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Verifying...' : 'Complete Sign In'} <ShieldCheck size={20} />
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}
              >
                <ChevronLeft size={16} /> Edit Phone Number
              </button>
            </form>
          )}

          {/* Footer Branding */}
          <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Sparkles size={14} color="var(--primary)" /> Secured by Kanvi Auth System
            </div>
            <p style={{ marginTop: '12px', fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', lineHeight: 1.6 }}>
              By signing in, you agree to our <span style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Privacy Policy</span> and <span style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Terms of Service</span>.
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
            <ShieldCheck size={16} /> 256-bit Encryption
          </div>
          <div style={{ width: '4px', height: '4px', background: 'var(--border)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700' }}>
            <Fingerprint size={16} /> Biometric Ready
          </div>
        </div>
      </div>

      <style>{`
        input:focus { border-color: var(--primary) !important; box-shadow: 0 10px 20px -5px rgba(220, 38, 38, 0.05); transform: translateY(-2px); }
        button:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}

