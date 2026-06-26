import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { signUp, signIn, signInWithGoogle, quickLogin, authError, signInAsFaculty } = useAuth();
  const [mode, setMode] = useState('signin'); // signin | signup | faculty
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    studentId: '',
    department: '',
    year: '',
    username: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({
        fullName: '',
        email: '',
        password: '',
        studentId: '',
        department: '',
        year: '',
        username: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function validate() {
    const errs = {};
    if (mode === 'faculty') {
      if (!form.username.trim()) errs.username = 'Username is required';
      if (!form.password) errs.password = 'Password is required';
      return errs;
    }
    if (mode === 'signup') {
      if (!form.fullName.trim()) errs.fullName = 'Name is required';
    }
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters';
    return errs;
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setErrors({});
    try {
      const user = await signInWithGoogle();
      if (user) {
        onClose();
      }
    } catch (err) {
      setErrors({ google: err.message || 'Google sign-in failed' });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (mode === 'faculty') {
        await signInAsFaculty(form.username, form.password);
        onClose();
      } else if (mode === 'signup') {
        await signUp(form.email, form.password, {
          fullName: form.fullName,
          role: 'participant',
        });
        onClose();
      } else {
        await signIn(form.email, form.password);
        onClose();
      }
    } catch (err) {
      if (mode === 'faculty') {
        setErrors({ password: err.message || 'Invalid username or password' });
      } else {
        setErrors({ email: err.message || 'Incorrect email or password' });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-md">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.2)] border border-outline-variant overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="gradient-primary p-xl text-center relative">
          <button
            onClick={onClose}
            className="absolute top-md right-md text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-sm">
            <span className="material-symbols-outlined text-white text-[32px]">event</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-white/70 mt-1">
            Access your event dashboard
          </p>
        </div>

        <div className="p-xl space-y-md">
          {/* Google Sign-In Button (only for signin/signup modes) */}
          {mode !== 'faculty' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-md py-[12px] px-lg rounded-xl border-2 border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low transition-all text-on-surface font-semibold text-label-md font-label-md disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {googleLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    <path fill="none" d="M0 0h48v48H0z"/>
                  </svg>
                )}
                {googleLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>
              {errors.google && <p className="text-[11px] text-error text-center">{errors.google}</p>}

              {/* Continue as Demo Student */}
              <button
                type="button"
                onClick={() => {
                  quickLogin({
                    email: 'demo@college.edu',
                    name: 'Demo Student',
                    studentId: 'S-202601',
                    department: 'Computer Science',
                    year: 'Third Year'
                  });
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-md py-[12px] px-lg mt-sm rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all text-primary font-semibold text-label-md font-label-md shadow-sm"
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                Continue as Demo Student
              </button>

              {/* Divider */}
              <div className="flex items-center gap-md">
                <div className="flex-1 h-px bg-outline-variant"></div>
                <span className="text-body-sm text-on-surface-variant font-medium">or</span>
                <div className="flex-1 h-px bg-outline-variant"></div>
              </div>
            </>
          )}

          {/* Mode Toggle */}
          <div className="flex bg-surface-container-high rounded-xl p-1">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrors({}); }}
              className={`flex-1 py-[6px] rounded-lg text-label-md font-label-md font-semibold transition-all whitespace-nowrap text-center ${
                mode === 'signin'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrors({}); }}
              className={`flex-1 py-[6px] rounded-lg text-label-md font-label-md font-semibold transition-all whitespace-nowrap text-center ${
                mode === 'signup'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => { setMode('faculty'); setErrors({}); }}
              className={`flex-1 py-[6px] rounded-lg text-label-md font-label-md font-semibold transition-all whitespace-nowrap text-center ${
                mode === 'faculty'
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Faculty
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-md">
            {mode === 'signup' && (
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-xs">
                  Full Name<span className="text-error ml-xs">*</span>
                </label>
                <input
                  className={`w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border ${errors.fullName ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                  placeholder="Jane Doe"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                />
                {errors.fullName && <p className="text-[11px] text-error mt-xs">{errors.fullName}</p>}
              </div>
            )}

            {mode === 'faculty' ? (
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-xs">
                  Username<span className="text-error ml-xs">*</span>
                </label>
                <input
                  className={`w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border ${errors.username ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                  type="text"
                  placeholder="alan_turing"
                  value={form.username}
                  onChange={handleChange('username')}
                />
                {errors.username && <p className="text-[11px] text-error mt-xs">{errors.username}</p>}
              </div>
            ) : (
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-xs">
                  Email<span className="text-error ml-xs">*</span>
                </label>
                <input
                  className={`w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border ${errors.email ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                  type="email"
                  placeholder="you@college.edu"
                  value={form.email}
                  onChange={handleChange('email')}
                />
                {errors.email && <p className="text-[11px] text-error mt-xs">{errors.email}</p>}
              </div>
            )}

            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-xs">
                Password<span className="text-error ml-xs">*</span>
              </label>
              <input
                className={`w-full rounded-xl px-md py-[10px] text-body-sm font-body-sm bg-surface-container-lowest border ${errors.password ? 'border-error' : 'border-outline-variant'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all`}
                type="password"
                placeholder={mode === 'faculty' ? 'password123' : 'Min 6 characters'}
                value={form.password}
                onChange={handleChange('password')}
              />
              {errors.password && <p className="text-[11px] text-error mt-xs">{errors.password}</p>}
            </div>

            {authError && (
              <div className="bg-error-container/30 border border-error/20 rounded-xl p-sm text-body-sm text-error text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white py-[10px] px-lg rounded-xl text-label-md font-label-md font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md"
            >
              {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : mode === 'faculty' ? 'Faculty Sign In' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
