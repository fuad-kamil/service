import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// Reusable UI Component Library

// Button
export function Button({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20',
    secondary: 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    ghost: 'hover:bg-white/5 text-slate-400 hover:text-white',
    amber: 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/20',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}

// Input
export function Input({ label, error, className = '', icon: Icon, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        <input
          className={`w-full bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 text-sm ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Select
export function Select({ label, error, children, value, onChange, className = '', placeholder = 'Select option...', ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = React.Children.toArray(children).map(child => {
    if (child && child.type === 'option') {
      return {
        value: child.props.value,
        label: child.props.children
      };
    }
    return null;
  }).filter(Boolean);

  const selectedOption = options.find(opt => String(opt.value) === String(value)) || options[0];

  const handleSelect = (val) => {
    if (onChange) {
      onChange({ target: { value: val } });
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && <label className="text-sm font-medium text-slate-300 block">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white/5 border border-white/10 rounded-lg text-white text-left focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all px-4 py-2.5 text-sm flex items-center justify-between cursor-pointer ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 mt-1.5 bg-[#0a1628] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 max-h-60 overflow-y-auto backdrop-blur-md">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center ${
                  String(opt.value) === String(value)
                    ? 'bg-blue-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Textarea
export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <textarea className={`w-full bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all px-4 py-2.5 text-sm resize-none ${error ? 'border-red-500' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// Badge
export function Badge({ children, color = 'blue', className = '' }) {
  const colors = {
    blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    red: 'bg-red-500/15 text-red-400 border border-red-500/20',
    gray: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[color]} ${className}`}>{children}</span>;
}

// Card
export function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-white/[0.03] border border-white/[0.06] rounded-2xl ${hover ? 'hover:border-blue-500/30 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Spinner
export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' };
  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size]} border-blue-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
}

// StarRating
export function StarRating({ rating, max = 5, size = 'sm' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5' };
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} className={`${sizes[size]} ${i < Math.round(rating) ? 'text-amber-400' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// Modal
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-[#0a1628] border border-white/10 rounded-2xl shadow-2xl overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <h3 className="font-display font-semibold text-lg text-white">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Section header
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4"><Icon className="w-8 h-8 text-slate-500" /></div>}
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-slate-400 text-sm mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
