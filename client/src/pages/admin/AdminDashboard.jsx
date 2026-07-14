import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ShieldCheck, FolderTree, FileQuestion, ChevronRight, AlertCircle } from 'lucide-react';
import { getAllUsers } from '../../api/userAPI';
import { getProviders } from '../../api/providerAPI';
import { getCategories } from '../../api/categoryAPI';
import { Card, Spinner, Badge, Button } from '../../components/ui';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, providers: 0, pendingProviders: 0, categories: 0 });
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllUsers({ limit: 1 }).then(r => r.data.total),
      getProviders({ limit: 1 }).then(r => r.data.total),
      getProviders({ limit: 5, status: 'pending' }).then(r => {
        setPendingList(r.data.providers);
        return r.data.total;
      }),
      getCategories().then(r => r.data.categories.length)
    ]).then(([users, providers, pendingCount, categories]) => {
      setStats({ users, providers, pendingProviders: pendingCount, categories });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.users, color: 'text-blue-400', link: '/admin/users' },
    { icon: ShieldCheck, label: 'Active Providers', value: stats.providers, color: 'text-emerald-400', link: '/admin/providers?status=active' },
    { icon: AlertCircle, label: 'Pending Approvals', value: stats.pendingProviders, color: 'text-amber-400', link: '/admin/providers?status=pending' },
    { icon: FolderTree, label: 'Categories', value: stats.categories, color: 'text-purple-400', link: '/admin/categories' }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-white">Admin Control Panel</h1>
          <p className="text-slate-400 mt-1">Manage users, approve providers, and configure categories.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(c => (
            <Link key={c.label} to={c.link}>
              <Card hover className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{c.label}</p>
                  <p className="text-white text-2xl font-bold">{c.value}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Approvals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-white">Pending Approvals</h2>
              <Link to="/admin/providers?status=pending" className="text-blue-400 text-sm hover:text-blue-300">View all →</Link>
            </div>
            {pendingList.length === 0 ? (
              <Card className="p-8 text-center text-slate-400">No pending registrations at the moment.</Card>
            ) : (
              <div className="space-y-3">
                {pendingList.map(p => (
                  <Card key={p._id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{p.businessName}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{p.providerType} • {p.address?.city}</p>
                    </div>
                    <Link to="/admin/providers">
                      <Button variant="secondary" size="sm">Manage</Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Quick Tasks */}
          <div>
            <h2 className="font-display text-lg font-bold text-white mb-4">Platform Settings</h2>
            <div className="space-y-3">
              {[
                { title: 'Add New Category', desc: 'Create top-level or sub-categories', link: '/admin/categories', icon: '📁' },
                { title: 'Moderate Providers', desc: 'Verify trust and review details', link: '/admin/providers', icon: '🛡️' },
                { title: 'User Management', desc: 'Suspend accounts or promote administrators', link: '/admin/users', icon: '👥' },
              ].map(t => (
                <Link key={t.title} to={t.link}>
                  <Card hover className="p-4 flex items-center gap-4">
                    <span className="text-2xl">{t.icon}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{t.title}</p>
                      <p className="text-slate-500 text-xs">{t.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
