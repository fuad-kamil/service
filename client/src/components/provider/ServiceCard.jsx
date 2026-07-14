import { Link } from 'react-router-dom';
import { DollarSign, Clock, Tag, ArrowRight } from 'lucide-react';
import { Badge } from '../ui';

const PRICE_TYPE_LABELS = {
  fixed: 'Fixed',
  range: 'Range',
  per_hour: '/hr',
  per_sqm: '/sqm',
  on_request: 'On Request',
};

export function formatPrice(service) {
  if (service.priceType === 'on_request') return 'On Request';
  if (service.priceType === 'range' && service.priceMax) {
    return `$${service.price} – $${service.priceMax}`;
  }
  return `$${service.price}${service.priceType === 'per_hour' ? '/hr' : service.priceType === 'per_sqm' ? '/sqm' : ''}`;
}

export default function ServiceCard({ service, compact = false }) {
  return (
    <Link to={`/services/${service._id}`} className="block group">
      <div className={`bg-white/[0.03] border border-white/[0.06] rounded-xl hover:border-blue-500/30 hover:bg-white/[0.05] transition-all duration-300 ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {!compact && service.subcategory && (
              <p className="text-blue-400 text-xs font-medium mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3" />{service.subcategory}
              </p>
            )}
            <h4 className={`font-medium text-white group-hover:text-blue-300 transition-colors line-clamp-1 ${compact ? 'text-sm' : ''}`}>{service.name}</h4>
            {!compact && service.description && <p className="text-slate-400 text-xs mt-1 line-clamp-2">{service.description}</p>}
            {service.duration && (
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-2">
                <Clock className="w-3 h-3" />{service.duration}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-amber-400 font-bold text-sm">{formatPrice(service)}</div>
            <div className="text-slate-500 text-xs mt-0.5">{service.currency || 'USD'}</div>
          </div>
        </div>
        {!compact && service.categoryId && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{service.categoryId.icon}</span>
              <span className="text-slate-400 text-xs">{service.categoryId.name}</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors" />
          </div>
        )}
      </div>
    </Link>
  );
}
