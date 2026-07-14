import { useState, useEffect } from 'react';
import { getMyProvider, updateProvider } from '../../api/providerAPI';
import { uploadImage } from '../../api/userAPI';
import { Input, Textarea, Select, Button, Card, Spinner } from '../../components/ui';
import { Building, MapPin, Phone, Mail, Globe, Upload, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const TYPES = [
  { value: 'hospital', label: 'Hospital' }, { value: 'clinic', label: 'Clinic' },
  { value: 'diagnostic_center', label: 'Diagnostic Center' }, { value: 'individual', label: 'Individual' },
  { value: 'institute', label: 'Institute' }, { value: 'company', label: 'Company' }, { value: 'other', label: 'Other' },
];

export default function ManageProfile() {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [form, setForm] = useState({});
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    getMyProvider().then(r => {
      const p = r.data.provider;
      setProvider(p);
      setForm({
        businessName: p.businessName || '',
        providerType: p.providerType || '',
        description: p.description || '',
        profession: p.profession || '',
        yearsOfExperience: p.yearsOfExperience || '',
        street: p.address?.street || '',
        city: p.address?.city || '',
        country: p.address?.country || '',
        phone: p.contactInfo?.phone || '',
        email: p.contactInfo?.email || '',
        website: p.contactInfo?.website || '',
        lng: p.geoLocation?.coordinates?.[0] || '',
        lat: p.geoLocation?.coordinates?.[1] || '',
        logo: p.logo || '',
        coverPhoto: p.photos?.[0] || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingCover(true);

    try {
      const res = await uploadImage(formData);
      if (type === 'logo') {
        set('logo', res.data.url);
        toast.success('Logo uploaded successfully!');
      } else {
        set('coverPhoto', res.data.url);
        toast.success('Cover photo uploaded successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        businessName: form.businessName,
        providerType: form.providerType,
        description: form.description,
        profession: form.profession,
        yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined,
        address: { street: form.street, city: form.city, country: form.country },
        contactInfo: { phone: form.phone, email: form.email, website: form.website },
        logo: form.logo || null,
        photos: form.coverPhoto ? [form.coverPhoto] : [],
      };
      if (form.lng && form.lat) payload.geoLocation = { type: 'Point', coordinates: [parseFloat(form.lng), parseFloat(form.lat)] };
      await updateProvider(provider._id, payload);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-8">Edit Provider Profile</h1>
        <div className="space-y-6">
          {/* Cover & Logo Upload Card */}
          <Card className="overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-blue-900/40 to-purple-900/30 relative flex items-center justify-center">
              {form.coverPhoto ? (
                <img src={form.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-500">
                  <Image className="w-8 h-8 mx-auto mb-1 text-slate-600" />
                  <p className="text-xs font-semibold">No Cover Photo</p>
                </div>
              )}
              
              {uploadingCover && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Spinner size="sm" />
                </div>
              )}
              
              <div className="absolute top-3 right-3 flex gap-2">
                <Button variant="secondary" size="sm" className="relative cursor-pointer">
                  {form.coverPhoto ? 'Change Cover' : 'Upload Cover'}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => handleImageUpload(e, 'cover')}
                    disabled={uploadingCover}
                  />
                </Button>
                {form.coverPhoto && (
                  <Button variant="ghost" size="sm" onClick={() => set('coverPhoto', '')} disabled={uploadingCover}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
            
            <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl border-4 border-[#020817] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-display font-bold text-white flex-shrink-0 overflow-hidden relative -mt-10">
                {form.logo ? (
                  <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  form.businessName?.[0]?.toUpperCase() || 'P'
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-semibold text-white text-base">Business Logo</h3>
                <p className="text-slate-500 text-xs mt-0.5">Recommended square image, max 5MB</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" className="relative cursor-pointer">
                  {form.logo ? 'Change Logo' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={e => handleImageUpload(e, 'logo')}
                    disabled={uploadingLogo}
                  />
                </Button>
                {form.logo && (
                  <Button variant="ghost" size="sm" onClick={() => set('logo', '')} disabled={uploadingLogo}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Business Information</h3>
            <Input label="Business Name" icon={Building} value={form.businessName} onChange={e => set('businessName', e.target.value)} />
            <Select label="Provider Type" value={form.providerType} onChange={e => set('providerType', e.target.value)}>{TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</Select>
            <Textarea label="Description" rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
          </Card>
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Location</h3>
            <Input label="Street" icon={MapPin} value={form.street} onChange={e => set('street', e.target.value)} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={form.city} onChange={e => set('city', e.target.value)} />
              <Input label="Country" value={form.country} onChange={e => set('country', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Longitude" type="number" step="any" value={form.lng} onChange={e => set('lng', e.target.value)} />
              <Input label="Latitude" type="number" step="any" value={form.lat} onChange={e => set('lat', e.target.value)} />
            </div>
          </Card>
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-white">Contact</h3>
            <Input label="Phone" icon={Phone} value={form.phone} onChange={e => set('phone', e.target.value)} />
            <Input label="Email" icon={Mail} value={form.email} onChange={e => set('email', e.target.value)} />
            <Input label="Website" icon={Globe} value={form.website} onChange={e => set('website', e.target.value)} />
          </Card>
          <div className="flex justify-end"><Button onClick={handleSave} loading={saving} size="lg">Save Profile</Button></div>
        </div>
      </div>
    </div>
  );
}
