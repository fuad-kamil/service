import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MessageSquare, Star, Package, ChevronRight, AlertTriangle } from 'lucide-react';
import { getMyProvider, getProviderAnalytics } from '../../api/providerAPI';
import { getProviderInquiries } from '../../api/inquiryAPI';
import { Card, Badge, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

export default function ProviderDashboard() {
  const [provider, setProvider] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyProvider()
      .then(async (r) => {
        const prov = r.data.provider;
        setProvider(prov);
        const [analyticsRes, inquiriesRes] = await Promise.all([
          getProviderAnalytics(prov._id),
          getProviderInquiries(),
        ]);
        setAnalytics(analyticsRes.data.analytics);
        setRecentInquiries(inquiriesRes.data.inquiries.slice(0, 5));
      })
      .catch(() => toast.error('Could not load provider profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  if (!provider) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center px-4">
        <Card className="p-10 text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-white mb-2">No Provider Profile</h2>
          <p className="text-slate-400 text-sm mb-4">You haven't created a provider profile yet. Complete registration to start listing services.</p>
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Complete Registration →</Link>
        </Card>
      </div>
    );
  }

  const stats = [
    { icon: Eye, label: 'Profile Views', value: analytics?.profileViews || 0, color: 'text-blue-400' },
    { icon: MessageSquare, label: 'Inquiries', value: analytics?.inquiryCount || 0, color: 'text-emerald-400' },
    { icon: Package, label: 'Services', value: analytics?.serviceCount || 0, color: 'text-purple-400' },
    { icon: Star, label: 'Rating', value: analytics?.averageRating?.toFixed(1) || '—', color: 'text-amber-400' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Status banner */}
        {provider.status !== 'active' && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-medium text-sm">Your profile is {provider.status}</p>
              <p className="text-amber-400/70 text-xs">{provider.status === 'pending' ? 'An admin will review and approve your profile shortly.' : 'Contact support for more information.'}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white flex items-center gap-3">
              {provider.businessName}
              {provider.verified && <Badge color="green">Verified</Badge>}
              <Badge color={provider.status === 'active' ? 'green' : provider.status === 'pending' ? 'amber' : 'red'}>{provider.status}</Badge>
            </h1>
            <p className="text-slate-400 mt-1">Provider Dashboard</p>
          </div>
          <Link to="/provider/profile" className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 text-sm transition-colors">Edit Profile</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <Card key={s.label} className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <span className="text-slate-400 text-sm">{s.label}</span>
              </div>
              <p className="text-white text-2xl font-bold">{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Quick links + Recent inquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick actions */}
          <div>
            <h2 className="font-display text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {[
                { label: 'Manage Services', desc: 'Add, edit, or remove your service listings', link: '/provider/services', icon: '📋' },
                { label: 'View Inquiries', desc: 'Respond to customer messages', link: '/provider/inquiries', icon: '💬' },
                { label: 'Edit Profile', desc: 'Update your business information', link: '/provider/profile', icon: '⚙️' },
                { label: 'View Public Profile', desc: 'See how customers see you', link: `/providers/${provider.slug}`, icon: '👁️' },
              ].map(a => (
                <Link key={a.label} to={a.link}>
                  <Card hover className="p-4 flex items-center gap-4">
                    <span className="text-2xl">{a.icon}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{a.label}</p>
                      <p className="text-slate-500 text-xs">{a.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent inquiries */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-white">Recent Inquiries</h2>
              <Link to="/provider/inquiries" className="text-blue-400 text-sm hover:text-blue-300">View all →</Link>
            </div>
            {recentInquiries.length === 0 ? (
              <Card className="p-8 text-center"><p className="text-slate-400 text-sm">No inquiries yet.</p></Card>
            ) : (
              <div className="space-y-3">
                {recentInquiries.map(inq => (
                  <Card key={inq._id} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {inq.userId?.name?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{inq.subject}</p>
                      <p className="text-slate-500 text-xs">from {inq.userId?.name}</p>
                    </div>
                    <Badge color={inq.status === 'unread' ? 'amber' : 'gray'}>{inq.status}</Badge>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
