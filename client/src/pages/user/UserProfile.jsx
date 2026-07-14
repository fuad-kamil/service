import { useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import { updateProfile } from '../../api/authAPI';
import { Input, Button, Card } from '../../components/ui';
import { User, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateProfile(form);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-slate-400 mb-8">Update your personal information</p>

        <Card className="p-6 space-y-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full rounded-2xl object-cover" /> : user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-semibold">{user?.name}</p>
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </div>
          </div>

          <Input label="Name" icon={User} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Avatar URL" placeholder="https://..." value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} />

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
