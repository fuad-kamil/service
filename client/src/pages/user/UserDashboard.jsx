import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookmarkCheck, MessageSquare, Star, Settings, ChevronRight } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { getSavedProviders } from '../../api/userAPI';
import { getUserInquiries } from '../../api/inquiryAPI';
import { Card, Spinner, Badge } from '../../components/ui';

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [saved, setSaved] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSavedProviders().then(r => setSaved(r.data.savedProviders)),
      getUserInquiries().then(r => setInquiries(r.data.inquiries)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  const stats = [
    { icon: BookmarkCheck, label: 'Saved Providers', value: saved.length, color: 'text-blue-400', link: '/dashboard/saved' },
    { icon: MessageSquare, label: 'My Inquiries', value: inquiries.length, color: 'text-emerald-400', link: '/dashboard/inquiries' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-slate-400 mt-1">Here's your ServiceHub activity at a glance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {stats.map(s => (
            <Link key={s.label} to={s.link}>
              <Card hover className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">{s.label}</p>
                  <p className="text-white text-2xl font-bold">{s.value}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent inquiries */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-white">Recent Inquiries</h2>
            <Link to="/dashboard/inquiries" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></Link>
          </div>
          {inquiries.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-400">No inquiries yet. Browse providers to get started!</p>
              <Link to="/search" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">Browse Services →</Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {inquiries.slice(0, 5).map(inq => (
                <Card key={inq._id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-300 flex-shrink-0">
                    {inq.providerId?.businessName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{inq.subject}</p>
                    <p className="text-slate-400 text-xs truncate">To: {inq.providerId?.businessName || 'Provider'}</p>
                  </div>
                  <Badge color={inq.status === 'replied' ? 'green' : inq.status === 'read' ? 'blue' : 'gray'}>{inq.status}</Badge>
                  <span className="text-slate-500 text-xs flex-shrink-0">{new Date(inq.createdAt).toLocaleDateString()}</span>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Browse Services', desc: 'Find and compare providers', link: '/search', icon: '🔍' },
            { label: 'Saved Providers', desc: 'Your bookmarked favorites', link: '/dashboard/saved', icon: '⭐' },
            { label: 'Edit Profile', desc: 'Update your account details', link: '/dashboard/profile', icon: '⚙️' },
          ].map(a => (
            <Link key={a.label} to={a.link}>
              <Card hover className="p-5 text-center">
                <span className="text-3xl mb-3 block">{a.icon}</span>
                <p className="text-white font-medium text-sm">{a.label}</p>
                <p className="text-slate-500 text-xs mt-1">{a.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
