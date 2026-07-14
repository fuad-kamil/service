import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Map, Grid, X, SlidersHorizontal } from 'lucide-react';
import { getProviders } from '../../api/providerAPI';
import { getCategories } from '../../api/categoryAPI';
import ProviderCard from '../../components/provider/ProviderCard';
import { Spinner, Button, Select, Input, EmptyState } from '../../components/ui';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const PROVIDER_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'diagnostic_center', label: 'Diagnostic Center' },
  { value: 'individual', label: 'Individual' },
  { value: 'institute', label: 'Institute' },
  { value: 'company', label: 'Company' },
];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    providerType: searchParams.get('providerType') || '',
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') || '',
    verified: searchParams.get('verified') || '',
  });

  useEffect(() => { getCategories().then(r => setCategories(r.data.categories)); }, []);

  const fetchProviders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const { data } = await getProviders(params);
      setProviders(data.providers);
      setTotal(data.total);
      setPages(data.pages);
      setCurrentPage(page);
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProviders(1); }, [filters]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const resetFilters = () => setFilters({ search: '', category: '', providerType: '', city: '', minRating: '', verified: '' });

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search header */}
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, providers..."
                value={filters.search}
                onChange={e => setFilter('search', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchProviders(1)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm transition-all"
              />
            </div>
            <Button onClick={() => setShowFilters(!showFilters)} variant="secondary" className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && <span className="w-5 h-5 bg-blue-600 rounded-full text-xs flex items-center justify-center">{activeFilterCount}</span>}
            </Button>
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button onClick={() => setViewMode('grid')} className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'} transition-colors`}><Grid className="w-4 h-4" /></button>
              <button onClick={() => setViewMode('map')} className={`px-3 py-2 ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'} transition-colors`}><Map className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Select value={filters.providerType} onChange={e => setFilter('providerType', e.target.value)} label="Type">
                  {PROVIDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
                <Select value={filters.category} onChange={e => setFilter('category', e.target.value)} label="Category">
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                </Select>
                <Input label="City" placeholder="e.g. Addis Ababa" value={filters.city} onChange={e => setFilter('city', e.target.value)} />
                <Select value={filters.minRating} onChange={e => setFilter('minRating', e.target.value)} label="Min Rating">
                  <option value="">Any Rating</option>
                  <option value="3">3★ & above</option>
                  <option value="4">4★ & above</option>
                  <option value="4.5">4.5★ & above</option>
                </Select>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                    <input type="checkbox" checked={filters.verified === 'true'} onChange={e => setFilter('verified', e.target.checked ? 'true' : '')} className="w-4 h-4 accent-blue-600" />
                    <span className="text-sm text-slate-300">Verified only</span>
                  </label>
                  <button onClick={resetFilters} className="text-slate-500 hover:text-white text-xs flex items-center gap-1 pb-2.5 ml-auto"><X className="w-3 h-3" />Clear</button>
                </div>
              </div>
            </div>
          )}

          <div className="text-slate-400 text-sm">{loading ? 'Searching...' : `${total} providers found`}</div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : providers.length === 0 ? (
          <EmptyState icon={Search} title="No providers found" description="Try adjusting your search filters or search for a different term." action={<Button onClick={resetFilters} variant="secondary">Clear Filters</Button>} />
        ) : viewMode === 'map' ? (
          <div className="rounded-2xl overflow-hidden border border-white/10 h-[600px]">
            <MapContainer center={[9.0254, 38.7578]} zoom={12} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap' />
              {providers.filter(p => p.geoLocation?.coordinates?.[0]).map(p => (
                <Marker key={p._id} position={[p.geoLocation.coordinates[1], p.geoLocation.coordinates[0]]}>
                  <Popup>
                    <div className="text-sm">
                      <strong>{p.businessName}</strong><br />
                      <span>★ {p.averageRating?.toFixed(1) || '—'}</span><br />
                      <Link to={`/providers/${p.slug}`} className="text-blue-600 hover:underline">View Profile →</Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map(p => <ProviderCard key={p._id} provider={p} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => fetchProviders(page)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === currentPage ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
