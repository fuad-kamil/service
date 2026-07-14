import { Link } from 'react-router-dom';
import { MapPin, Star, CheckCircle, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import { Badge, StarRating } from '../ui';
import { saveProvider, unsaveProvider } from '../../api/userAPI';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { useState } from 'react';

const PROVIDER_TYPE_LABELS = {
  hospital: 'Hospital',
  clinic: 'Clinic',
  diagnostic_center: 'Diagnostic Center',
  individual: 'Individual',
  institute: 'Institute',
  company: 'Company',
  other: 'Other',
};

const TYPE_COLORS = {
  hospital: 'red',
  clinic: 'blue',
  diagnostic_center: 'purple',
  individual: 'amber',
  institute: 'green',
  company: 'gray',
  other: 'gray',
};

export default function ProviderCard({ provider, savedIds = [], onSaveToggle }) {
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const isSaved = savedIds.includes(provider._id);

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Sign in to save providers'); return; }
    setSaving(true);
    try {
      if (isSaved) {
        await unsaveProvider(provider._id);
        toast.success('Removed from saved');
      } else {
        await saveProvider(provider._id);
        toast.success('Provider saved!');
      }
      onSaveToggle?.(provider._id, !isSaved);
    } catch {
      toast.error('Failed to update saved providers');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Link to={`/providers/${provider.slug}`} className="block group">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-blue-500/30 hover:bg-white/[0.05] transition-all duration-300">
        {/* Cover / Logo */}
        <div className="relative h-36 bg-gradient-to-br from-blue-900/40 to-purple-900/30 flex items-center justify-center">
          {provider.logo ? (
            <img src={provider.logo} alt={provider.businessName} className="h-full w-full object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-blue-700/30 border border-blue-500/20 flex items-center justify-center text-3xl font-display font-bold text-blue-300">
              {provider.businessName[0]}
            </div>
          )}
          {/* Save button */}
          <button onClick={handleSaveToggle} disabled={saving} className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            {isSaved ? <BookmarkCheck className="w-4 h-4 text-blue-400" /> : <Bookmark className="w-4 h-4" />}
          </button>
          {provider.verified && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-emerald-500/20 backdrop-blur border border-emerald-500/30 rounded-full px-2 py-0.5">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Verified</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-display font-semibold text-white group-hover:text-blue-300 transition-colors line-clamp-1">{provider.businessName}</h3>
            <Badge color={TYPE_COLORS[provider.providerType]}>{PROVIDER_TYPE_LABELS[provider.providerType]}</Badge>
          </div>

          <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{provider.address?.city}{provider.address?.country ? `, ${provider.address.country}` : ''}</span>
          </div>

          {provider.description && (
            <p className="text-slate-400 text-xs line-clamp-2 mb-3">{provider.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <StarRating rating={provider.averageRating || 0} />
              <span className="text-amber-400 text-xs font-medium">{provider.averageRating?.toFixed(1) || '—'}</span>
              <span className="text-slate-500 text-xs">({provider.reviewCount || 0})</span>
            </div>
            {provider.contactInfo?.phone && (
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <Clock className="w-3 h-3" />
                <span>Open</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
