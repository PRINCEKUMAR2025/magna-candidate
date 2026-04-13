import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/layout/Layout';
import ResumeUpload from '@/components/dashboard/ResumeUpload';
import ProfileDetails from '@/components/dashboard/ProfileDetails';
import ManualProfileForm from '@/components/dashboard/ManualProfileForm';
import AdditionalDataForm from '@/components/dashboard/AdditionalDataForm';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';
import { getCandidateProfile, getCandidateResumeUrl, getAdditionalData } from '@/lib/api';
import type { CandidateProfile, AdditionalData, ProfileCompletion } from '@/types';

const STEPS = [
  { step: 1, label: 'Create your account',                   always: true  },
  { step: 2, label: 'Upload your resume or fill your profile'               },
  { step: 3, label: 'Fill in your job preferences'                          },
  { step: 4, label: 'Get matched with top companies'                        },
];

type SetupMode = 'choose' | 'upload' | 'manual';

export default function MyProfile() {
  const { candidate, loading, logout } = useCandidateAuth();
  const router = useRouter();

  const [resumeUrl,        setResumeUrl]        = useState<string | null>(null);
  const [hasManualProfile, setHasManualProfile] = useState(false);
  const [showProfile,      setShowProfile]      = useState(false);
  const [profile,          setProfile]          = useState<CandidateProfile | null>(null);
  const [profileLoading,   setProfileLoading]   = useState(false);
  const [resumeLoading,    setResumeLoading]    = useState(false);
  const [setupMode,        setSetupMode]        = useState<SetupMode>('choose');

  const [additionalData, setAdditionalData] = useState<Partial<AdditionalData>>({});
  const [completion,     setCompletion]     = useState<ProfileCompletion | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !candidate) router.replace('/login');
  }, [loading, candidate, router]);

  // Seed resume_url from auth context
  useEffect(() => {
    if (candidate?.resume_url) setResumeUrl(candidate.resume_url);
  }, [candidate]);

  // Load additional data (job preferences) + completion status
  useEffect(() => {
    if (!candidate) return;
    getAdditionalData()
      .then(({ data, completion: c }) => {
        setAdditionalData(data);
        setCompletion(c);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id]);

  // Detect existing manual profile (no resume but has filled data)
  useEffect(() => {
    if (!candidate || candidate.resume_url) return;
    getCandidateProfile()
      .then((p) => {
        const hasData =
          (p.skills?.length ?? 0) > 0 ||
          (p.experience?.length ?? 0) > 0 ||
          (p.education?.length ?? 0) > 0 ||
          !!p.summary?.trim();
        if (hasData) {
          setHasManualProfile(true);
          setProfile(p);
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidate?.id]);

  const handleUploaded = (url: string) => {
    setResumeUrl(url);
    setProfile(null);
    setShowProfile(false);
    setSetupMode('choose');
  };

  const handleManualSaved = () => {
    setHasManualProfile(true);
    setSetupMode('choose');
    setProfile(null);
    setShowProfile(false);
  };

  const handleViewResume = async () => {
    setResumeLoading(true);
    try {
      const url = await getCandidateResumeUrl();
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      if (resumeUrl) window.open(resumeUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setResumeLoading(false);
    }
  };

  const openProfile = async () => {
    if (showProfile) { setShowProfile(false); return; }
    setShowProfile(true);
    if (!profile) {
      setProfileLoading(true);
      try {
        const p = await getCandidateProfile();
        setProfile(p);
      } catch { /* ProfileDetails handles null */ } finally {
        setProfileLoading(false);
      }
    }
  };

  if (loading || !candidate) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="loader" />
        </div>
      </Layout>
    );
  }

  const initials = candidate.name
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const profileDone = !!resumeUrl || hasManualProfile;
  const pct         = completion?.pct ?? 0;
  const isComplete  = completion?.complete ?? false;

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-magna-light py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-1">My Profile</h1>
          <p className="text-gray-600">Manage your resume and job preferences below.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container grid md:grid-cols-3 gap-6">

          {/* ── Left sidebar ── */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 md:col-span-1 self-start">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-magna text-white flex items-center justify-center text-2xl font-bold mb-4">
                {initials}
              </div>
              <h2 className="text-xl font-bold">{candidate.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{candidate.email}</p>
              {candidate.phone && (
                <p className="text-gray-400 text-sm">{candidate.phone}</p>
              )}

              {/* Profile completion ring */}
              <div className="mt-5 w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-medium">Profile completeness</span>
                  <span className={`text-xs font-bold ${isComplete ? 'text-green-600' : 'text-magna'}`}>{pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-magna'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {isComplete ? (
                  <p className="text-xs text-green-600 font-semibold mt-1.5">✓ Complete — you can apply for jobs!</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1.5">Fill all fields below to apply for jobs</p>
                )}
              </div>

              {profileDone && (
                <button
                  onClick={openProfile}
                  className="hami-btn mt-5 w-full"
                  style={{ height: 40, lineHeight: '40px', fontSize: 14 }}
                >
                  {showProfile ? 'Hide Profile' : 'See Profile Details'}
                </button>
              )}

              <button
                onClick={async () => { await logout(); router.push('/'); }}
                className="hami-btn btn-2 mt-3 w-full"
                style={{ height: 40, lineHeight: '40px', fontSize: 14 }}
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* ── Right content ── */}
          <div className="md:col-span-2 flex flex-col gap-6">

            {/* ── Completion banner ── */}
            {!isComplete && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">⚠️</div>
                <div>
                  <p className="font-bold text-amber-800 text-sm">Profile {pct}% complete</p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    {!profileDone
                      ? 'Upload your resume (or fill manually) and fill all 6 job preference fields to unlock job applications.'
                      : 'Fill all 6 job preference fields below to unlock job applications.'}
                  </p>
                </div>
              </div>
            )}

            {isComplete && (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 flex items-center gap-4">
                <div className="text-2xl flex-shrink-0">✅</div>
                <div>
                  <p className="font-bold text-green-800 text-sm">Profile complete!</p>
                  <p className="text-green-700 text-xs mt-0.5">You can now apply for all open positions.</p>
                </div>
              </div>
            )}

            {/* ── Resume / profile setup card ── */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">

              {resumeUrl ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Resume</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl flex-shrink-0">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-700">Resume uploaded &amp; parsed</p>
                      <button
                        onClick={handleViewResume}
                        disabled={resumeLoading}
                        className="text-magna text-sm underline disabled:opacity-50"
                      >
                        {resumeLoading ? 'Opening…' : 'View Resume'}
                      </button>
                    </div>
                    <button
                      className="text-sm text-gray-400 underline flex-shrink-0"
                      onClick={() => { setResumeUrl(null); setSetupMode('choose'); }}
                    >
                      Replace
                    </button>
                  </div>
                  {!showProfile && (
                    <button onClick={openProfile} className="mt-5 text-sm text-magna font-semibold underline">
                      See your profile details →
                    </button>
                  )}
                </>
              ) : hasManualProfile ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Profile</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl flex-shrink-0">
                      ✓
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-green-700">Profile filled manually</p>
                      <p className="text-gray-400 text-xs mt-0.5">You can edit your details anytime below.</p>
                    </div>
                    <button
                      className="text-sm text-gray-400 underline flex-shrink-0"
                      onClick={() => { setHasManualProfile(false); setProfile(null); setShowProfile(false); setSetupMode('choose'); }}
                    >
                      Edit / Re-fill
                    </button>
                  </div>
                  {!showProfile && (
                    <button onClick={openProfile} className="mt-5 text-sm text-magna font-semibold underline">
                      See your profile details →
                    </button>
                  )}
                  {!resumeUrl && (
                    <p className="mt-4 text-xs text-gray-400">
                      Want faster matching?{' '}
                      <button onClick={() => setSetupMode('upload')} className="text-magna underline">
                        Upload a resume
                      </button>{' '}
                      to let our AI parse your profile automatically.
                    </p>
                  )}
                </>
              ) : (
                <>
                  {setupMode === 'choose' && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-bold">Step 1 — Set Up Your Profile</h3>
                          <p className="text-gray-500 text-sm mt-0.5">Upload a resume or fill in manually</p>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => setSetupMode('upload')}
                          className="text-left rounded-2xl border-2 border-gray-100 hover:border-magna p-6 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-magna/10 flex items-center justify-center mb-4 group-hover:bg-magna/20 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-magna" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-gray-800 mb-1">Upload Resume</h4>
                          <p className="text-gray-500 text-sm leading-relaxed">
                            Upload a PDF or DOCX — our AI parses your skills, experience &amp; education instantly.
                          </p>
                          <span className="inline-block mt-3 text-magna text-xs font-bold uppercase tracking-wide">
                            Recommended →
                          </span>
                        </button>

                        <button
                          onClick={() => setSetupMode('manual')}
                          className="text-left rounded-2xl border-2 border-gray-100 hover:border-magna p-6 transition-all group"
                        >
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-magna/10 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500 group-hover:text-magna transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          <h4 className="font-bold text-gray-800 mb-1">Fill Manually</h4>
                          <p className="text-gray-500 text-sm leading-relaxed">
                            Enter your skills, work experience, and education by hand.
                          </p>
                          <span className="inline-block mt-3 text-gray-400 text-xs font-bold uppercase tracking-wide group-hover:text-magna transition-colors">
                            Fill in details →
                          </span>
                        </button>
                      </div>
                    </>
                  )}

                  {setupMode === 'upload' && (
                    <>
                      <div className="flex items-center gap-3 mb-5">
                        <button onClick={() => setSetupMode('choose')} className="text-magna text-sm font-medium hover:underline">
                          ← Back
                        </button>
                        <h3 className="text-xl font-bold">Upload Your Resume</h3>
                      </div>
                      <ResumeUpload onUploaded={handleUploaded} />
                    </>
                  )}

                  {setupMode === 'manual' && (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <button onClick={() => setSetupMode('choose')} className="text-magna text-sm font-medium hover:underline">
                          ← Back
                        </button>
                        <h3 className="text-xl font-bold">Fill Profile Manually</h3>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Resume upload for manual-profile candidates who want to switch */}
            {hasManualProfile && !resumeUrl && setupMode === 'upload' && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setSetupMode('choose')} className="text-magna text-sm font-medium hover:underline">
                    ← Back
                  </button>
                  <h3 className="text-xl font-bold">Upload Your Resume</h3>
                </div>
                <ResumeUpload onUploaded={handleUploaded} />
              </div>
            )}

            {/* Manual form */}
            {setupMode === 'manual' && !resumeUrl && (
              <ManualProfileForm onSaved={handleManualSaved} />
            )}

            {/* ── Step 2: Job Preferences ── */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-xl font-bold">
                    Step 2 — Job Preferences
                    {isComplete && <span className="ml-2 text-sm font-semibold text-green-600">✓ Complete</span>}
                  </h3>
                  <p className="text-gray-500 text-sm mt-0.5">All fields required to apply for jobs</p>
                </div>
              </div>

              <div className="mt-5">
                <AdditionalDataForm
                  initial={additionalData}
                  onSaved={(c) => {
                    setCompletion(c);
                    setAdditionalData(c.fields);
                  }}
                />
              </div>
            </div>

            {/* What's Next checklist */}
            <div className="bg-white rounded-2xl shadow-sm border p-8">
              <h3 className="text-xl font-bold mb-4">What&apos;s Next?</h3>
              <ol className="space-y-4">
                {STEPS.map(({ step, label, always }) => {
                  const done =
                    !!always ||
                    (step === 2 && profileDone) ||
                    (step === 3 && isComplete) ||
                    (step === 4 && isComplete && profileDone);
                  return (
                    <li key={step} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${done ? 'bg-magna text-white' : 'bg-gray-100 text-gray-400'}`}>
                        {done ? '✓' : step}
                      </div>
                      <span className={done ? 'text-gray-800 font-medium' : 'text-gray-400'}>{label}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Profile details section */}
            {showProfile && (
              <div className="bg-white rounded-2xl shadow-sm border p-8">
                {profileLoading ? (
                  <div className="flex justify-center py-6"><div className="loader" style={{ fontSize: 4 }} /></div>
                ) : (
                  <ProfileDetails initialProfile={profile} />
                )}
              </div>
            )}

          </div>
        </div>
      </section>
    </Layout>
  );
}
