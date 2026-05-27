'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Phone, ShieldCheck, ArrowRight, Lock, Sparkles, Fingerprint, ChevronLeft, Key, UserPlus, Eye, EyeOff, RotateCcw } from 'lucide-react';

function LoginPageInner() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Used for OTP-based flows (forgot & otp)
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract redirect url from query params, default to /dashboard
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  useEffect(() => { setMounted(true); }, []);

  // Reset fields when switching modes
  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    setStep(1);
    setPassword('');
    setConfirmPassword('');
    setOtp('');
  };

  // Password Login Submit
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Sign in successful!');
        setUser(data.user);
        router.push(redirectUrl);
      } else {
        toast.error(data.error || 'Invalid phone number or password');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password Signup Submit
  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Registration successful!');
        setUser(data.user);
        router.push(redirectUrl);
      } else {
        toast.error(data.error || 'Failed to sign up');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Flow: Send Verification OTP (reused for OTP login & forgot password)
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
        toast.success(`Verification code sent! Demo OTP: ${data.otp}`);
        setStep(2);
      } else {
        toast.error(data.error || 'Failed to send verification code');
      }
    } catch (error) {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Login: Verify and login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter the verification code');
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
        router.push(redirectUrl);
      } else {
        toast.error(data.error || 'Invalid code');
      }
    } catch (error) {
      toast.error('Failed to verify. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password: Submit OTP and new password to reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      toast.error('Please enter the verification code');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword: password }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Password reset and signed in successfully!');
        setUser(data.user);
        router.push(redirectUrl);
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (error) {
      toast.error('Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Dynamic Header Copy
  const getHeaderCopy = () => {
    switch (mode) {
      case 'signup':
        return {
          title: 'Create Account',
          desc: 'Register to manage your pickle collection, track orders, and top up your wallet.'
        };
      case 'forgot':
        return {
          title: step === 1 ? 'Forgot Password?' : 'Reset Password',
          desc: step === 1
            ? 'Enter your registered phone to receive a security reset code.'
            : `Enter the code sent to +91 ${phone} and configure a new password.`
        };
      case 'otp':
        return {
          title: step === 1 ? 'OTP Quick Sign In' : 'Verify Identity',
          desc: step === 1
            ? 'Sign in using a verification code sent to your phone.'
            : `Enter the security code sent to +91 ${phone}`
        };
      case 'login':
      default:
        return {
          title: 'Welcome Back',
          desc: 'Sign in to access your pickle collection and wallet.'
        };
    }
  };

  const header = getHeaderCopy();

  return (
    <div style={{ minHeight: '90vh', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Fraunces, serif', position: 'relative', overflow: 'hidden' }}>

      {/* Premium Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '40%', height: '40%', background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>

        {/* Main Card */}
        <div style={{ background: 'var(--surface)', borderRadius: '48px', padding: '60px 50px', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '35px' }}>

            <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '12px', fontFamily: 'Fraunces, serif', letterSpacing: '-0.02em' }}>
              {header.title}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500', lineHeight: 1.5 }}>
              {header.desc}
            </p>
          </div>

          {/* Form Content depending on mode and step */}

          {/* 1. PASSWORD LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handlePasswordLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', borderRight: '2px solid var(--border)', paddingRight: '12px', zIndex: 10, pointerEvents: 'none' }}>
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
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot')}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} size={18} />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    style={{ width: '100%', background: 'var(--background)', border: '2px solid var(--border)', padding: '20px 50px 20px 55px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', outline: 'none', transition: '0.3s' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                disabled={loading}
                style={{ background: 'var(--text-main)', color: 'var(--background)', padding: '22px', borderRadius: '24px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)', opacity: loading ? 0.7 : 1, marginTop: '10px' }}
              >
                {loading ? 'Signing In...' : 'Access My Account'} <ArrowRight size={20} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', marginTop: '15px' }}>
                <button
                  type="button"
                  onClick={() => handleModeChange('signup')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <UserPlus size={16} color="var(--primary)" /> Don't have an account? Sign Up
                </button>
                <div style={{ height: '1px', width: '60%', background: 'var(--border)' }}></div>
                <button
                  type="button"
                  onClick={() => handleModeChange('otp')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ShieldCheck size={16} /> Sign In with OTP instead
                </button>
              </div>
            </form>
          )}

          {/* 2. PASSWORD SIGNUP */}
          {mode === 'signup' && (
            <form onSubmit={handlePasswordSignup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                  Mobile Number
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', borderRight: '2px solid var(--border)', paddingRight: '12px', zIndex: 10, pointerEvents: 'none' }}>
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
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} size={18} />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    style={{ width: '100%', background: 'var(--background)', border: '2px solid var(--border)', padding: '20px 50px 20px 55px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', outline: 'none', transition: '0.3s' }}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Key style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} size={18} />
                  <input
                    required
                    type="password"
                    style={{ width: '100%', background: 'var(--background)', border: '2px solid var(--border)', padding: '20px 20px 20px 55px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', outline: 'none', transition: '0.3s' }}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                disabled={loading}
                style={{ background: 'var(--primary)', color: 'white', padding: '22px', borderRadius: '24px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(220, 38, 38, 0.3)', opacity: loading ? 0.7 : 1, marginTop: '10px' }}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={20} />
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('login')}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}
              >
                <ChevronLeft size={16} /> Back to Sign In
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD (RESET FLOW) */}
          {mode === 'forgot' && (
            <div>
              {step === 1 ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                      Registered Mobile Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', borderRight: '2px solid var(--border)', paddingRight: '12px', zIndex: 10, pointerEvents: 'none' }}>
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
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    style={{ background: 'var(--text-main)', color: 'var(--background)', padding: '22px', borderRadius: '24px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Sending Code...' : 'Send Reset Code'} <ArrowRight size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}
                  >
                    <ChevronLeft size={16} /> Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                      Verification Code
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} size={20} />
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

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Key style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} size={18} />
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        style={{ width: '100%', background: 'var(--background)', border: '2px solid var(--border)', padding: '20px 50px 20px 55px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', outline: 'none', transition: '0.3s' }}
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Key style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} size={18} />
                      <input
                        required
                        type="password"
                        style={{ width: '100%', background: 'var(--background)', border: '2px solid var(--border)', padding: '20px 20px 20px 55px', borderRadius: '20px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', outline: 'none', transition: '0.3s' }}
                        placeholder="Repeat new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    style={{ background: 'var(--primary)', color: 'white', padding: '22px', borderRadius: '24px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(220, 38, 38, 0.3)', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Resetting Password...' : 'Reset & Access Account'} <ShieldCheck size={20} />
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
            </div>
          )}

          {/* 4. OTP LOGIN BACKUP */}
          {mode === 'otp' && (
            <div>
              {step === 1 ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                      Mobile Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '8px', borderRight: '2px solid var(--border)', paddingRight: '12px', zIndex: 10, pointerEvents: 'none' }}>
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
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    style={{ background: 'var(--text-main)', color: 'var(--background)', padding: '22px', borderRadius: '24px', border: 'none', fontSize: '1.1rem', fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: '0.3s', boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.1)', opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Sending Code...' : 'Send Verification OTP'} <ArrowRight size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModeChange('login')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}
                  >
                    <ChevronLeft size={16} /> Back to Password Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: '5px' }}>
                      Verification Code
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', zIndex: 10, pointerEvents: 'none' }} size={20} />
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
            </div>
          )}

          {/* Footer Branding */}
          <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {/* <Sparkles size={14} color="var(--primary)" /> Secured by Kanvi Auth System */}
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

          </div>
        </div>
      </div>

      <style>{`
        input:focus { border-color: var(--primary) !important; box-shadow: 0 10px 20px -5px rgba(220, 38, 38, 0.05); }
        button:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '90vh', background: 'var(--background)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Fraunces, serif' }}>
        <div style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: '700' }}>
          Loading authentication gateway...
        </div>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
