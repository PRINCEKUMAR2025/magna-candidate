import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import Layout from '@/components/layout/Layout';
import Toast from '@/components/common/Toast';
import { getJobById, applyToJob, checkApplied, getJobQuestions } from '@/lib/api';
import type { QuestionAnswer } from '@/lib/api';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';
import type { JobDetail, ProfileCompletion, JobQuestion } from '@/types';

// ── helpers ──────────────────────────────────────────────────

function BulletList({ text }: { text?: string | null }) {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.replace(/^[-•*]\s*/, '').trim()).filter(Boolean);
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

function RichContent({ html }: { html?: string | null }) {
  if (!html) return null;
  return <div className="rich-content text-sm text-gray-700 leading-relaxed mt-2" dangerouslySetInnerHTML={{ __html: html }} />;
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
  return <span className="inline-block bg-magna/10 text-magna text-xs font-semibold px-3 py-1 rounded-full">{label}</span>;
}

// ── Profile Incomplete Modal ─────────────────────────────────

function ProfileIncompleteModal({ completion, onClose }: { completion: ProfileCompletion | null; onClose: () => void }) {
  const router = useRouter();
  if (!completion) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">⚠️</div>
          <h3 className="text-lg font-bold mb-2">Profile Incomplete</h3>
          <p className="text-gray-600 text-sm">
            Your profile is only <strong className="text-magna">{completion.pct}%</strong> complete. You need <strong>100%</strong> to apply.
          </p>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
          <div className="bg-magna h-2 rounded-full transition-all" style={{ width: `${completion.pct}%` }} />
        </div>
        <p className="text-gray-500 text-xs text-center mb-6">
          {!completion.has_resume
            ? 'Upload your resume, then complete the Job Preferences section.'
            : `Fill all job preference fields — ${completion.filled_count} of ${completion.total_count} done.`}
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
          <button onClick={() => router.push('/dashboard')} className="flex-1 bg-magna text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-magna/90 transition">Complete Profile →</button>
        </div>
      </div>
    </div>
  );
}

// ── Questionnaire Modal ──────────────────────────────────────

function QuestionnaireModal({
  questions,
  onSubmit,
  onClose,
  submitting,
}: {
  questions: JobQuestion[];
  onSubmit: (answers: QuestionAnswer[]) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [errors, setErrors]   = useState<number[]>([]);

  const setAnswer = (qId: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    setErrors(prev => prev.filter(id => id !== qId));
  };

  const toggleMultiSelect = (qId: number, opt: string) => {
    setAnswers(prev => {
      const current = prev[qId] ? prev[qId].split(',').map(s => s.trim()).filter(Boolean) : [];
      const updated = current.includes(opt) ? current.filter(o => o !== opt) : [...current, opt];
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
        {/* Header */}
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

        {/* Questions */}
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

        {/* Footer */}
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

// ── Apply button ─────────────────────────────────────────────

function ApplyButton({ job, onIncomplete }: { job: JobDetail; onIncomplete: (c: ProfileCompletion) => void }) {
  const { candidate, loading: authLoading } = useCandidateAuth();
  const router = useRouter();
  const [applied, setApplied]         = useState(false);
  const [applying, setApplying]       = useState(false);
  const [checked, setChecked]         = useState(false);
  const [toast, setToast]             = useState(false);
  const [questions, setQuestions]     = useState<JobQuestion[]>([]);
  const [showQModal, setShowQModal]   = useState(false);
  const fetchedQs = useRef<JobQuestion[] | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!candidate) { setChecked(true); return; }
    checkApplied(job.id).then(a => setApplied(a)).catch(() => {}).finally(() => setChecked(true));
  }, [candidate, authLoading, job.id]);

  const handleApplyClick = async () => {
    if (!candidate) { router.push(`/login?redirect=/jobs/${job.id}`); return; }
    if (applying || applied) return;

    if (fetchedQs.current === null) {
      try { fetchedQs.current = await getJobQuestions(job.id); }
      catch { fetchedQs.current = []; }
      setQuestions(fetchedQs.current);
    }

    if (fetchedQs.current.length > 0) {
      setShowQModal(true);
    } else {
      await submitApplication([]);
    }
  };

  const submitApplication = async (answers: QuestionAnswer[]) => {
    setApplying(true);
    try {
      const result = await applyToJob(job.id, answers);
      if (result.profile_incomplete) {
        onIncomplete(result.completion);
      } else {
        setApplied(true);
        setToast(true);
        setShowQModal(false);
      }
    } catch {
      // let user retry
    } finally {
      setApplying(false);
    }
  };

  if (!checked || authLoading) {
    return <button disabled className="hami-btn opacity-60" style={{ height: 44, lineHeight: '44px', padding: '0 28px' }}>Loading…</button>;
  }

  if (applied) {
    return <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-green-100 text-green-700 font-semibold text-sm">✓ Applied</span>;
  }

  return (
    <>
      {toast && <Toast message={`Application sent to ${job.company_name} for ${job.role}`} onDone={() => setToast(false)} />}
      {showQModal && (
        <QuestionnaireModal
          questions={questions}
          onSubmit={submitApplication}
          onClose={() => setShowQModal(false)}
          submitting={applying}
        />
      )}
      <button onClick={handleApplyClick} disabled={applying} className="hami-btn" style={{ height: 44, lineHeight: '44px', padding: '0 28px' }}>
        {applying ? 'Applying…' : 'Apply via Magna Hire'}
      </button>
    </>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function JobDetailPage() {
  const router = useRouter();
  const { id }  = router.query;
  const [incompleteCompletion, setIncompleteCompletion] = useState<ProfileCompletion | null>(null);

  const { data: job, isLoading, error } = useSWR<JobDetail>(
    id ? `job-${id}` : null,
    () => getJobById(id as string)
  );

  if (isLoading) {
    return <Layout><div className="min-h-[60vh] flex items-center justify-center"><div className="loader" /></div></Layout>;
  }

  if (error || !job) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-gray-500 text-lg">Job not found or no longer available.</p>
          <Link href="/jobs" className="hami-btn btn-2" style={{ height: 40, lineHeight: '40px', padding: '0 24px' }}>← Back to Jobs</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProfileIncompleteModal completion={incompleteCompletion} onClose={() => setIncompleteCompletion(null)} />

      {/* Hero */}
      <section className="bg-magna-light py-12">
        <div className="container">
          <Link href="/jobs" className="text-magna text-sm font-medium hover:underline mb-4 inline-block">← All Jobs</Link>
          <div className="flex flex-wrap items-start justify-between gap-6 mt-2">
            <div>
              <h1 className="text-4xl font-bold mb-2">{job.role}</h1>
              <p className="text-xl text-gray-700 font-medium">{job.company_name}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <Pill label={job.job_type} />
                <span className="text-gray-500 text-sm self-center">📍 {job.location}</span>
                {job.notice_period && <span className="text-gray-400 text-sm self-center">🕐 Notice: {job.notice_period}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0 items-center">
              <ApplyButton job={job} onIncomplete={setIncompleteCompletion} />
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12">
        <div className="container grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            {job.responsibilities && <Section title="Role & Responsibilities"><RichContent html={job.responsibilities} /></Section>}
            {job.mandatory_skills && <Section title="Mandatory Skills / Requirements"><BulletList text={job.mandatory_skills} /></Section>}
            {job.good_to_have_skills && <Section title="Good to Have"><BulletList text={job.good_to_have_skills} /></Section>}
            {job.preferred_skills && <Section title="Preferred Skills"><BulletList text={job.preferred_skills} /></Section>}
          </div>

          <div className="space-y-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Job Details</h3>
              <dl className="space-y-3 text-sm">
                <Row label="Role"     value={job.role} />
                <Row label="Company"  value={job.company_name} />
                <Row label="Type"     value={job.job_type} />
                <Row label="Location" value={job.location} />
                {job.notice_period && <Row label="Notice Period" value={job.notice_period} />}
              </dl>
            </div>

            {(job.company_website || job.company_linkedin_url) && (
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Company Links</h3>
                <div className="space-y-2">
                  {job.company_website && <a href={job.company_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-magna text-sm underline break-all">🌐 Website</a>}
                  {job.company_linkedin_url && <a href={job.company_linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-magna text-sm underline break-all">🔗 LinkedIn</a>}
                </div>
              </div>
            )}

            <div className="bg-magna rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Ready to apply?</h3>
              <p className="text-white/80 text-sm mb-4">Create your Magna Hire profile and our team will match you with this role.</p>
              <div className="flex justify-center">
                <ApplyButton job={job} onIncomplete={setIncompleteCompletion} />
              </div>
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
