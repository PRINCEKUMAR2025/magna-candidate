import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import Toast from '@/components/common/Toast';
import { getPublicJobs, applyToJob, checkApplied, getJobQuestions } from '@/lib/api';
import type { QuestionAnswer } from '@/lib/api';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';
import type { Job, ProfileCompletion, JobQuestion } from '@/types';

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

// ── Questionnaire Modal ──────────────────────────────────────

function QuestionnaireModal({
  questions, onSubmit, onClose, submitting,
}: {
  questions: JobQuestion[];
  onSubmit: (answers: QuestionAnswer[]) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [errors,  setErrors]  = useState<number[]>([]);

  const setAnswer = (qId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setErrors(prev => prev.filter(id => id !== qId));
  };

  const toggleMultiSelect = (qId: number, opt: string) => {
    setAnswers(prev => {
      const cur     = prev[qId] ? prev[qId].split(',').map(s => s.trim()).filter(Boolean) : [];
      const updated = cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt];
      return { ...prev, [qId]: updated.join(', ') };
    });
    setErrors(prev => prev.filter(id => id !== qId));
  };

  const handleSubmit = () => {
    const missing = questions.filter(q => q.required && !answers[q.id]?.trim()).map(q => q.id);
    if (missing.length) { setErrors(missing); return; }
    onSubmit(questions.map(q => ({ question_id: q.id, answer: answers[q.id] ?? '' })));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <span className="text-purple-600 text-base">📋</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Application Questions</h3>
              <p className="text-xs text-gray-400">Please answer all required questions</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">×</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {questions.map((q, i) => (
            <div key={q.id}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {i + 1}. {q.question}
                {q.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {q.question_type === 'text' && (
                <textarea
                  rows={3}
                  className={`w-full border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 ${errors.includes(q.id) ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  placeholder="Your answer…"
                  value={answers[q.id] ?? ''}
                  onChange={e => setAnswer(q.id, e.target.value)}
                />
              )}

              {q.question_type === 'yes_no' && (
                <div className="flex gap-4">
                  {['Yes', 'No'].map(opt => (
                    <label key={opt} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition ${answers[q.id] === opt ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
                      <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswer(q.id, opt)} className="accent-purple-600" />
                      <span className="text-sm text-gray-700 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === 'multiple_choice' && q.options && (
                <div className="space-y-2">
                  {q.options.map(opt => (
                    <label key={opt} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition ${answers[q.id] === opt ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
                      <input type="radio" name={`q_${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => setAnswer(q.id, opt)} className="accent-purple-600" />
                      <span className="text-sm text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {q.question_type === 'multiple_select' && q.options && (
                <div className="space-y-2">
                  {q.options.map(opt => {
                    const selected = (answers[q.id] ?? '').split(',').map(s => s.trim()).includes(opt);
                    return (
                      <label key={opt} className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border transition ${selected ? 'border-purple-400 bg-purple-50' : 'border-gray-200'}`}>
                        <input type="checkbox" value={opt} checked={selected} onChange={() => toggleMultiSelect(q.id, opt)} className="accent-purple-600 w-4 h-4" />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    );
                  })}
                  <p className="text-xs text-gray-400 mt-1">Select all that apply</p>
                </div>
              )}

              {errors.includes(q.id) && (
                <p className="text-red-500 text-xs mt-1">This field is required</p>
              )}
            </div>
          ))}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-purple-700 disabled:opacity-60 transition">
            {submitting ? 'Submitting…' : 'Submit Application'}
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
  const [applied,    setApplied]    = useState(false);
  const [applying,   setApplying]   = useState(false);
  const [checked,    setChecked]    = useState(false);
  const [toast,      setToast]      = useState(false);
  const [questions,  setQuestions]  = useState<JobQuestion[]>([]);
  const [showQModal, setShowQModal] = useState(false);
  const fetchedQs = useRef<JobQuestion[] | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!candidate) { setChecked(true); return; }
    checkApplied(job.id)
      .then((a) => setApplied(a))
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [candidate, authLoading, job.id]);

  const submitApplication = async (answers: QuestionAnswer[]) => {
    setApplying(true);
    try {
      const result = await applyToJob(job.id, answers);
      if (result.profile_incomplete) {
        setShowQModal(false);
        onIncomplete(result.completion);
      } else {
        setShowQModal(false);
        setApplied(true);
        setToast(true);
      }
    } catch {
      // silent — modal stays open so candidate can retry
    } finally {
      setApplying(false);
    }
  };

  const handleClick = async () => {
    if (!candidate) { router.push(`/login?redirect=/jobs`); return; }
    if (applying || applied) return;

    // Fetch questions once, then decide
    if (!fetchedQs.current) {
      try {
        fetchedQs.current = await getJobQuestions(job.id);
      } catch {
        fetchedQs.current = [];
      }
    }

    if (fetchedQs.current.length > 0) {
      setQuestions(fetchedQs.current);
      setShowQModal(true);
    } else {
      await submitApplication([]);
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
      {showQModal && (
        <QuestionnaireModal
          questions={questions}
          onSubmit={submitApplication}
          onClose={() => setShowQModal(false)}
          submitting={applying}
        />
      )}
      <button
        onClick={handleClick}
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
