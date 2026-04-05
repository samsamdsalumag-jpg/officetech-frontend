import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Cpu, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', avatar: '' });
  const [registerLoading, setRegisterLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    try {
      const res = await API.post('/auth/register', registerForm);
      toast.success('Admin registered!');
      setRegisterForm({ name: '', email: '', password: '', avatar: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
      {/* Inventory-themed SVG background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect width="1440" height="900" fill="#0f172a" />
          <g opacity="0.12">
            <rect x="200" y="100" width="180" height="60" rx="12" fill="#38bdf8" /> {/* Shelf */}
            <rect x="400" y="200" width="120" height="80" rx="16" fill="#6366f1" /> {/* Box */}
            <rect x="900" y="300" width="220" height="60" rx="12" fill="#fbbf24" /> {/* Clipboard */}
            <rect x="700" y="500" width="160" height="40" rx="8" fill="#f87171" /> {/* Barcode */}
            <rect x="1100" y="150" width="100" height="100" rx="20" fill="#10b981" /> {/* Warehouse */}
          </g>
        </svg>
      </div>

      <div className="relative w-full max-w-sm z-10 animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105">
              <Cpu className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white text-gradient">LOOCKAGE</h1>
          <p className="text-blue-300 text-sm font-medium mt-1 tracking-wide">Tech Inventory</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-2xl hover:border-white/20 transition-all duration-300">
          <h2 className="text-xl font-semibold text-white mb-1">Administrator Login</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to manage your inventory</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 hover:border-white/30 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/15 transition-all duration-200"
                placeholder="Email"
                required
              />
            </div>

            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-white/10 border border-white/20 hover:border-white/30 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white/15 transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-10 text-center">
            <span className="text-slate-400">New admin?</span>{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Register here</a>
          </div>

          <footer className="w-full mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <div className="border-t pt-4">
              © {new Date().getFullYear()} LOOCKAGE. All Rights Reserved.
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
