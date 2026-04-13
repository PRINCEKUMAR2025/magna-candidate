import { useEffect, useRef, useState } from 'react';

const STATS = [
  { val: 25,  suffix: '+',    label: 'Companies Actively Hiring',  icon: '🏢' },
  { val: 500, suffix: 'K+',   label: 'Candidate Profiles Matched', icon: '🤝' },
  { val: 100, suffix: '+',    label: 'Job Placements Last Year',    icon: '🎯' },
  { val: 7,   suffix: ' days', label: 'Avg. Time to First Interview', icon: '⚡' },
];

function Counter({ val, suffix }: { val: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let c = 0;
        const step = Math.ceil(val / 40);
        const t = setInterval(() => {
          c += step;
          if (c >= val) { setCount(val); clearInterval(t); }
          else setCount(c);
        }, 40);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [val]);

  return (
    <div ref={ref} className="text-4xl font-black text-center" style={{ color: '#a020f0' }}>
      {count}{suffix}
    </div>
  );
}

export default function StatsCounter() {
  return (
    <div className="py-10 border-y border-purple-100" style={{ background: '#faf5ff' }}>
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ val, suffix, label, icon }) => (
            <div key={label} className="flex flex-col items-center gap-2 p-4">
              <span className="text-2xl mb-1">{icon}</span>
              <Counter val={val} suffix={suffix} />
              <p className="text-sm text-gray-600 text-center font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
