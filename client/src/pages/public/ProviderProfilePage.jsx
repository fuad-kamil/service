import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Globe, Mail, Clock, CheckCircle, Star, BookmarkCheck, Bookmark, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { getProvider } from '../../api/providerAPI';
import { getServicesByProvider } from '../../api/serviceAPI';
import { getProviderReviews, createReview } from '../../api/reviewAPI';
import { saveProvider, unsaveProvider } from '../../api/userAPI';
import { createInquiry } from '../../api/inquiryAPI';
import { Badge, StarRating, Spinner, Button, Textarea, Modal, Input } from '../../components/ui';
import ServiceCard from '../../components/provider/ServiceCard';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function ProviderProfilePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [provider, setProvider] = useState(null);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [isSaved, setIsSaved] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ subject: '', message: '', serviceId: '' });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showHours, setShowHours] = useState(false);

  useEffect(() => {
    Promise.all([
      getProvider(slug).then(r => setProvider(r.data.provider)),
      getServicesByProvider(slug).catch(() => []).then(r => r.data ? setServices(r.data.services) : null),
    ]).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (provider) {
      getProviderReviews(provider._id).then(r => setReviews(r.data.reviews));
    }
  }, [provider]);

  useEffect(() => {
    if (user && provider) {
      const savedList = user.savedProviders || [];
      setIsSaved(savedList.some(p => (p._id || p) === provider._id));
    } else {
      setIsSaved(false);
    }
  }, [user, provider]);


  const handleSave = async () => {
    if (!user) { toast.error('Sign in to save providers'); return; }
    try {
      if (isSaved) { await unsaveProvider(provider._id); setIsSaved(false); toast.success('Removed'); }
      else { await saveProvider(provider._id); setIsSaved(true); toast.success('Saved!'); }
    } catch { toast.error('Failed'); }
  };

  const handleInquiry = async () => {
    if (!user) { toast.error('Sign in to contact providers'); navigate('/login'); return; }
    setInquiryOpen(true);
  };

  const submitInquiry = async () => {
    if (!inquiryForm.subject || !inquiryForm.message) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      await createInquiry({ providerId: provider._id, ...inquiryForm });
      toast.success('Inquiry sent!');
      setInquiryOpen(false);
      setInquiryForm({ subject: '', message: '', serviceId: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
    finally { setSubmitting(false); }
  };

  const submitReview = async () => {
    if (!user) { toast.error('Sign in to leave a review'); return; }
    setSubmitting(true);
    try {
      const { data } = await createReview({ providerId: provider._id, ...reviewForm });
      setReviews(r => [data.review, ...r]);
      toast.success('Review submitted!');
      setReviewOpen(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;
  if (!provider) return <div className="min-h-screen pt-24 text-center text-slate-400">Provider not found</div>;

  const coords = provider.geoLocation?.coordinates;
  const hasMap = coords && coords[0] !== 0;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden mb-6">
          <div className="h-40 bg-gradient-to-br from-blue-900/40 to-purple-900/30 relative">
            {provider.photos?.[0] && <img src={provider.photos[0]} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-[#020817] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-display font-bold text-white flex-shrink-0 overflow-hidden">
                {provider.logo ? <img src={provider.logo} alt="" className="w-full h-full object-cover" /> : provider.businessName[0]}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="font-display text-2xl font-bold text-white">{provider.businessName}</h1>
                  {provider.verified && <Badge color="green"><CheckCircle className="w-3 h-3" />Verified</Badge>}
                  <Badge color="blue">{provider.providerType?.replace('_', ' ')}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{provider.address?.city}</div>
                  <div className="flex items-center gap-1"><StarRating rating={provider.averageRating} /><span className="text-amber-400 font-medium">{provider.averageRating?.toFixed(1)}</span><span>({provider.reviewCount} reviews)</span></div>
                </div>
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={handleSave} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2 text-sm text-slate-300 hover:bg-white/10 transition-colors">
                  {isSaved ? <BookmarkCheck className="w-4 h-4 text-blue-400" /> : <Bookmark className="w-4 h-4" />}
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <Button onClick={handleInquiry} className="flex items-center gap-2"><MessageSquare className="w-4 h-4" />Contact</Button>
              </div>
            </div>
            {provider.description && <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{provider.description}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1">
              {[['services', 'Services'], ['reviews', 'Reviews']].map(([tab, label]) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>{label} {tab === 'services' ? `(${services.length})` : `(${reviews.length})`}</button>
              ))}
            </div>

            {activeTab === 'services' && (
              <div className="space-y-3">
                {services.length === 0 ? <p className="text-slate-400 text-center py-8">No services listed yet.</p> :
                  services.map(s => <ServiceCard key={s._id} service={s} />)}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setReviewOpen(true)} variant="secondary" size="sm">Write a Review</Button>
                </div>
                {reviews.length === 0 ? <p className="text-slate-400 text-center py-8">No reviews yet. Be the first!</p> :
                  <div className="space-y-4">
                    {reviews.map(r => (
                      <div key={r._id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">{r.userId?.name?.[0] || 'U'}</div>
                          <div>
                            <p className="text-white text-sm font-medium">{r.userId?.name || 'User'}</p>
                            <StarRating rating={r.rating} />
                          </div>
                          <span className="text-slate-500 text-xs ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        {r.comment && <p className="text-slate-300 text-sm">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                }
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Contact info */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <h3 className="font-semibold text-white mb-3">Contact Info</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                {provider.contactInfo?.phone && <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400 flex-shrink-0" />{provider.contactInfo.phone}</li>}
                {provider.contactInfo?.email && <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />{provider.contactInfo.email}</li>}
                {provider.contactInfo?.website && <li className="flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400 flex-shrink-0" /><a href={provider.contactInfo.website} target="_blank" rel="noreferrer" className="hover:text-blue-400 truncate">{provider.contactInfo.website}</a></li>}
                {provider.address?.street && <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />{provider.address.street}, {provider.address.city}</li>}
              </ul>
            </div>

            {/* Working hours */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <button className="w-full flex items-center justify-between" onClick={() => setShowHours(!showHours)}>
                <span className="font-semibold text-white flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" />Working Hours</span>
                {showHours ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {showHours && (
                <ul className="mt-3 space-y-1 text-xs text-slate-400">
                  {DAYS.map(day => {
                    const h = provider.workingHours?.[day];
                    return (
                      <li key={day} className="flex justify-between">
                        <span className="capitalize">{day}</span>
                        <span className={h?.closed ? 'text-red-400' : 'text-emerald-400'}>{h?.closed ? 'Closed' : `${h?.open || '08:00'} – ${h?.close || '17:00'}`}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Map */}
            {hasMap && (
              <div className="rounded-xl overflow-hidden border border-white/10 h-48">
                <MapContainer center={[coords[1], coords[0]]} zoom={14} className="h-full w-full" zoomControl={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[coords[1], coords[0]]} />
                </MapContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      <Modal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} title="Contact Provider">
        <div className="space-y-4">
          {services.length > 0 && (
            <div>
              <label className="text-sm font-medium text-slate-300 block mb-1.5">Related Service (optional)</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg text-white px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" style={{ colorScheme: 'dark' }} value={inquiryForm.serviceId} onChange={e => setInquiryForm(f => ({ ...f, serviceId: e.target.value }))}>
                <option value="">General inquiry</option>
                {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          )}
          <Input label="Subject" placeholder="What is your inquiry about?" value={inquiryForm.subject} onChange={e => setInquiryForm(f => ({ ...f, subject: e.target.value }))} />
          <Textarea label="Message" placeholder="Describe your needs..." rows={4} value={inquiryForm.message} onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setInquiryOpen(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={submitInquiry} loading={submitting} className="flex-1">Send Inquiry</Button>
          </div>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={reviewOpen} onClose={() => setReviewOpen(false)} title="Write a Review">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 block mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setReviewForm(f => ({ ...f, rating: n }))} className={`text-2xl transition-transform hover:scale-110 ${n <= reviewForm.rating ? 'text-amber-400' : 'text-slate-600'}`}>★</button>
              ))}
            </div>
          </div>
          <Textarea label="Comment" placeholder="Share your experience..." rows={4} value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setReviewOpen(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={submitReview} loading={submitting} className="flex-1">Submit Review</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
