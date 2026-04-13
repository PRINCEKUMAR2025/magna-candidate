import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/router';
import { updateCandidateProfile } from '@/lib/api';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';
import type { Experience, Education } from '@/types';

interface Props {
  onSaved?: () => void;
}

// ── tiny ui helpers ──────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
      {children}
    </p>
  );
}

function FInput({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="form-control text-sm w-full"
      style={{ height: 40, padding: '0 14px' }}
    />
  );
}

function FTextarea({ value, onChange, placeholder, rows = 3 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="form-control text-sm w-full"
      style={{ height: 'auto', padding: '10px 14px' }}
    />
  );
}

function SectionCard({ title, action, children }: {
  title: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────

export default function ManualProfileForm({ onSaved }: Props) {
  const { candidate } = useCandidateAuth();
  const router        = useRouter();

  const [name,     setName]     = useState(candidate?.name  || '');
  const [phone,    setPhone]    = useState(candidate?.phone || '');
  const [summary,  setSummary]  = useState('');
  const [yoe,      setYoe]      = useState('');
  const [skills,   setSkills]   = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  const [experience, setExperience] = useState<Experience[]>([
    { title: '', company: '', duration: '', description: '' },
  ]);
  const [education, setEducation] = useState<Education[]>([
    { degree: '', institution: '', year: '' },
  ]);
  const [websites, setWebsites] = useState<string[]>(['']);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  // ── skills ──────────────────────────────────────────────────

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) setSkills((p) => [...p, s]);
    setNewSkill('');
  };
  const onSkillKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  // ── experience ───────────────────────────────────────────────

  const setExp = (i: number, field: keyof Experience, val: string) =>
    setExperience((p) => p.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  // ── education ────────────────────────────────────────────────

  const setEdu = (i: number, field: keyof Education, val: string) =>
    setEducation((p) => p.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  // ── websites ─────────────────────────────────────────────────

  const setWebsite = (i: number, val: string) =>
    setWebsites((p) => p.map((w, idx) => idx === i ? val : w));

  // ── submit ───────────────────────────────────────────────────

  const handleSave = async () => {
    if (!name.trim()) { setError('Full name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      await updateCandidateProfile({
        name:    name.trim(),
        phone:   phone.trim(),
        summary: summary.trim(),
        skills:  skills.filter(Boolean),
        experience: experience.filter((e) => e.title.trim() || e.company.trim()),
        education:  education.filter((e) => e.degree.trim() || e.institution.trim()),
        websites:   websites.filter((w) => w.trim()),
        years_of_experience: parseFloat(yoe) || 0,
      });
      if (onSaved) {
        onSaved();
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  // ── render ───────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Basic info */}
      <SectionCard title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label>Full Name *</Label>
            <FInput value={name} onChange={setName} placeholder="Your full name" />
          </div>
          <div>
            <Label>Phone</Label>
            <FInput value={phone} onChange={setPhone} placeholder="+91 9876543210" type="tel" />
          </div>
          <div>
            <Label>Years of Experience</Label>
            <FInput value={yoe} onChange={setYoe} placeholder="e.g. 6.2" type="number" />
          </div>
          <div className="sm:col-span-2">
            <Label>Professional Summary</Label>
            <FTextarea
              value={summary}
              onChange={setSummary}
              placeholder="A brief summary about your background and expertise…"
              rows={3}
            />
          </div>
        </div>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills">
        <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
          {skills.length === 0 && (
            <p className="text-gray-400 text-sm">No skills added yet — type below and press Enter.</p>
          )}
          {skills.map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 bg-magna/10 text-magna text-xs font-medium px-3 py-1 rounded-full">
              {s}
              <button
                onClick={() => setSkills((p) => p.filter((_, idx) => idx !== i))}
                className="text-magna/60 hover:text-magna text-base leading-none ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={onSkillKey}
            placeholder="Type a skill and press Enter or click Add"
            className="form-control text-sm flex-1"
            style={{ height: 38, padding: '0 14px' }}
          />
          <button
            onClick={addSkill}
            type="button"
            className="hami-btn btn-2 flex-shrink-0"
            style={{ height: 38, lineHeight: '38px', padding: '0 18px', fontSize: 13 }}
          >
            Add
          </button>
        </div>
      </SectionCard>

      {/* Experience */}
      <SectionCard
        title="Experience"
        action={
          <button
            onClick={() => setExperience((p) => [...p, { title: '', company: '', duration: '', description: '' }])}
            className="text-magna text-sm font-semibold hover:underline"
          >
            + Add Entry
          </button>
        }
      >
        <div className="space-y-5">
          {experience.map((exp, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 relative">
              {experience.length > 1 && (
                <button
                  onClick={() => setExperience((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-xl leading-none"
                >
                  ×
                </button>
              )}
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Job Title</Label>
                  <FInput value={exp.title} onChange={(v) => setExp(i, 'title', v)} placeholder="Product Manager" />
                </div>
                <div>
                  <Label>Company</Label>
                  <FInput value={exp.company} onChange={(v) => setExp(i, 'company', v)} placeholder="Company Name" />
                </div>
                <div>
                  <Label>Duration</Label>
                  <FInput value={exp.duration} onChange={(v) => setExp(i, 'duration', v)} placeholder="Jun '23 – Present" />
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <FTextarea
                    value={exp.description}
                    onChange={(v) => setExp(i, 'description', v)}
                    placeholder="Key responsibilities and outcomes…"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Education */}
      <SectionCard
        title="Education"
        action={
          <button
            onClick={() => setEducation((p) => [...p, { degree: '', institution: '', year: '' }])}
            className="text-magna text-sm font-semibold hover:underline"
          >
            + Add Entry
          </button>
        }
      >
        <div className="space-y-4">
          {education.map((edu, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 relative">
              {education.length > 1 && (
                <button
                  onClick={() => setEducation((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-xl leading-none"
                >
                  ×
                </button>
              )}
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <Label>Degree / Course</Label>
                  <FInput value={edu.degree} onChange={(v) => setEdu(i, 'degree', v)} placeholder="B.Tech Computer Science" />
                </div>
                <div>
                  <Label>Year / Period</Label>
                  <FInput value={edu.year} onChange={(v) => setEdu(i, 'year', v)} placeholder="2020" />
                </div>
                <div className="sm:col-span-3">
                  <Label>Institution</Label>
                  <FInput value={edu.institution} onChange={(v) => setEdu(i, 'institution', v)} placeholder="University / College Name" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Links */}
      <SectionCard
        title="Links & Websites"
        action={
          <button
            onClick={() => setWebsites((p) => [...p, ''])}
            className="text-magna text-sm font-semibold hover:underline"
          >
            + Add Link
          </button>
        }
      >
        <div className="space-y-2">
          {websites.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setWebsite(i, e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="form-control text-sm flex-1"
                style={{ height: 38, padding: '0 14px' }}
              />
              {websites.length > 1 && (
                <button
                  onClick={() => setWebsites((p) => p.filter((_, idx) => idx !== i))}
                  className="text-gray-300 hover:text-red-400 text-xl px-1"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Error + actions */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="hami-btn"
          style={{ height: 44, lineHeight: '44px', padding: '0 36px' }}
        >
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}
