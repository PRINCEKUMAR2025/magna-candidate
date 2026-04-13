import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Toast from '@/components/common/Toast';
import { getPublicJobs, applyToJob, checkApplied } from '@/lib/api';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';
import type { Job, ProfileCompletion } from '@/types';

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-3xl mx-auto mb-4">
          ⚠️
        </div>
        <h3 className="text-lg font-bold mb-2">Profile Incomplete</h3>
        <p className="text-gray-500 text-sm mb-3">
          Your profile is{' '}
          <strong className="text-magna">{completion.pct}%</strong> complete.
        </p>
        <p className="text-gray-500 text-sm mb-5">
          {!completion.has_resume
            ? 'Upload your resume (or fill profile manually) and fill all 6 job preference fields to apply for jobs.'
            : 'Fill all 6 job preference fields on your dashboard to apply for jobs.'}
        </p>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-magna rounded-full transition-all"
            style={{ width: `${completion.pct}%` }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Later
          </button>
          <button
            onClick={() => { onClose(); router.push('/dashboard'); }}
            className="hami-btn flex-1"
            style={{ height: 42, lineHeight: '42px', fontSize: 14 }}
          >
            Complete Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Apply Button ─────────────────────────────────────────────

function ApplyNowButton({
  job,
  onIncomplete,
}: {
  job: Job;
  onIncomplete: (c: ProfileCompletion) => void;
}) {
  const { candidate, loading: authLoading } = useCandidateAuth();
  const router = useRouter();
  const [applied,  setApplied]  = useState(false);
  const [applying, setApplying] = useState(false);
  const [checked,  setChecked]  = useState(false);
  const [toast,    setToast]    = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!candidate) { setChecked(true); return; }
    checkApplied(job.id)
      .then((a) => setApplied(a))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [candidate, authLoading, job.id]);

  const handleApply = async () => {
    if (!candidate) { router.push(`/login?redirect=/jobs`); return; }
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
      // network / server error — silent
    } finally {
      setApplying(false);
    }
  };

  if (!checked || authLoading) {
    return (
      <button disabled className="hami-btn opacity-50" style={{ height: 36, lineHeight: '36px', padding: '0 18px', fontSize: 13 }}>
        …
      </button>
    );
  }

  if (applied) {
    return (
      <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-green-100 text-green-700 font-semibold text-xs">
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
        style={{ height: 36, lineHeight: '36px', padding: '0 18px', fontSize: 13 }}
      >
        {applying ? 'Applying…' : 'Apply Now'}
      </button>
    </>
  );
}

// ── Job Card ─────────────────────────────────────────────────

function JobCard({ job, onIncomplete }: { job: Job; onIncomplete: (c: ProfileCompletion) => void }) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-snug">{job.role}</h3>
          <p className="text-gray-600 text-sm mt-0.5">{job.company_name}</p>
          <p className="text-gray-500 text-sm mt-1">📍 {job.location}</p>
        </div>
        <span className="job-type-badge flex-shrink-0">{job.job_type}</span>
      </div>

      {job.notice_period && (
        <p className="text-gray-400 text-xs mt-0.5">🕐 Notice: {job.notice_period}</p>
      )}

      <div className="mt-auto pt-4 flex gap-3 flex-wrap border-t border-gray-100 mt-4">
        <Link
          href={`/jobs/${job.id}`}
          className="hami-btn btn-2"
          style={{ height: 36, lineHeight: '36px', padding: '0 18px', fontSize: 13 }}
        >
          View Details
        </Link>
        <ApplyNowButton job={job} onIncomplete={onIncomplete} />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function Jobs() {
  const { data: jobs, isLoading, error } = useSWR<Job[]>('public-jobs', getPublicJobs);
  const [incompleteCompletion, setIncompleteCompletion] = useState<ProfileCompletion | null>(null);

  return (
    <Layout>
      <ProfileIncompleteModal
        completion={incompleteCompletion}
        onClose={() => setIncompleteCompletion(null)}
      />

      <section className="bg-magna-light py-16">
        <div className="container text-center">
          <h1 className="text-5xl font-bold mb-4">Open Positions</h1>
          <p className="text-lg text-gray-600">Find your next opportunity — curated by Magna Hire.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          {isLoading && (
            <div className="flex justify-center py-20"><div className="loader" /></div>
          )}
          {error && (
            <p className="text-center text-red-500 py-10">Could not load jobs. Please try again later.</p>
          )}
          {jobs && jobs.length === 0 && (
            <p className="text-center text-gray-500 py-10">No open positions right now — check back soon!</p>
          )}
          {jobs && jobs.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onIncomplete={(c) => setIncompleteCompletion(c)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
