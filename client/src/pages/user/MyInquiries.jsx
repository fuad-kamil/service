import { useState, useEffect } from 'react';
import { getUserInquiries, replyToInquiry } from '../../api/inquiryAPI';
import { Card, Badge, Spinner, EmptyState, Button, Textarea, Modal } from '../../components/ui';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyMsg, setReplyMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getUserInquiries().then(r => setInquiries(r.data.inquiries)).finally(() => setLoading(false));
  }, []);

  const handleReply = async () => {
    if (!replyMsg.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await replyToInquiry(selected._id, replyMsg);
      setInquiries(inqs => inqs.map(i => i._id === selected._id ? data.inquiry : i));
      setSelected(data.inquiry);
      setReplyMsg('');
      toast.success('Reply sent');
    } catch { toast.error('Failed to send reply'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-2">My Inquiries</h1>
        <p className="text-slate-400 mb-8">Messages you've sent to service providers</p>

        {inquiries.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No inquiries yet" description="Contact a provider to start a conversation." />
        ) : (
          <div className="space-y-3">
            {inquiries.map(inq => (
              <button key={inq._id} onClick={() => setSelected(inq)} className="w-full text-left">
                <Card hover className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-300 flex-shrink-0">
                    {inq.providerId?.businessName?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{inq.subject}</p>
                    <p className="text-slate-400 text-xs truncate">{inq.providerId?.businessName}</p>
                  </div>
                  <Badge color={inq.status === 'replied' ? 'green' : inq.status === 'read' ? 'blue' : 'gray'}>{inq.status}</Badge>
                  <span className="text-slate-500 text-xs">{new Date(inq.createdAt).toLocaleDateString()}</span>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* Inquiry Detail Modal */}
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject} size="lg">
          {selected && (
            <div>
              <div className="text-xs text-slate-500 mb-3">To: {selected.providerId?.businessName} • {new Date(selected.createdAt).toLocaleString()}</div>
              <div className="bg-white/5 rounded-lg p-3 mb-4">
                <p className="text-slate-300 text-sm">{selected.message}</p>
              </div>
              {selected.replies?.length > 0 && (
                <div className="space-y-3 mb-4">
                  {selected.replies.map((r, i) => (
                    <div key={i} className={`p-3 rounded-lg ${r.senderRole === 'provider' ? 'bg-blue-500/10 border border-blue-500/20 ml-4' : 'bg-white/5 mr-4'}`}>
                      <p className="text-xs text-slate-400 mb-1">{r.senderRole === 'provider' ? 'Provider' : 'You'} • {new Date(r.createdAt).toLocaleString()}</p>
                      <p className="text-slate-300 text-sm">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <Textarea placeholder="Type a reply..." rows={2} value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="flex-1" />
                <Button onClick={handleReply} loading={submitting} className="self-end"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
