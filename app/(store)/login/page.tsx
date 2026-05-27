'use client';
import { useState, useEffect, Suspense } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Phone, ShieldCheck, ArrowRight, Lock, Sparkles, Fingerprint, ChevronLeft, Key, UserPlus, Eye, EyeOff } from 'lucide-react';

function LoginPageInner() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  useEffect(() => { setMounted(true); }, []);

  const handleModeChange = (newMode: typeof mode) => {
    setMode(newMode);
    setStep(1);
    setPassword('');
    setConfirmPassword('');
    setOtp('');
  };

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
    <div className="login-container">
      {/* Premium Background Elements */}
      <div className="bg-blur-circle bg-blur-1"></div>
      <div className="bg-blur-circle bg-blur-2"></div>
 
      <div className="login-card-wrapper">
        {/* Main Card */}
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <h1 className="login-title">
              {header.title}
            </h1>
            <p className="login-subtitle">
              {header.desc}
            </p>
          </div>

          {/* 1. PASSWORD LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handlePasswordLogin} className="login-form">
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-wrapper">
                  <div className="phone-prefix">
                    <Phone size={18} color="var(--primary)" />
                    <span className="phone-prefix-text">+91</span>
                  </div>
                  <input 
                    required 
                    type="tel"
                    maxLength={10}
                    className="login-input phone-input"
                    placeholder="98765 43210" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-row">
                  <label className="form-label">Password</label>
                  <button 
                    type="button" 
                    onClick={() => handleModeChange('forgot')}
                    className="forgot-link"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="input-wrapper">
                  <Lock className="input-icon-left" size={18} />
                  <input 
                    required 
                    type={showPassword ? 'text' : 'password'}
                    className="login-input password-input"
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button disabled={loading} className="login-submit-btn">
                {loading ? 'Signing In...' : 'Access My Account'} <ArrowRight size={20} />
              </button>

              <div className="toggle-links">
                <button 
                  type="button" 
                  onClick={() => handleModeChange('signup')}
                  className="toggle-main-link"
                >
                  <UserPlus size={16} color="var(--primary)" /> Don't have an account? Sign Up
                </button>
                <div className="divider-line"></div>
                <button 
                  type="button" 
                  onClick={() => handleModeChange('otp')}
                  className="toggle-alt-link"
                >
                  <ShieldCheck size={16} /> Sign In with OTP instead
                </button>
              </div>
            </form>
          )}

          {/* 2. PASSWORD SIGNUP */}
          {mode === 'signup' && (
            <form onSubmit={handlePasswordSignup} className="login-form">
              <div className="form-group">
                <label className="form-label">Mobile Number</label>
                <div className="input-wrapper">
                  <div className="phone-prefix">
                    <Phone size={18} color="var(--primary)" />
                    <span className="phone-prefix-text">+91</span>
                  </div>
                  <input 
                    required 
                    type="tel"
                    maxLength={10}
                    className="login-input phone-input"
                    placeholder="98765 43210" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon-left" size={18} />
                  <input 
                    required 
                    type={showPassword ? 'text' : 'password'}
                    className="login-input password-input"
                    placeholder="At least 6 characters" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Key className="input-icon-left" size={18} />
                  <input 
                    required 
                    type="password"
                    className="login-input password-input"
                    placeholder="Repeat password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                </div>
              </div>

              <button disabled={loading} className="login-submit-btn">
                {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={20} />
              </button>

              <button 
                type="button" 
                onClick={() => handleModeChange('login')}
                className="back-btn"
              >
                <ChevronLeft size={16} /> Back to Sign In
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <div className="login-form">
              {step === 1 ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Registered Mobile Number</label>
                    <div className="input-wrapper">
                      <div className="phone-prefix">
                        <Phone size={18} color="var(--primary)" />
                        <span className="phone-prefix-text">+91</span>
                      </div>
                      <input 
                        required 
                        type="tel"
                        maxLength={10}
                        className="login-input phone-input"
                        placeholder="98765 43210" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                      />
                    </div>
                  </div>

                  <button disabled={loading} className="login-submit-btn">
                    {loading ? 'Sending Code...' : 'Send Reset Code'} <ArrowRight size={20} />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => handleModeChange('login')}
                    className="back-btn"
                  >
                    <ChevronLeft size={16} /> Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Verification Code</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon-left" size={20} />
                      <input 
                        required 
                        maxLength={6}
                        className="login-input code-input"
                        placeholder="••••••" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="input-wrapper">
                      <Key className="input-icon-left" size={18} />
                      <input 
                        required 
                        type={showPassword ? 'text' : 'password'}
                        className="login-input password-input"
                        placeholder="At least 6 characters" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle-btn"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <div className="input-wrapper">
                      <Key className="input-icon-left" size={18} />
                      <input 
                        required 
                        type="password"
                        className="login-input password-input"
                        placeholder="Repeat new password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                      />
                    </div>
                  </div>

                  <button disabled={loading} className="login-submit-btn">
                    {loading ? 'Resetting Password...' : 'Reset & Access Account'} <ShieldCheck size={20} />
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="back-btn"
                  >
                    <ChevronLeft size={16} /> Edit Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 4. OTP LOGIN BACKUP */}
          {mode === 'otp' && (
            <div className="login-form">
              {step === 1 ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Mobile Number</label>
                    <div className="input-wrapper">
                      <div className="phone-prefix">
                        <Phone size={18} color="var(--primary)" />
                        <span className="phone-prefix-text">+91</span>
                      </div>
                      <input 
                        required 
                        type="tel"
                        maxLength={10}
                        className="login-input phone-input"
                        placeholder="98765 43210" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} 
                      />
                    </div>
                  </div>

                  <button disabled={loading} className="login-submit-btn">
                    {loading ? 'Sending Code...' : 'Send Verification OTP'} <ArrowRight size={20} />
                  </button>

                  <button 
                    type="button" 
                    onClick={() => handleModeChange('login')}
                    className="back-btn"
                  >
                    <ChevronLeft size={16} /> Back to Password Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Verification Code</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon-left" size={20} />
                      <input 
                        required 
                        maxLength={6}
                        className="login-input code-input"
                        placeholder="••••••" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                      />
                    </div>
                  </div>

                  <button disabled={loading} className="login-submit-btn">
                    {loading ? 'Verifying...' : 'Complete Sign In'} <ShieldCheck size={20} />
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="back-btn"
                  >
                    <ChevronLeft size={16} /> Edit Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Footer Branding */}
          <div className="login-footer">
            <div className="secured-branding">
              <Sparkles size={14} color="var(--primary)" /> Secured by Kanvi Auth System
            </div>
            <p className="terms-branding">
              By signing in, you agree to our <span className="terms-link">Privacy Policy</span> and <span className="terms-link">Terms of Service</span>.
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="security-badges">
          <div className="security-badge-item">
            <ShieldCheck size={16} /> 256-bit Encryption
          </div>
          <div className="badge-dot"></div>
          <div className="security-badge-item">
            <Fingerprint size={16} /> Biometric Ready
          </div>
        </div>
      </div>

      <style>{`
        /* Scoped Container Styles */
        .login-container {
          min-height: 90vh;
          background: var(--background);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          font-family: 'Fraunces', serif;
          position: relative;
          overflow: hidden;
        }

        .bg-blur-circle {
          position: absolute;
          width: 40%;
          height: 40%;
          border-radius: 50%;
          filter: blur(65px);
          opacity: 0.85;
          z-index: 0;
          pointer-events: none;
        }
        .bg-blur-1 {
          top: -10%;
          left: -5%;
          background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
        }
        .bg-blur-2 {
          bottom: -10%;
          right: -5%;
          background: radial-gradient(circle, var(--secondary) 0%, transparent 70%);
        }

        .login-card-wrapper {
          width: 100%;
          max-width: 460px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: var(--surface);
          border-radius: 36px;
          padding: 50px 40px;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          width: 100%;
        }

        .login-header {
          text-align: center;
          margin-bottom: 35px;
        }

        .login-title {
          font-size: 2.2rem;
          font-weight: 900;
          color: var(--text-main);
          margin: 0 0 12px 0;
          font-family: 'Fraunces', serif;
          letter-spacing: -0.02em;
        }

        .login-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          font-weight: 500;
          line-height: 1.5;
          margin: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-left: 5px;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 5px;
        }

        .forgot-link {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0;
        }
        .forgot-link:hover {
          text-decoration: underline;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input {
          width: 100%;
          background: var(--background);
          border: 2px solid var(--border);
          border-radius: 18px;
          font-family: inherit;
          color: var(--text-main);
          outline: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-sizing: border-box;
        }

        .login-input:focus {
          border-color: var(--primary) !important;
          box-shadow: 0 8px 24px -8px rgba(220, 38, 38, 0.12);
          background: var(--surface);
        }

        .phone-input {
          padding: 18px 18px 18px 80px;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .password-input {
          padding: 18px 48px 18px 52px;
          font-size: 1.1rem;
          font-weight: 750;
        }

        .code-input {
          padding: 18px 18px 18px 52px;
          font-size: 1.4rem;
          font-weight: 900;
          letter-spacing: 0.35em;
        }

        .phone-prefix {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 8px;
          border-right: 2px solid var(--border);
          padding-right: 10px;
          z-index: 10;
          pointer-events: none;
          height: 24px;
        }

        .phone-prefix-text {
          font-weight: 800;
          color: var(--text-main);
          font-size: 0.95rem;
        }

        .input-icon-left {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--primary);
          z-index: 10;
          pointer-events: none;
        }

        .password-toggle-btn {
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .password-toggle-btn:hover {
          color: var(--primary);
        }

        .login-submit-btn {
          background: var(--text-main);
          color: var(--background);
          padding: 18px;
          border-radius: 20px;
          border: none;
          font-size: 1.05rem;
          font-weight: 900;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 25px -10px rgba(0, 0, 0, 0.15);
          width: 100%;
          margin-top: 10px;
        }
        .login-submit-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.25);
          filter: brightness(1.1);
        }
        .login-submit-btn:active {
          transform: translateY(1px) scale(0.99);
        }
        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        /* Signup uses primary brand color button for variety */
        .mode-signup .login-submit-btn,
        form[onSubmit*="Signup"] .login-submit-btn,
        form[onSubmit*="Reset"] .login-submit-btn {
          background: var(--primary);
          color: white;
          box-shadow: 0 10px 25px -10px rgba(220, 38, 38, 0.3);
        }
        .mode-signup .login-submit-btn:hover,
        form[onSubmit*="Signup"] .login-submit-btn:hover,
        form[onSubmit*="Reset"] .login-submit-btn:hover {
          box-shadow: 0 12px 28px -8px rgba(220, 38, 38, 0.45);
        }

        .toggle-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
          margin-top: 15px;
        }

        .toggle-main-link {
          background: none;
          border: none;
          color: var(--text-main);
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px;
        }
        .toggle-main-link:hover {
          color: var(--primary);
          text-decoration: underline;
        }

        .divider-line {
          height: 1px;
          width: 60%;
          background: var(--border);
        }

        .toggle-alt-link {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 750;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px;
        }
        .toggle-alt-link:hover {
          color: var(--text-main);
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.85rem;
          font-weight: 750;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-top: 10px;
          padding: 5px;
          align-self: center;
        }
        .back-btn:hover {
          color: var(--text-main);
        }

        .login-footer {
          margin-top: 35px;
          padding-top: 25px;
          border-top: 1px solid var(--border);
          text-align: center;
        }

        .secured-branding {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .terms-branding {
          margin: 12px 0 0 0;
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
          line-height: 1.6;
        }

        .terms-link {
          color: var(--text-muted);
          text-decoration: underline;
          cursor: pointer;
        }
        .terms-link:hover {
          color: var(--text-main);
        }

        .security-badges {
          margin-top: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          opacity: 0.6;
        }

        .security-badge-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
        }

        .badge-dot {
          width: 4px;
          height: 4px;
          background: var(--border);
          border-radius: 50%;
        }

        /* ── RESPONSIVE MEDIA QUERIES (WOW MOBILE FEEL) ── */
        @media (max-width: 480px) {
          .login-container {
            padding: 30px 16px;
            align-items: flex-start; /* Better scrolling on tall cards */
          }
          
          .login-card-wrapper {
            margin-top: 10px;
          }

          .login-card {
            border-radius: 28px;
            padding: 35px 22px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
          }

          .login-title {
            font-size: 1.85rem;
            margin-bottom: 8px;
          }

          .login-subtitle {
            font-size: 0.88rem;
          }

          .login-form {
            gap: 16px;
          }

          .phone-input {
            padding: 15px 15px 15px 72px;
            font-size: 1rem;
          }

          .phone-prefix {
            left: 14px;
            gap: 6px;
            padding-right: 8px;
            height: 20px;
          }

          .phone-prefix-text {
            font-size: 0.9rem;
          }

          .password-input {
            padding: 15px 42px 15px 46px;
            font-size: 1rem;
          }

          .code-input {
            padding: 15px 15px 15px 46px;
            font-size: 1.25rem;
            letter-spacing: 0.25em;
          }

          .input-icon-left {
            left: 14px;
          }

          .password-toggle-btn {
            right: 14px;
          }

          .login-submit-btn {
            padding: 15px;
            border-radius: 16px;
            font-size: 0.98rem;
          }

          .toggle-main-link {
            font-size: 0.82rem;
          }

          .toggle-alt-link {
            font-size: 0.78rem;
          }

          .login-footer {
            margin-top: 25px;
            padding-top: 20px;
          }

          .security-badges {
            margin-top: 20px;
            gap: 10px;
          }
          
          .security-badge-item {
            font-size: 0.68rem;
          }
        }
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
