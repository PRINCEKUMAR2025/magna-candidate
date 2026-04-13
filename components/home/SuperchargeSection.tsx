import Link from 'next/link';

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15h8v2H8v-2zm0-4h8v2H8v-2zm0-4h5v2H8V7z"/>
      </svg>
    ),
    title: 'Upload Your Resume',
    desc: 'Create a free account and upload your resume in seconds. Our AI instantly parses your skills, experience, and role preferences — no manual form filling.',
    tag: 'Takes < 2 minutes',
  },
  {
    num: '02',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
      </svg>
    ),
    title: 'AI Matches Your Profile',
    desc: 'Our AI engine cross-references your profile against hundreds of live job openings posted by vetted companies. It scores and ranks you for roles where you are the best fit.',
    tag: 'Real-time matching',
  },
  {
    num: '03',
    icon: (
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
      </svg>
    ),
    title: 'Recruiter Calls for Interview',
    desc: 'Your matched profile appears directly in the recruiter\'s AI dashboard. They shortlist you and schedule an interview — you get an instant WhatsApp + email notification.',
    tag: 'Avg. 7 days to first call',
  },
];

export default function SuperchargeSection() {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container">
        {/* heading */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-4"
            style={{ background: 'rgba(160,32,240,0.08)', color: '#a020f0' }}>
            Simple · Fast · AI-Driven
          </div>
          <h2 className="text-4xl max-md:text-3xl font-bold" style={{ color: '#1a1a2e' }}>
            From Resume to Interview Call in 3 Steps
          </h2>
          <p className="mt-3 text-lg text-gray-500 max-w-xl mx-auto">
            No endless applications. No ghosting. Just your profile, our AI, and the right recruiter.
          </p>
        </div>

        {/* steps */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* connector line (desktop only) */}
          <div className="hidden md:block absolute top-14 left-1/3 right-1/3 h-px"
            style={{ background: 'linear-gradient(90deg, #a020f0 0%, #a020f0 100%)', opacity: 0.2 }} />

          {STEPS.map((s, i) => (
            <div key={s.num} className="relative flex flex-col bg-white rounded-2xl border border-purple-100 p-8 shadow-sm hover:shadow-md transition-shadow">
              {/* step number */}
              <div className="absolute -top-4 left-8 text-5xl font-black leading-none select-none"
                style={{ color: 'rgba(160,32,240,0.08)' }}>
                {s.num}
              </div>
              {/* icon */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mt-2"
                style={{ background: 'rgba(160,32,240,0.1)', color: '#a020f0' }}>
                {s.icon}
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: '#1a1a2e' }}>{s.title}</h3>
              <p className="text-gray-500 leading-relaxed flex-1">{s.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full w-fit"
                style={{ background: 'rgba(160,32,240,0.08)', color: '#a020f0' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#a020f0' }} />
                {s.tag}
              </div>
              {i < STEPS.length - 1 && (
                <div className="md:hidden flex justify-center mt-6">
                  <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-12">
          <Link href="/register" className="hami-btn">
            Start Your Job Search for Free
          </Link>
        </div>
      </div>

      {/* background decoration */}
      <div className="feature-pattern">
        <img alt="" src="/img/core-img/welcome-pattern.png" />
      </div>
    </section>
  );
}
