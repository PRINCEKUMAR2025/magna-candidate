import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const CHIPS = ['Software Engineer', 'Data Analyst', 'Product Manager', 'UX Designer', 'Marketing Lead'];

export default function HeroSection() {
  const [matchCount, setMatchCount] = useState(0);
  const [chipIdx, setChipIdx] = useState(0);

  // Animate match % counter
  useEffect(() => {
    let val = 0;
    const interval = setInterval(() => {
      val += 2;
      if (val >= 94) { setMatchCount(94); clearInterval(interval); }
      else setMatchCount(val);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  // Rotate job title chips
  useEffect(() => {
    const t = setInterval(() => setChipIdx((i) => (i + 1) % CHIPS.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(160,32,240,0.08) 0%, #fff 60%)' }}>
      {/* subtle decorative circle */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a020f0 0%, transparent 70%)' }} />

      <div className="container mx-auto py-20 max-lg:py-12">
        <div className="flex items-center justify-between gap-10">

          {/* ── Left copy ── */}
          <div className="flex-1 max-w-2xl">
            {/* pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
              style={{ background: 'rgba(160,32,240,0.1)', color: '#a020f0' }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#a020f0' }} />
              AI-Powered Job Matching · Live
            </div>

            <h1 className="text-5xl max-lg:text-4xl max-md:text-3xl font-bold leading-tight mb-6" style={{ color: '#1a1a2e' }}>
              Land Your Dream Job as a{' '}
              <span style={{ color: '#a020f0' }}>{CHIPS[chipIdx]}</span>
              <br />with AI That Works For You
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Upload your resume once. Our AI instantly matches your profile to real open roles and
              surfaces it directly inside the{' '}
              <strong className="text-gray-800">AI-assisted recruiter dashboard</strong> — so the right
              recruiter finds <em>you</em> before you even apply.
            </p>

            {/* match rate badge */}
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl shadow-md px-5 py-3 mb-8 border border-purple-100">
              <div className="text-3xl font-black" style={{ color: '#a020f0' }}>{matchCount}%</div>
              <div className="text-sm leading-tight text-gray-600">
                <p className="font-semibold text-gray-800">Profile–Role Match Rate</p>
                <p>of candidates get shortlisted within 7 days</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/jobs" className="hami-btn">
                Browse Open Jobs
              </Link>
              <Link href="/register" className="hami-btn btn-2" style={{ border: '2px solid #a020f0' }}>
                Create Free Account
              </Link>
            </div>

            {/* trust line */}
            <p className="mt-6 text-sm text-gray-400 flex items-center gap-1.5">
              <svg className="w-4 h-4" style={{ color: '#a020f0' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              Free to join · No hidden fees · Real recruiter contact
            </p>
          </div>

          {/* ── Right illustration ── */}
          <div className="flex-1 max-lg:hidden flex justify-end relative">
            <div className="relative">
              <Image
                src="/img/hero/home-hero-min.png"
                alt="Candidate landing their dream job"
                width={540}
                height={420}
                className="relative z-10"
                priority
              />
              {/* floating card: match notification */}
              <div className="absolute top-8 -left-10 z-20 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 border border-purple-50 animate-bounce"
                style={{ animationDuration: '3s' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(160,32,240,0.1)' }}>
                  <svg className="w-5 h-5" style={{ color: '#a020f0' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-800">New Match!</p>
                  <p className="text-gray-500 text-xs">Recruiter shortlisted your profile</p>
                </div>
              </div>
              {/* floating card: interview call */}
              <div className="absolute bottom-12 -left-8 z-20 bg-white rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 border border-green-50"
                style={{ animation: 'bounce 4s infinite 1.5s' }}>
                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-bold text-gray-800">Interview Scheduled</p>
                  <p className="text-gray-500 text-xs">Product Manager · TechCorp</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
