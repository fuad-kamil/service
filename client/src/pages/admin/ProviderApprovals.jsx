import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProviders, updateProviderStatus, verifyProvider } from '../../api/providerAPI';
import { Card, Button, Badge, Spinner, EmptyState } from '../../components/ui';
import { Check, X, ShieldAlert, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProviderApprovals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStatus = searchParams.get('status') || 'pending';
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProviders({ status: filterStatus || undefined, limit: 100 })
      .then(r => setProviders(r.data.providers))
      .catch(() => toast.error('Failed to load providers'))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateProviderStatus(id, status);
      setProviders(prev => prev.filter(p => p._id !== id));
      toast.success(`Provider registration ${status === 'active' ? 'approved' : 'rejected'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleVerifyToggle = async (id, currentVal) => {
    try {
      await verifyProvider(id, !currentVal);
      setProviders(prev => prev.map(p => p._id === id ? { ...p, verified: !currentVal } : p));
      toast.success(`Verification status updated`);
    } catch {
      toast.error('Failed to toggle verification');
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Provider Moderation</h1>
        <p className="text-slate-400 mb-6">Review provider onboarding applications and manage verification badges.</p>

        <div className="flex gap-2 mb-6">
          {[['pending', 'Pending Approvals'], ['active', 'Active Providers'], ['suspended', 'Suspended']].map(([s, label]) => (
            <button
              key={s}
              onClick={() => setSearchParams({ status: s })}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {providers.length === 0 ? (
          <EmptyState icon={ShieldAlert} title={`No ${filterStatus} providers`} description={`All caught up! No ${filterStatus} provider accounts require attention.`} />
        ) : (
          <div className="space-y-4">
            {providers.map(p => (
              <Card key={p._id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white text-base">{p.businessName}</h3>
                    <Badge color="blue">{p.providerType}</Badge>
                    {p.verified && <Badge color="green"><CheckCircle className="w-3 h-3" />Verified</Badge>}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    City: {p.address?.city} • Email: {p.contactInfo?.email || 'N/A'} • Phone: {p.contactInfo?.phone || 'N/A'}
                  </p>
                  {p.description && <p className="text-slate-400 text-xs mt-2 line-clamp-2 max-w-2xl">{p.description}</p>}
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                  {p.status === 'pending' && (
                    <>
                      <Button onClick={() => handleStatusChange(p._id, 'active')} className="bg-emerald-600 hover:bg-emerald-500 flex items-center gap-1.5" size="sm">
                        <Check className="w-4 h-4" /> Approve
                      </Button>
                      <Button onClick={() => handleStatusChange(p._id, 'suspended')} className="bg-red-600 hover:bg-red-500 flex items-center gap-1.5" size="sm">
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </>
                  )}
                  {p.status === 'active' && (
                    <>
                      <Button onClick={() => handleVerifyToggle(p._id, p.verified)} variant="secondary" size="sm">
                        {p.verified ? 'Unverify' : 'Verify'}
                      </Button>
                      <Button onClick={() => handleStatusChange(p._id, 'suspended')} className="bg-red-600 hover:bg-red-500" size="sm">
                        Suspend
                      </Button>
                    </>
                  )}
                  {p.status === 'suspended' && (
                    <Button onClick={() => handleStatusChange(p._id, 'active')} className="bg-emerald-600 hover:bg-emerald-500" size="sm">
                      Reactivate
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
