import type {
  Candidate, Job, JobDetail,
  ContactCompanyPayload, ContactCollegePayload,
  CandidateProfile, ProfileUpdatePayload,
  AdditionalData, ProfileCompletion,
  CandidateNotification,
} from '@/types';

// Empty string = relative /api/* paths — the Next.js proxy (next.config.mjs rewrites)
// forwards them to the Flask backend.  NEXT_PUBLIC_API_BASE can override this for
// special deployments, but should normally be left empty.
const BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

// ── Candidate auth ──────────────────────────────────────────

export async function candidateMe(): Promise<Candidate> {
  const data = await request<{ success: true; candidate: Candidate }>('/api/candidate/me');
  return data.candidate;
}

export async function candidateLogin(email: string, password: string): Promise<Candidate> {
  const data = await request<{ success: true; candidate: Candidate }>('/api/candidate/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return data.candidate;
}

export async function candidateRegister(payload: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<Candidate> {
  const data = await request<{ success: true; candidate: Candidate }>('/api/candidate/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.candidate;
}

export async function candidateLogout(): Promise<void> {
  await fetch(`${BASE}/api/candidate/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}

// ── Candidate profile ────────────────────────────────────────

export async function getCandidateResumeUrl(): Promise<string> {
  const data = await request<{ success: true; url: string }>('/api/candidate/resume-url');
  return data.url;
}

export async function getCandidateProfile(): Promise<CandidateProfile> {
  const data = await request<{ success: true; profile: CandidateProfile }>('/api/candidate/profile');
  return data.profile;
}

export async function updateCandidateProfile(payload: ProfileUpdatePayload): Promise<void> {
  await request('/api/candidate/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

// ── Additional data (job preferences) ───────────────────────

export async function getAdditionalData(): Promise<{ data: AdditionalData; completion: ProfileCompletion }> {
  const res = await request<{ success: true; data: AdditionalData; completion: ProfileCompletion }>(
    '/api/candidate/additional-data',
  );
  return { data: res.data, completion: res.completion };
}

export async function saveAdditionalData(payload: Partial<AdditionalData>): Promise<ProfileCompletion> {
  const res = await request<{ success: true; completion: ProfileCompletion }>(
    '/api/candidate/additional-data',
    { method: 'POST', body: JSON.stringify(payload) },
  );
  return res.completion;
}

// ── Public endpoints ────────────────────────────────────────

export async function getPublicJobs(): Promise<Job[]> {
  const data = await request<{ success: true; jobs: Job[] }>('/api/public/jobs');
  return data.jobs;
}

export async function getJobById(id: number | string): Promise<JobDetail> {
  const data = await request<{ success: true; job: JobDetail }>(`/api/public/jobs/${id}`);
  return data.job;
}

export interface ApplyResult {
  already_applied: boolean;
  profile_incomplete: false;
}
export interface ApplyBlockedResult {
  already_applied: false;
  profile_incomplete: true;
  completion: ProfileCompletion;
}
export interface QuestionAnswer { question_id: number; answer: string; }

export async function getJobQuestions(jobId: number | string): Promise<JobQuestion[]> {
  const data = await request<{ success: true; questions: JobQuestion[] }>(
    `/api/public/jobs/${jobId}/questions`
  );
  return data.questions;
}

export async function applyToJob(
  jobId: number | string,
  answers: QuestionAnswer[] = []
): Promise<ApplyResult | ApplyBlockedResult> {
  const res = await fetch(`${BASE}/api/candidate/jobs/${jobId}/apply`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  const data = await res.json();
  if (!data.success && data.profile_incomplete) {
    return { already_applied: false, profile_incomplete: true, completion: data.completion as ProfileCompletion };
  }
  if (!data.success) throw new Error(data.error ?? 'Apply failed');
  return { already_applied: data.already_applied as boolean, profile_incomplete: false };
}

export async function checkApplied(jobId: number | string): Promise<boolean> {
  const data = await request<{ success: true; applied: boolean }>(
    `/api/candidate/jobs/${jobId}/applied`,
  );
  return data.applied;
}

export async function submitCompanyContact(payload: ContactCompanyPayload): Promise<void> {
  await request('/api/public/contact/company', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function submitCollegeContact(payload: ContactCollegePayload): Promise<void> {
  await request('/api/public/contact/college', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ── Resume upload ───────────────────────────────────────────

export async function uploadResume(file: File): Promise<{ resume_url: string; warning?: string }> {
  const formData = new FormData();
  formData.append('resume', file);

  const res = await fetch(`${BASE}/api/candidate/upload-resume`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Upload failed (${res.status})`);
  }
  const data = await res.json();
  if (!data.success) throw new Error(data.error ?? 'Upload failed');
  return { resume_url: data.resume_url as string, warning: data.warning };
}

// ── Candidate Notifications ─────────────────────────────────────────────

export async function getCandidateNotifications(limit = 30): Promise<{
  notifications: CandidateNotification[];
  unread: number;
}> {
  try {
    const res = await fetch(`${BASE}/api/notifications/candidate?limit=${limit}`, {
      credentials: 'include',
    });
    if (!res.ok) return { notifications: [], unread: 0 };
    const data = await res.json();
    return { notifications: data.notifications ?? [], unread: data.unread ?? 0 };
  } catch {
    return { notifications: [], unread: 0 };
  }
}

export async function markCandidateNotificationRead(id: number): Promise<void> {
  await fetch(`${BASE}/api/notifications/candidate/${id}/read`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function markAllCandidateNotificationsRead(): Promise<void> {
  await fetch(`${BASE}/api/notifications/candidate/read-all`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function dismissCandidateNotification(id: number): Promise<void> {
  await fetch(`${BASE}/api/notifications/candidate/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}
