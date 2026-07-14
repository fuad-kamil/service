import { useState, useEffect } from 'react';
import { getProviderInquiries, replyToInquiry, updateInquiryStatus } from '../../api/inquiryAPI';
import { Card, Badge, Spinner, EmptyState, Button, Textarea, Modal } from '../../components/ui';
import { MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InquiriesInbox() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [replyMsg, setReplyMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    getProviderInquiries(filter ? { status: filter } : {}).then(r => setInquiries(r.data.inquiries)).finally(() => setLoading(false));
  }, [filter]);

  const handleReply = async () => {
    if (!replyMsg.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await replyToInquiry(selected._id, replyMsg);
      setInquiries(inqs => inqs.map(i => i._id === selected._id ? data.inquiry : i));
      setSelected(data.inquiry);
      setReplyMsg('');
      toast.success('Reply sent');
    } catch { toast.error('Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen pt-24 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Inquiries Inbox</h1>
        <p className="text-slate-400 mb-6">Messages from potential customers</p>

        <div className="flex gap-2 mb-6">
          {['', 'unread', 'replied', 'closed'].map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>

        {inquiries.length === 0 ? (
          <EmptyState icon={MessageSquare} title="No inquiries" description="When customers reach out, their messages will appear here." />
        ) : (
          <div className="space-y-3">
            {inquiries.map(inq => (
              <button key={inq._id} onClick={() => setSelected(inq)} className="w-full text-left">
                <Card hover className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {inq.userId?.name?.[0] || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{inq.subject}</p>
                    <p className="text-slate-500 text-xs">{inq.userId?.name} • {inq.userId?.email}</p>
                  </div>
                  {inq.serviceId && <Badge color="blue">{inq.serviceId?.name}</Badge>}
                  <Badge color={inq.status === 'unread' ? 'amber' : inq.status === 'replied' ? 'green' : 'gray'}>{inq.status}</Badge>
                  <span className="text-slate-500 text-xs flex-shrink-0">{new Date(inq.createdAt).toLocaleDateString()}</span>
                </Card>
              </button>
            ))}
          </div>
        )}

        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject} size="lg">
          {selected && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{selected.userId?.name?.[0]}</div>
                <div>
                  <p className="text-white text-sm font-medium">{selected.userId?.name}</p>
                  <p className="text-slate-500 text-xs">{selected.userId?.email} • {new Date(selected.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3 mb-4"><p className="text-slate-300 text-sm">{selected.message}</p></div>
              {selected.replies?.map((r, i) => (
                <div key={i} className={`p-3 rounded-lg mb-2 ${r.senderRole === 'provider' ? 'bg-blue-500/10 border border-blue-500/20 ml-4' : 'bg-white/5 mr-4'}`}>
                  <p className="text-xs text-slate-400 mb-1">{r.senderRole === 'provider' ? 'You' : selected.userId?.name} • {new Date(r.createdAt).toLocaleString()}</p>
                  <p className="text-slate-300 text-sm">{r.message}</p>
                </div>
              ))}
              <div className="flex gap-2 mt-4">
                <Textarea placeholder="Type your reply..." rows={2} value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="flex-1" />
                <Button onClick={handleReply} loading={submitting} className="self-end"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
