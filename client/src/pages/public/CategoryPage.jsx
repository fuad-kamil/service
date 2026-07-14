import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProviders } from '../../api/providerAPI';
import { getCategories } from '../../api/categoryAPI';
import ProviderCard from '../../components/provider/ProviderCard';
import { Spinner, EmptyState } from '../../components/ui';
import { Search } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams();
  const [providers, setProviders] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCategories().then(r => { const cat = r.data.categories.find(c => c.slug === slug); setCategory(cat); return cat; }),
    ]).then(([cat]) => {
      if (cat) {
        getProviders({ limit: 50 }).then(r => { setProviders(r.data.providers); setLoading(false); });
      } else setLoading(false);
    });
  }, [slug]);

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {loading ? <div className="flex justify-center py-20"><Spinner size="lg" /></div> : (
          <>
            {category && (
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-5xl">{category.icon}</span>
                  <div>
                    <h1 className="font-display text-3xl font-bold text-white">{category.name}</h1>
                    {category.description && <p className="text-slate-400 mt-1">{category.description}</p>}
                  </div>
                </div>
              </div>
            )}
            {providers.length === 0 ? (
              <EmptyState icon={Search} title="No providers in this category" description="Be the first to list your services in this category." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map(p => <ProviderCard key={p._id} provider={p} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
