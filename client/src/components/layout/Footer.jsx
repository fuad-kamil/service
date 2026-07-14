import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#020817] border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">Service<span className="text-blue-400">Hub</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">Know the price before you go. Find and compare services near you instantly.</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2">
              {[['Browse Services', '/search'], ['Categories', '/categories'], ['About', '/about']].map(([label, href]) => (
                <li key={href}><Link to={href} className="text-slate-400 hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* For providers */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Providers</h4>
            <ul className="space-y-2">
              {[['Register as Provider', '/register'], ['Provider Dashboard', '/provider/dashboard'], ['List Your Services', '/register']].map(([label, href]) => (
                <li key={label}><Link to={href} className="text-slate-400 hover:text-white text-sm transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-blue-400" /> fuadkamilmohammed@gmail.com</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-blue-400" /> +251952669175</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 ServiceHub. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Github className="w-4 h-4" /></a>
            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
