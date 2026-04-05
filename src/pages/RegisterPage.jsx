import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', avatar: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/register', form);
      toast.success('Admin registered successfully! Awaiting approval from the primary admin.');
      setForm({ name: '', email: '', password: '', avatar: '' });
      navigate('/login');
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('You must be logged in as an admin to register new admins. Please log in first.');
        navigate('/login');
      } else {
        toast.error(err.response?.data?.message || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Register Admin</h1>
          <p className="text-blue-300 text-sm font-medium mt-1 tracking-wide">Create a new administrator account</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl hover:shadow-2xl hover:border-white/20 transition-all duration-300">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/15 transition-all duration-200"
                placeholder="Full Name"
                required
              />
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/15 transition-all duration-200"
                placeholder="Email"
                required
              />
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/15 transition-all duration-200"
                placeholder="Password"
                required
              />
            </div>
            <div className="group">
              <label className="block text-sm font-medium text-slate-300 mb-2">Avatar URL (optional)</label>
              <input
                type="text"
                value={form.avatar}
                onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white/15 transition-all duration-200"
                placeholder="Avatar URL"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Admin'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full mt-2 py-2 bg-white/10 border border-white/20 text-blue-400 font-semibold rounded-xl transition-all duration-300 hover:bg-white/20 hover:text-blue-300"
            >
              Back to Login
            </button>
          </form>
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
