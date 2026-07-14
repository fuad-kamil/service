import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Shield, Zap, ChevronRight, ArrowRight } from 'lucide-react';
import { getCategories } from '../../api/categoryAPI';
import { getProviders } from '../../api/providerAPI';
import ProviderCard from '../../components/provider/ProviderCard';
import { Spinner } from '../../components/ui';

const STATS = [
  { value: '500+', label: 'Service Providers' },
  { value: '50+', label: 'Categories' },
  { value: '10K+', label: 'Services Listed' },
  { value: '4.8★', label: 'Average Rating' },
];

const HOW_IT_WORKS = [
  { icon: Search, title: 'Search', desc: 'Type any service — "MRI scan", "plumber", "math tutor"' },
  { icon: Star, title: 'Compare', desc: 'View prices, ratings, and details side by side' },
  { icon: MapPin, title: 'Discover', desc: 'Find providers near you on an interactive map' },
  { icon: Zap, title: 'Connect', desc: 'Contact the best match directly through the platform' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getCategories().then(r => setCategories(r.data.categories.slice(0, 12))),
      getProviders({ limit: 6, status: 'active' }).then(r => setFeaturedProviders(r.data.providers)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-[#020817] to-[#020817]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(59,130,246,0.12) 0%, transparent 60%)' }} />
        <div className="absolute top-32 left-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute top-48 right-1/4 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-6">
            <Shield className="w-3.5 h-3.5" />
            Verified providers — transparent pricing
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Know the <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">price</span><br />before you go
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            Search and compare services from hospitals, clinics, tradespeople, and professionals. Real prices, no surprises.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder='Try "MRI scan", "plumber", "math tutor"...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-base transition-all"
              />
            </div>
            <button type="submit" className="px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 whitespace-nowrap">
              Search <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-slate-500 text-sm">Popular: <button onClick={() => navigate('/search?search=CBC test')} className="text-blue-400 hover:underline">CBC test</button>, <button onClick={() => navigate('/search?search=plumber')} className="text-blue-400 hover:underline">plumber</button>, <button onClick={() => navigate('/search?search=electrician')} className="text-blue-400 hover:underline">electrician</button>, <button onClick={() => navigate('/search?search=CT scan')} className="text-blue-400 hover:underline">CT scan</button></p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-slate-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Browse by Category</h2>
            <p className="text-slate-400 mt-1">Explore services across all industries</p>
          </div>
          <button onClick={() => navigate('/categories')} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? <Spinner size="lg" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(cat => (
              <button key={cat._id} onClick={() => navigate(`/categories/${cat.slug}`)} className="group flex flex-col items-center gap-3 p-4 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-blue-500/30 hover:bg-white/[0.06] transition-all duration-300">
                <span className="text-3xl">{cat.icon}</span>
                <span className="text-slate-300 group-hover:text-white text-xs font-medium text-center leading-tight transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Featured Providers */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">Featured Providers</h2>
            <p className="text-slate-400 mt-1">Top-rated, verified service providers</p>
          </div>
          <button onClick={() => navigate('/search')} className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        {loading ? <Spinner size="lg" /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProviders.map(p => <ProviderCard key={p._id} provider={p} />)}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-white mb-2">How It Works</h2>
            <p className="text-slate-400">Find and connect with the right service provider in minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="text-center p-6 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-blue-400" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 rounded-full text-xs font-bold text-white flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20 rounded-3xl p-10 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-3">Are you a service provider?</h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">List your services with transparent pricing and get discovered by thousands of customers looking for what you offer.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/register')} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors">Register as Provider</button>
            <button onClick={() => navigate('/about')} className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold transition-colors">Learn More</button>
          </div>
        </div>
      </section>
    </div>
  );
}
