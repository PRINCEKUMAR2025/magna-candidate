import Link from 'next/link';

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
      </svg>
    ),
    title: 'Real Recruiters, Not Bots',
    desc: 'Every recruiter on our platform is verified. When you get a call, it\'s from a human who has already reviewed your profile.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    ),
    title: 'Only Relevant Roles Reach You',
    desc: 'Our AI filters noise. You only appear in searches for roles that genuinely match your skills, saving you from hundreds of irrelevant emails.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/>
      </svg>
    ),
    title: 'Interview Confirmed Before You Show Up',
    desc: 'You receive a WhatsApp + email confirmation with every interview detail — date, time, company, and role — before you spend a single hour preparing.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
      </svg>
    ),
    title: 'Vetted Companies Only',
    desc: 'We only work with serious, growth-stage companies and established enterprises. No spam job offers, no ghost listings.',
  },
];

export default function MagnaDifferenceSection() {
  return (
    <section className="py-20" style={{ background: 'linear-gradient(180deg, #faf5ff 0%, #fff 100%)' }}>
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-14">
          <h2 className="text-4xl max-md:text-3xl font-bold mb-4" style={{ color: '#1a1a2e' }}>
            Why Candidates Choose Magna Hire
          </h2>
          <p className="text-lg text-gray-500">
            We don&apos;t just post jobs. We build a bridge between your profile and the recruiter who is
            actively looking for someone exactly like you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {FEATURES.map((f) => (
            <div key={f.title} className="flex gap-5 bg-white rounded-2xl p-7 border border-purple-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(160,32,240,0.1)', color: '#a020f0' }}>
                {f.icon}
              </div>
              <div>
                <h4 className="font-bold text-lg mb-2" style={{ color: '#1a1a2e' }}>{f.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Connection callout */}
        <div className="rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #a020f0 0%, #7c3aed 100%)' }}>
          <div className="grid md:grid-cols-2 gap-0">
            {/* left text */}
            <div className="p-10 md:p-14">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-white text-sm font-semibold mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                AI Recruiter Network · Active Now
              </div>
              <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
                Your Profile Lives Inside the Recruiter&apos;s AI Dashboard
              </h3>
              <p className="text-white/80 leading-relaxed mb-6">
                Magna Hire powers an AI-assisted recruiter dashboard used by hiring managers daily.
                When a recruiter searches for a candidate, the AI instantly surfaces the best-matched
                profiles from our network — including <strong className="text-white">yours</strong>.
                <br /><br />
                No more sending CVs into the void. Your profile reaches decision-makers who are
                already looking.
              </p>
              <Link href="/register" className="hami-btn btn-2">
                Join the Candidate Network
              </Link>
            </div>

            {/* right visual */}
            <div className="flex items-center justify-center p-10 max-md:hidden">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20 w-full max-w-xs">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-4">Recruiter AI Dashboard</p>
                {/* mock search result */}
                {['Priya Sharma · 94% match', 'Rahul Verma · 91% match', 'Sneha Patil · 88% match'].map((name, i) => (
                  <div key={name} className={`flex items-center justify-between bg-white/10 rounded-xl px-4 py-3 mb-2 ${i === 0 ? 'ring-2 ring-white/40' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                        {name[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold leading-tight">{name.split('·')[0].trim()}</p>
                        <p className="text-white/60 text-xs">{name.split('·')[1].trim()}</p>
                      </div>
                    </div>
                    {i === 0 && (
                      <span className="text-xs bg-green-400 text-green-900 font-bold px-2 py-0.5 rounded-full">Top Pick</span>
                    )}
                  </div>
                ))}
                <div className="mt-4 flex items-center gap-2 text-white/60 text-xs">
                  <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                  </svg>
                  3 interview invitations sent today
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
