import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import Layout from '@/components/layout/Layout';
import Toast from '@/components/common/Toast';
import { getJobById, applyToJob, checkApplied } from '@/lib/api';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';
import type { JobDetail, ProfileCompletion } from '@/types';

// ── helpers ─────────────────────────────────────────────────

function BulletList({ text }: { text?: string | null }) {
  if (!text) return null;
  const lines = text
    .split('\n')
    .map((l) => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);
  return (
    <ul className="space-y-2 mt-2">
      {lines.map((line, i) => (
        <li key={i} className="flex gap-2 text-gray-700 text-sm">
          <span className="text-magna mt-0.5 flex-shrink-0">•</span>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="inline-block bg-magna/10 text-magna text-xs font-semibold px-3 py-1 rounded-full">
      {label}
    </span>
  );
}

// ── Profile Incomplete Modal ─────────────────────────────────

function ProfileIncompleteModal({
  completion,
  onClose,
}: {
  completion: ProfileCompletion | null;
  onClose: () => void;
}) {
  const router = useRouter();
  if (!completion) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold mb-2">Profile Incomplete</h3>
          <p className="text-gray-600 text-sm">
            Your profile is only{' '}
            <strong className="text-magna">{completion.pct}%</strong> complete.
            You need to reach <strong>100%</strong> before applying.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div
            className="bg-magna h-2 rounded-full transition-all"
            style={{ width: `${completion.pct}%` }}
          />
        </div>

        <p className="text-gray-500 text-xs text-center mb-6">
          {!completion.has_resume
            ? 'Upload your resume or fill your profile manually, then complete the Job Preferences section.'
            : `Fill all job preference fields — ${completion.filled_count} of ${completion.total_count} done.`}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex-1 bg-magna text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-magna/90 transition"
          >
            Complete Profile →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Apply button component ───────────────────────────────────

function ApplyButton({ job, onIncomplete }: { job: JobDetail; onIncomplete: (c: ProfileCompletion) => void }) {
  const { candidate, loading: authLoading } = useCandidateAuth();
  const router = useRouter();
  const [applied, setApplied]   = useState(false);
  const [applying, setApplying] = useState(false);
  const [checked, setChecked]   = useState(false);
  const [toast, setToast]       = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!candidate) { setChecked(true); return; }
    checkApplied(job.id)
      .then((a) => setApplied(a))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [candidate, authLoading, job.id]);

  const handleApply = async () => {
    if (!candidate) {
      router.push(`/login?redirect=/jobs/${job.id}`);
      return;
    }
    if (applying || applied) return;
    setApplying(true);
    try {
      const result = await applyToJob(job.id);
      if (result.profile_incomplete) {
        onIncomplete(result.completion);
      } else {
        setApplied(true);
        setToast(true);
      }
    } catch {
      // network/auth error — let user retry
    } finally {
      setApplying(false);
    }
  };

  if (!checked || authLoading) {
    return (
      <button
        disabled
        className="hami-btn opacity-60"
        style={{ height: 44, lineHeight: '44px', padding: '0 28px' }}
      >
        Loading…
      </button>
    );
  }

  if (applied) {
    return (
      <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
        ✓ Applied
      </span>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          message={`Application sent to ${job.company_name} for ${job.role}`}
          onDone={() => setToast(false)}
        />
      )}
      <button
        onClick={handleApply}
        disabled={applying}
        className="hami-btn"
        style={{ height: 44, lineHeight: '44px', padding: '0 28px' }}
      >
        {applying ? 'Applying…' : 'Apply via Magna Hire'}
      </button>
    </>
  );
}

// ── page ─────────────────────────────────────────────────────

export default function JobDetailPage() {
  const router = useRouter();
  const { id }  = router.query;
  const [incompleteCompletion, setIncompleteCompletion] = useState<ProfileCompletion | null>(null);

  const { data: job, isLoading, error } = useSWR<JobDetail>(
    id ? `job-${id}` : null,
    () => getJobById(id as string)
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="loader" />
        </div>
      </Layout>
    );
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500 text-lg">Job not found or no longer available.</p>
          <Link href="/jobs" className="hami-btn btn-2" style={{ height: 40, lineHeight: '40px', padding: '0 24px' }}>
            ← Back to Jobs
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProfileIncompleteModal
        completion={incompleteCompletion}
        onClose={() => setIncompleteCompletion(null)}
      />

      {/* ── Hero banner ── */}
      <section className="bg-magna-light py-12">
        <div className="container">
          <Link href="/jobs" className="text-magna text-sm font-medium hover:underline mb-4 inline-block">
            ← All Jobs
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-6 mt-2">
            <div>
              <h1 className="text-4xl font-bold mb-2">{job.role}</h1>
              <p className="text-xl text-gray-700 font-medium">{job.company_name}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <Pill label={job.job_type} />
                <span className="text-gray-500 text-sm self-center">📍 {job.location}</span>
                {job.notice_period && (
                  <span className="text-gray-400 text-sm self-center">🕐 Notice: {job.notice_period}</span>
                )}
              </div>
            </div>

            {/* Apply CTAs */}
            <div className="flex flex-wrap gap-3 flex-shrink-0 items-center">
              <ApplyButton job={job} onIncomplete={setIncompleteCompletion} />
              {job.company_website && (
                <a
                  href={job.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hami-btn btn-2"
                  style={{ height: 44, lineHeight: '44px', padding: '0 24px' }}
                >
                  Visit Company Site ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="py-12">
        <div className="container grid lg:grid-cols-3 gap-10">

          {/* Left: details */}
          <div className="lg:col-span-2">
            {job.responsibilities && (
              <Section title="Role & Responsibilities">
                <BulletList text={job.responsibilities} />
              </Section>
            )}

            {job.mandatory_skills && (
              <Section title="Mandatory Skills / Requirements">
                <BulletList text={job.mandatory_skills} />
              </Section>
            )}

            {job.good_to_have_skills && (
              <Section title="Good to Have">
                <BulletList text={job.good_to_have_skills} />
              </Section>
            )}

            {job.preferred_skills && (
              <Section title="Preferred Skills">
                <BulletList text={job.preferred_skills} />
              </Section>
            )}
          </div>

          {/* Right: sidebar */}
          <div className="space-y-6">

            {/* Job quick-facts card */}
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Job Details</h3>
              <dl className="space-y-3 text-sm">
                <Row label="Role"         value={job.role} />
                <Row label="Company"      value={job.company_name} />
                <Row label="Type"         value={job.job_type} />
                <Row label="Location"     value={job.location} />
                {job.notice_period && <Row label="Notice Period" value={job.notice_period} />}
              </dl>
            </div>

            {/* Company links */}
            {(job.company_website || job.company_linkedin_url) && (
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Company Links</h3>
                <div className="space-y-2">
                  {job.company_website && (
                    <a
                      href={job.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-magna text-sm underline break-all"
                    >
                      🌐 Website
                    </a>
                  )}
                  {job.company_linkedin_url && (
                    <a
                      href={job.company_linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-magna text-sm underline break-all"
                    >
                      🔗 LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Apply CTA card */}
            <div className="bg-magna rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Ready to apply?</h3>
              <p className="text-white/80 text-sm mb-4">
                Create your Magna Hire profile and our team will match you with this role.
              </p>
              <div className="flex justify-center">
                <ApplyButton job={job} onIncomplete={setIncompleteCompletion} />
              </div>
              {job.company_website && (
                <a
                  href={job.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-white/70 hover:text-white text-sm mt-3 underline"
                >
                  Or apply directly on company site ↗
                </a>
              )}
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-400 flex-shrink-0">{label}</dt>
      <dd className="text-gray-800 font-medium text-right">{value}</dd>
    </div>
  );
}
