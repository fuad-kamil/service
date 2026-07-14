import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getService } from '../../api/serviceAPI';
import { createInquiry } from '../../api/inquiryAPI';
import { Card, Button, Badge, Spinner, Textarea, Modal, Input } from '../../components/ui';
import { ArrowLeft, Clock, Phone, Mail, MapPin, Tag, MessageSquare } from 'lucide-react';
import { formatPrice } from '../../components/provider/ServiceCard';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getService(id)
      .then(r => setService(r.data.service))
      .catch(() => toast.error('Failed to load service details'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = () => {
    if (!user) {
      toast.error('Please sign in to contact the provider');
      navigate('/login');
      return;
    }
    setInquiryForm({
      subject: `Inquiry regarding ${service.name}`,
      message: `Hello, I would like to inquire about your service "${service.name}". Please let me know your availability.`
    });
    setInquiryOpen(true);
  };

  const submitInquiry = async () => {
    if (!inquiryForm.subject.trim() || !inquiryForm.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setSubmitting(true);
    try {
      await createInquiry({
        providerId: service.providerId._id,
        serviceId: service._id,
        ...inquiryForm
      });
      toast.success('Inquiry sent successfully!');
      setInquiryOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;
  if (!service) return <div className="min-h-screen pt-24 text-center text-slate-400">Service not found</div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to={`/providers/${service.providerId?.slug}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Provider Profile
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Service details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge color="blue">{service.categoryId?.icon} {service.categoryId?.name}</Badge>
                {service.subcategory && <Badge color="purple"><Tag className="w-3 h-3" />{service.subcategory}</Badge>}
              </div>

              <h1 className="font-display text-3xl font-bold text-white mb-3">{service.name}</h1>
              {service.description ? (
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{service.description}</p>
              ) : (
                <p className="text-slate-500 text-sm italic">No description provided for this service.</p>
              )}

              <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5">
                {service.duration && (
                  <div>
                    <span className="text-xs text-slate-500 block">Typical Duration</span>
                    <span className="text-white text-sm font-medium flex items-center gap-1.5 mt-1">
                      <Clock className="w-4 h-4 text-blue-400" /> {service.duration}
                    </span>
                  </div>
                )}
                {service.availability && (
                  <div>
                    <span className="text-xs text-slate-500 block">Availability</span>
                    <span className="text-white text-sm font-medium flex items-center gap-1.5 mt-1">
                      <Clock className="w-4 h-4 text-emerald-400" /> {service.availability}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Provider Details Quick Card */}
            <Card className="p-6">
              <h3 className="font-display font-semibold text-lg text-white mb-4">Offered By</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xl font-display font-bold text-white flex-shrink-0 overflow-hidden">
                  {service.providerId?.logo ? <img src={service.providerId.logo} alt="" className="w-full h-full object-cover" /> : service.providerId?.businessName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-base truncate">{service.providerId?.businessName}</h4>
                  <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" /> {service.providerId?.address?.city}
                  </p>
                </div>
                <Link to={`/providers/${service.providerId?.slug}`}>
                  <Button variant="secondary" size="sm">View Profile</Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Pricing & Booking Panel */}
          <div className="space-y-4">
            <Card className="p-6 text-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">Pricing Details</span>
              <div className="text-3xl font-display font-extrabold text-amber-400 mb-1">{formatPrice(service)}</div>
              <div className="text-slate-400 text-sm mb-6">{service.currency} ({service.priceType?.replace('_', ' ')})</div>

              <Button onClick={handleContact} className="w-full py-3 flex items-center justify-center gap-2" size="lg">
                <MessageSquare className="w-4 h-4" /> Inquiry / Book
              </Button>
            </Card>

            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-white text-sm">Provider Direct Contact</h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {service.providerId?.contactInfo?.phone && (
                  <li className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-blue-400" /> {service.providerId.contactInfo.phone}</li>
                )}
                {service.providerId?.contactInfo?.email && (
                  <li className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-blue-400" /> {service.providerId.contactInfo.email}</li>
                )}
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      <Modal isOpen={inquiryOpen} onClose={() => setInquiryOpen(false)} title="Contact Provider regarding this service">
        <div className="space-y-4">
          <Input
            label="Subject"
            value={inquiryForm.subject}
            onChange={e => setInquiryForm(f => ({ ...f, subject: e.target.value }))}
            required
          />
          <Textarea
            label="Message"
            rows={5}
            value={inquiryForm.message}
            onChange={e => setInquiryForm(f => ({ ...f, message: e.target.value }))}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={() => setInquiryOpen(false)} variant="secondary" className="flex-1">Cancel</Button>
            <Button onClick={submitInquiry} loading={submitting} className="flex-1">Send Inquiry</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
