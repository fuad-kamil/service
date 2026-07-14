import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { Input, Button } from '../../components/ui';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'provider') navigate('/provider/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-1">Sign in to your ServiceHub account</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 text-sm transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" loading={isLoading} className="w-full" size="lg">Sign In</Button>
          </form>

          <div className="mt-4 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Sign up</Link>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          Demo Admin: admin@servicehub.com / Admin@123456
        </p>
      </div>
    </div>
  );
}
