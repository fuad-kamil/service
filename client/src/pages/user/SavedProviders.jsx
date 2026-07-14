import { useState, useEffect } from 'react';
import { getSavedProviders, unsaveProvider } from '../../api/userAPI';
import ProviderCard from '../../components/provider/ProviderCard';
import { Spinner, EmptyState, Button } from '../../components/ui';
import { BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function SavedProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedProviders().then(r => setProviders(r.data.savedProviders)).finally(() => setLoading(false));
  }, []);

  const handleSaveToggle = async (providerId) => {
    try {
      await unsaveProvider(providerId);
      setProviders(p => p.filter(pr => pr._id !== providerId));
      toast.success('Removed from saved');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Saved Providers</h1>
        <p className="text-slate-400 mb-8">Your bookmarked service providers</p>
        {providers.length === 0 ? (
          <EmptyState icon={BookmarkCheck} title="No saved providers" description="Save providers you like while browsing to find them easily later." action={<Link to="/search"><Button>Browse Providers</Button></Link>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map(p => <ProviderCard key={p._id} provider={p} savedIds={providers.map(pr => pr._id)} onSaveToggle={handleSaveToggle} />)}
          </div>
        )}
      </div>
    </div>
  );
}
