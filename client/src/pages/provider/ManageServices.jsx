import { useState, useEffect } from 'react';
import { getMyProvider } from '../../api/providerAPI';
import { getServicesByProvider, createService, updateService, deleteService } from '../../api/serviceAPI';
import { getCategories } from '../../api/categoryAPI';
import { Card, Button, Input, Select, Textarea, Modal, Badge, Spinner, EmptyState } from '../../components/ui';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { formatPrice } from '../../components/provider/ServiceCard';
import toast from 'react-hot-toast';

const EMPTY_FORM = { categoryId: '', subcategory: '', name: '', description: '', price: '', priceMax: '', priceType: 'fixed', currency: 'ETB', duration: '', availability: '' };

export default function ManageServices() {
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  useEffect(() => {
    Promise.all([
      getMyProvider().then(r => { setProvider(r.data.provider); return r.data.provider; }),
      getCategories().then(r => setCategories(r.data.categories)),
    ]).then(([prov]) => {
      if (prov) getServicesByProvider(prov._id).then(r => setServices(r.data.services));
    }).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      categoryId: s.categoryId?._id || s.categoryId || '',
      subcategory: s.subcategory || '',
      name: s.name,
      description: s.description || '',
      price: s.price,
      priceMax: s.priceMax || '',
      priceType: s.priceType,
      currency: s.currency || 'ETB',
      duration: s.duration || '',
      availability: s.availability || '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.categoryId || !form.price) { toast.error('Name, category, and price are required'); return; }
    setSaving(true);
    try {
      if (editing) {
        const { data } = await updateService(editing._id, { ...form, price: Number(form.price), priceMax: form.priceMax ? Number(form.priceMax) : null });
        setServices(s => s.map(sv => sv._id === editing._id ? data.service : sv));
        toast.success('Service updated');
      } else {
        const { data } = await createService({ ...form, price: Number(form.price), priceMax: form.priceMax ? Number(form.priceMax) : null });
        setServices(s => [...s, data.service]);
        toast.success('Service added');
      }
      setModalOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try {
      await deleteService(id);
      setServices(s => s.filter(sv => sv._id !== id));
      toast.success('Service deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  // Group by category
  const grouped = services.reduce((acc, s) => {
    const catName = s.categoryId?.name || 'Uncategorized';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Manage Services</h1>
            <p className="text-slate-400 mt-1">{services.length} services listed</p>
          </div>
          <Button onClick={openCreate} className="flex items-center gap-2"><Plus className="w-4 h-4" />Add Service</Button>
        </div>

        {services.length === 0 ? (
          <EmptyState icon={Package} title="No services yet" description="Start adding your services with pricing to get discovered." action={<Button onClick={openCreate}>Add First Service</Button>} />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([catName, catServices]) => (
              <div key={catName}>
                <h3 className="text-slate-300 font-medium text-sm mb-3 flex items-center gap-2">
                  <span className="text-base">{catServices[0]?.categoryId?.icon}</span>{catName}
                  <Badge color="gray">{catServices.length}</Badge>
                </h3>
                <div className="space-y-2">
                  {catServices.map(s => (
                    <Card key={s._id} className="p-4 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white text-sm font-medium">{s.name}</p>
                          {s.subcategory && <Badge color="blue">{s.subcategory}</Badge>}
                        </div>
                        {s.description && <p className="text-slate-500 text-xs mt-1 truncate">{s.description}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-amber-400 font-bold text-sm">{formatPrice(s)}</p>
                        {s.duration && <p className="text-slate-500 text-xs">{s.duration}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(s._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Service' : 'Add Service'} size="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Category *" value={form.categoryId} onChange={e => set('categoryId', e.target.value)}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
            </Select>
            <Input label="Subcategory" placeholder="e.g. Blood Tests, Repair" value={form.subcategory} onChange={e => set('subcategory', e.target.value)} />
            <Input label="Service Name *" placeholder="e.g. Complete Blood Count" value={form.name} onChange={e => set('name', e.target.value)} className="md:col-span-2" />
            <Textarea label="Description" placeholder="Brief description..." rows={2} value={form.description} onChange={e => set('description', e.target.value)} className="md:col-span-2" />
            <Select label="Price Type" value={form.priceType} onChange={e => set('priceType', e.target.value)}>
              <option value="fixed">Fixed Price</option>
              <option value="range">Price Range</option>
              <option value="per_hour">Per Hour</option>
              <option value="per_sqm">Per Sqm</option>
              <option value="on_request">On Request</option>
            </Select>
            <Input label="Currency" value={form.currency} onChange={e => set('currency', e.target.value)} />
            <Input label="Price *" type="number" placeholder="0" value={form.price} onChange={e => set('price', e.target.value)} />
            {form.priceType === 'range' && <Input label="Max Price" type="number" placeholder="0" value={form.priceMax} onChange={e => set('priceMax', e.target.value)} />}
            <Input label="Duration" placeholder="e.g. 30 minutes, 2 hours" value={form.duration} onChange={e => set('duration', e.target.value)} />
            <Input label="Availability" placeholder="e.g. Mon-Fri, 24/7" value={form.availability} onChange={e => set('availability', e.target.value)} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button onClick={() => setModalOpen(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">{editing ? 'Save Changes' : 'Add Service'}</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
