import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useTrip } from '../context/TripContext';

export const RegisterScreen: React.FC = () => {
  const { registerUser, loginWithSocial, navigateTo } = useTrip();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 2) {
      setError('Name must contain at least 2 characters');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = registerUser(name.trim(), email.trim(), password);
      setLoading(false);
      if (!result.success) {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    }, 400);
  };

  const handleSocialClick = async (provider: 'google' | 'facebook' | 'instagram' | 'apple') => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginWithSocial(provider);
      if (!res.success) {
        setError(res.error || `Failed to authenticate with ${provider}`);
      }
    } catch {
      setError(`Unable to connect to ${provider} authentication service`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B131C] flex items-center justify-center p-4 sm:p-6 text-white">
      <div className="w-full max-w-md bg-[#16222F] p-6 sm:p-8 rounded-[28px] border border-[#27384A] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {/* App Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-18 h-18 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(52,211,153,0.35)] border border-[#34D399]/40 mb-3 bg-[#0F1923] p-1">
            <img
              src="/assets/aistudio/Route_Mitra_Logo_69de06f0.jpeg"
              alt="RouteMitra"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Welcome to</span>
          <h1 className="text-3xl font-black tracking-tight mt-0.5">
            <span>Route</span>
            <span className="text-[#34D399]">Mitra</span>
          </h1>
          <p className="text-xs text-white/55 mt-1">Let's get you on the road together</p>
        </div>

        {/* ── Social Login Row: Google, Facebook, Instagram, Apple (Icons Only!) ── */}
        <div className="mt-6">
          <p className="text-[11px] font-semibold text-center text-white/50 mb-3 uppercase tracking-wider">
            Quick Connect with
          </p>
          <div className="flex items-center justify-center gap-3.5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialClick('google')}
              className="w-13 h-13 rounded-2xl bg-[#202E3E] hover:bg-[#2A3C50] border border-[#2D3E52] hover:border-[#4285F4] flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer group"
              title="Continue with Google"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleSocialClick('facebook')}
              className="w-13 h-13 rounded-2xl bg-[#202E3E] hover:bg-[#2A3C50] border border-[#2D3E52] hover:border-[#1877F2] flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer group"
              title="Continue with Facebook"
            >
              <svg className="w-6 h-6 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            {/* Instagram */}
            <button
              type="button"
              onClick={() => handleSocialClick('instagram')}
              className="w-13 h-13 rounded-2xl bg-[#202E3E] hover:bg-[#2A3C50] border border-[#2D3E52] hover:border-[#E1306C] flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer group"
              title="Continue with Instagram"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <radialGradient id="ig-grad" r="150%" cx="30%" cy="108%">
                  <stop stopColor="#fdf497" offset="0%" />
                  <stop stopColor="#fdf497" offset="5%" />
                  <stop stopColor="#fd5949" offset="45%" />
                  <stop stopColor="#d6249f" offset="60%" />
                  <stop stopColor="#285AEB" offset="90%" />
                </radialGradient>
                <path
                  fill="url(#ig-grad)"
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialClick('apple')}
              className="w-13 h-13 rounded-2xl bg-[#202E3E] hover:bg-[#2A3C50] border border-[#2D3E52] hover:border-white/50 flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer group"
              title="Continue with Apple"
            >
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.36c.64-.78 1.08-1.86.96-2.94-.93.04-2.06.62-2.73 1.4-.59.68-1.11 1.77-.97 2.83 1.04.08 2.1-.51 2.74-1.29z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-[#16222F] px-3 text-xs font-semibold text-white/40">OR</span>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Rohith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#202E3E] border border-[#2D3E52] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#34D399] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="email"
                placeholder="rohith@routemitra.app"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-[#202E3E] border border-[#2D3E52] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#34D399] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-3 bg-[#202E3E] border border-[#2D3E52] rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#34D399] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#087F5B] hover:bg-[#064E3B] text-white font-extrabold rounded-xl shadow-[0_10px_25px_rgba(8,127,91,0.35)] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/60">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigateTo('login')}
            className="text-[#34D399] font-bold hover:underline cursor-pointer"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};
