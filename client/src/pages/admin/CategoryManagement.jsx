import { useState, useEffect } from 'react';
import { getCategories, createCategory, deleteCategory } from '../../api/categoryAPI';
import { Card, Button, Input, Select, Textarea, Modal, Spinner, EmptyState } from '../../components/ui';
import { Plus, Trash2, FolderTree } from 'lucide-react';
import toast from 'react-hot-toast';

const PROVIDER_TYPES = [
  'hospital', 'clinic', 'diagnostic_center', 'individual', 'institute', 'company', 'other'
];

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '🏷️', description: '', applicableProviderTypes: [] });
  const [submitting, setSubmitting] = useState(false);

  const fetchCats = () => {
    setLoading(true);
    getCategories()
      .then(r => setCategories(r.data.categories))
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleProviderTypeCheckbox = (type, checked) => {
    setForm(f => {
      const arr = checked 
        ? [...f.applicableProviderTypes, type]
        : f.applicableProviderTypes.filter(t => t !== type);
      return { ...f, applicableProviderTypes: arr };
    });
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    setSubmitting(true);
    try {
      await createCategory(form);
      toast.success('Category created successfully');
      setModalOpen(false);
      setForm({ name: '', icon: '🏷️', description: '', applicableProviderTypes: [] });
      fetchCats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category? All services under this category will no longer be categorised correctly.')) return;
    try {
      await deleteCategory(id);
      toast.success('Category deleted');
      fetchCats();
    } catch {
      toast.error('Failed to delete category');
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Category Management</h1>
            <p className="text-slate-400 mt-1">Configure service categories and applicable provider types.</p>
          </div>
          <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <EmptyState icon={FolderTree} title="No categories found" description="Create a category to allow service catalog creations." action={<Button onClick={() => setModalOpen(true)}>Create Category</Button>} />
        ) : (
          <div className="space-y-3">
            {categories.map(c => (
              <Card key={c._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white text-base">{c.name}</h3>
                    {c.description && <p className="text-slate-400 text-xs mt-0.5">{c.description}</p>}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {c.applicableProviderTypes?.map(t => (
                        <span key={t} className="text-[10px] bg-white/5 border border-white/10 text-slate-400 px-1.5 py-0.5 rounded-full capitalize">
                          {t?.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(c._id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </Card>
            ))}
          </div>
        )}

        {/* Add Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Category">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-1">
                <Input label="Icon" placeholder="🏷️" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} required />
              </div>
              <div className="col-span-3">
                <Input label="Category Name" placeholder="e.g. Laboratory Tests" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
            </div>

            <Textarea label="Description" placeholder="Short description of the category..." rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />

            <div>
              <label className="text-sm font-medium text-slate-300 block mb-2">Applicable Provider Types</label>
              <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 rounded-xl p-3">
                {PROVIDER_TYPES.map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer text-sm text-slate-300 capitalize">
                    <input
                      type="checkbox"
                      checked={form.applicableProviderTypes.includes(type)}
                      onChange={e => handleProviderTypeCheckbox(type, e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded border-white/10 bg-white/5"
                    />
                    {type.replace('_', ' ')}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={() => setModalOpen(false)} variant="secondary" className="flex-1">Cancel</Button>
              <Button onClick={handleCreate} loading={submitting} className="flex-1">Create Category</Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
