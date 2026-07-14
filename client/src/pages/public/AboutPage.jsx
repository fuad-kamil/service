export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl font-bold text-white mb-4">About <span className="text-blue-400">ServiceHub</span></h1>
          <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">We believe everyone deserves to know what a service costs before they commit. No hidden fees, no surprises — just transparent, comparable pricing from verified providers.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { emoji: '🎯', title: 'Our Mission', desc: 'Empower consumers with price transparency so every service decision is informed, not guesswork.' },
            { emoji: '🏆', title: 'Our Vision', desc: 'A world where anyone can find, compare, and book any service with confidence and zero friction.' },
            { emoji: '💡', title: 'Our Approach', desc: 'Structured service catalogs tailored per provider type, combined with geospatial discovery and real reviews.' },
          ].map(item => (
            <div key={item.title} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">{item.emoji}</div>
              <h3 className="font-display font-bold text-white text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/10 border border-blue-500/20 rounded-3xl p-10 text-center">
          <h2 className="font-display text-2xl font-bold text-white mb-3">Built for everyone</h2>
          <p className="text-slate-300 max-w-xl mx-auto">Whether you're a 500-bed hospital or a solo plumber, ServiceHub gives you a structured, professional presence to showcase your services and pricing to thousands of potential customers.</p>
        </div>
      </div>
    </div>
  );
}
