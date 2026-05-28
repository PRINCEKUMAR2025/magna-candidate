export interface AdditionalData {
  current_ctc:             number | null;
  expected_ctc:            number | null;
  notice_period_days:      number | null;
  current_location:        string | null;
  reason_for_change:       string | null;
  open_to_relocate:        string | null;
  preferred_work_location: string | null;
}

export interface ProfileCompletion {
  pct:          number;
  complete:     boolean;
  has_resume:   boolean;
  filled_count: number;
  total_count:  number;
  fields:       AdditionalData;
}

export interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  resume_url?: string;
  created_at?: string;
  completion?: ProfileCompletion;
}

// ── Job list card (summary) ─────────────────────────────────
export interface Job {
  id: number;
  company_name: string;
  role: string;
  location: string;
  job_type: string;
  budget_min?: number;
  budget_max?: number;
  budget_currency?: string;
  company_website?: string;
  notice_period?: string;
}

// ── Job detail (full) ───────────────────────────────────────
export interface JobDetail extends Job {
  company_linkedin_url?: string;
  responsibilities?: string;
  mandatory_skills?: string;
  good_to_have_skills?: string;
  preferred_skills?: string;
  status?: string;
  created_at?: string;
}

export interface ContactCompanyPayload {
  name: string;
  email: string;
  company: string;
  message: string;
}

export interface ContactCollegePayload {
  name: string;
  email: string;
  college: string;
  message: string;
}

// ── Full parsed profile ─────────────────────────────────────

export interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

export interface Education {
  year: string;
  degree: string;
  institution: string;
}

export interface Website {
  url: string;
  type?: string;
}

export interface CandidateProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  resume_url: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  websites: Website[];
  years_of_experience: number;
}

// ── Candidate Notification ──────────────────────────────────
export interface CandidateNotificationData {
  job_id:       number;
  job_role:     string;
  company_name: string;
  job_type:     string;
  location:     string;
  score_pct:    number;
  rank:         number;
}

export interface CandidateNotification {
  id:         number;
  type:       string;
  title:      string;
  body:       string;
  data:       CandidateNotificationData;
  is_read:    boolean;
  created_at: string;
}

export interface JobQuestion {
  id: number;
  question: string;
  question_type: 'text' | 'yes_no' | 'multiple_choice' | 'multiple_select';
  options?: string[] | null;
  required: boolean;
}

export interface ProfileUpdatePayload {
  name: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  websites: string[];
  years_of_experience: number;
}
