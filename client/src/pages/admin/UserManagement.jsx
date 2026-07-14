import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../api/userAPI';
import { Card, Button, Badge, Spinner, EmptyState, Select } from '../../components/ui';
import { ShieldAlert, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers({ limit: 100 })
      .then(r => setUsers(r.data.users))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user? This action is permanent.')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-2">User Management</h1>
        <p className="text-slate-400 mb-8">Promote roles, suspend user accounts, or view registrations.</p>

        {users.length === 0 ? (
          <EmptyState icon={ShieldAlert} title="No users found" description="No user accounts exist on the platform." />
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <Card key={u._id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">{u.name}</h3>
                    <p className="text-slate-400 text-xs">{u.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">Registered: {new Date(u.createdAt).toLocaleDateString()}</span>
                      <Badge color={u.role === 'admin' ? 'red' : u.role === 'provider' ? 'amber' : 'blue'}>
                        {u.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <div className="w-32">
                    <Select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} size="sm">
                      <option value="user">User</option>
                      <option value="provider">Provider</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </div>
                  <button onClick={() => handleDelete(u._id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
