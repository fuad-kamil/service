import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, MapPin, Bell, BookmarkCheck, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return '/admin';
    if (user.role === 'provider') return '/provider/dashboard';
    return '/dashboard';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020817]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">Service<span className="text-blue-400">Hub</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="text-slate-400 hover:text-white transition-colors text-sm">Browse Services</Link>
            <Link to="/categories" className="text-slate-400 hover:text-white transition-colors text-sm">Categories</Link>
            <Link to="/about" className="text-slate-400 hover:text-white transition-colors text-sm">About</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropOpen(!dropOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                    {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" /> : (user.name ? user.name[0].toUpperCase() : 'U')}
                  </div>
                  <span className="text-sm text-slate-300 max-w-24 truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#0a1628] border border-white/10 rounded-xl shadow-2xl py-2 z-50">
                    <Link to={getDashboardLink()} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setDropOpen(false)}>
                      <LayoutDashboard className="w-4 h-4" /> Dashboard
                    </Link>
                    {user.role === 'user' && (
                      <Link to="/dashboard/saved" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setDropOpen(false)}>
                        <BookmarkCheck className="w-4 h-4" /> Saved Providers
                      </Link>
                    )}
                    <Link to={user.role === 'user' ? '/dashboard/profile' : '/provider/profile'} className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setDropOpen(false)}>
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <div className="border-t border-white/10 my-1" />
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-4 py-2">Sign In</Link>
                <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a1628] border-t border-white/5 px-4 py-4 space-y-3">
          <Link to="/search" className="block text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Browse Services</Link>
          <Link to="/categories" className="block text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Categories</Link>
          <Link to="/about" className="block text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>About</Link>
          <div className="border-t border-white/10 pt-3 space-y-2">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="block text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-red-400 py-2">Sign Out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-slate-300 hover:text-white py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium" onClick={() => setMenuOpen(false)}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
