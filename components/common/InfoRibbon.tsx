import { useState } from 'react';
import Link from 'next/link';

export default function InfoRibbon() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <div className="bg-magna text-white text-sm py-2 px-4 flex items-center justify-between">
      <span className="flex-1 text-center">
        🚀 Hire smarter with AI-powered candidate matching.{' '}
        <Link href="/company" className="underline font-semibold">
          Learn more →
        </Link>
      </span>
      <button
        onClick={() => setClosed(true)}
        className="ml-4 text-white/80 hover:text-white text-lg leading-none"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
