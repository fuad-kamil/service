import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, MapPin, Building, Wrench, Phone } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import toast from 'react-hot-toast';
import { Input, Button, Select } from '../../components/ui';
import { createProvider } from '../../api/providerAPI';

const STEPS_USER = ['Account'];
const STEPS_PROVIDER = ['Account', 'Business Info', 'Location'];

const PROVIDER_TYPES = [
  { value: 'hospital', label: '🏥 Hospital' },
  { value: 'clinic', label: '🩺 Clinic' },
  { value: 'diagnostic_center', label: '🔬 Diagnostic Center' },
  { value: 'individual', label: '🔧 Individual Professional' },
  { value: 'institute', label: '🎓 Institute / Training Center' },
  { value: 'company', label: '🏢 Company' },
  { value: 'other', label: '📋 Other' },
];

export default function RegisterPage() {
  const [accountType, setAccountType] = useState(null); // 'user' | 'provider'
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', password: '', providerType: 'individual', businessName: '', description: '', city: '', phone: '', profession: '', licenseNumber: '' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegisterUser = async () => {
    try {
      const data = await register({ name: form.name, email: form.email, password: form.password, role: 'user' });
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
  };

  const handleRegisterProvider = async () => {
    try {
      // 1. Register user as provider role
      const data = await register({ name: form.name, email: form.email, password: form.password, role: 'provider' });
      // 2. Create provider profile
      await createProvider({
        providerType: form.providerType,
        businessName: form.businessName,
        description: form.description,
        address: { city: form.city },
        contactInfo: { phone: form.phone },
        profession: form.profession,
        licenseNumber: form.licenseNumber,
      });
      toast.success('Registration submitted! Await admin approval.');
      navigate('/provider/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
  };

  if (!accountType) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 px-4">
        <div className="w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4"><MapPin className="w-6 h-6 text-white" /></div>
            <h1 className="font-display text-3xl font-bold text-white">Join ServiceHub</h1>
            <p className="text-slate-400 mt-1">How would you like to use ServiceHub?</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <button onClick={() => setAccountType('user')} className="group p-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-blue-500/40 hover:bg-white/[0.06] transition-all text-center">
              <User className="w-10 h-10 text-blue-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-bold text-white text-lg mb-2">I'm a Customer</h3>
              <p className="text-slate-400 text-sm">Search for services, compare prices, and contact providers.</p>
            </button>
            <button onClick={() => setAccountType('provider')} className="group p-8 bg-white/[0.03] border border-white/[0.06] rounded-2xl hover:border-amber-500/40 hover:bg-white/[0.06] transition-all text-center">
              <Wrench className="w-10 h-10 text-amber-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-display font-bold text-white text-lg mb-2">I'm a Provider</h3>
              <p className="text-slate-400 text-sm">List your services, set prices, and get discovered by customers.</p>
            </button>
          </div>
          <p className="text-center text-slate-400 text-sm mt-6">Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link></p>
        </div>
      </div>
    );
  }

  const isProvider = accountType === 'provider';
  const steps = isProvider ? STEPS_PROVIDER : STEPS_USER;

  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-bold text-white">{isProvider ? 'Register as Provider' : 'Create Account'}</h1>
          <p className="text-slate-400 mt-1">Step {step + 1} of {steps.length}: {steps[step]}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${i <= step ? 'bg-blue-600' : 'bg-white/10'}`} />)}
        </div>

        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          {step === 0 && (
            <div className="space-y-4">
              <Input label="Full Name" type="text" placeholder="John Doe" icon={User} value={form.name} onChange={e => set('name', e.target.value)} required />
              <Input label="Email" type="email" placeholder="you@example.com" icon={Mail} value={form.email} onChange={e => set('email', e.target.value)} required />
              <Input label="Password" type="password" placeholder="Min. 6 characters" icon={Lock} value={form.password} onChange={e => set('password', e.target.value)} required />
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setAccountType(null)} variant="secondary" className="flex-1">Back</Button>
                {isProvider
                  ? <Button onClick={() => { if (!form.name || !form.email || !form.password) { toast.error('Fill all fields'); return; } setStep(1); }} className="flex-1">Next</Button>
                  : <Button onClick={handleRegisterUser} loading={isLoading} className="flex-1">Create Account</Button>
                }
              </div>
            </div>
          )}

          {step === 1 && isProvider && (
            <div className="space-y-4">
              <Select label="Provider Type" value={form.providerType} onChange={e => set('providerType', e.target.value)}>
                {PROVIDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
              <Input label="Business / Professional Name" placeholder="e.g. City General Hospital" icon={Building} value={form.businessName} onChange={e => set('businessName', e.target.value)} required />
              {['individual'].includes(form.providerType) && (
                <Input label="Profession / Specialty" placeholder="e.g. Licensed Electrician" value={form.profession} onChange={e => set('profession', e.target.value)} />
              )}
              {['hospital', 'clinic', 'diagnostic_center', 'institute', 'company'].includes(form.providerType) && (
                <Input label="License / Registration Number" placeholder="Optional" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
              )}
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep(0)} variant="secondary" className="flex-1">Back</Button>
                <Button onClick={() => { if (!form.businessName) { toast.error('Business name required'); return; } setStep(2); }} className="flex-1">Next</Button>
              </div>
            </div>
          )}

          {step === 2 && isProvider && (
            <div className="space-y-4">
              <Input label="City" placeholder="e.g. Addis Ababa" icon={MapPin} value={form.city} onChange={e => set('city', e.target.value)} required />
              <Input label="Phone Number" type="tel" placeholder="+251-..." icon={Phone} value={form.phone} onChange={e => set('phone', e.target.value)} />
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setStep(1)} variant="secondary" className="flex-1">Back</Button>
                <Button onClick={handleRegisterProvider} loading={isLoading} className="flex-1">Submit Registration</Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-sm mt-4">Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link></p>
      </div>
    </div>
  );
}
