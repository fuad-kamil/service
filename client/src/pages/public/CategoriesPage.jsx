import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../../api/categoryAPI';
import { getProviders } from '../../api/providerAPI';
import { Spinner } from '../../components/ui';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCategories().then(r => { setCategories(r.data.categories); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-white mb-3">Browse by Category</h1>
          <p className="text-slate-400">Explore service providers across all industries and specialties</p>
        </div>
        {loading ? <div className="flex justify-center"><Spinner size="lg" /></div> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <button key={cat._id} onClick={() => navigate(`/categories/${cat.slug}`)} className="group flex flex-col items-center gap-4 p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-blue-500/30 hover:bg-white/[0.06] transition-all duration-300">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <div className="text-center">
                  <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">{cat.name}</p>
                  {cat.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{cat.description}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
