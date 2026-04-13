import { useState } from 'react';
import { getCandidateProfile, updateCandidateProfile } from '@/lib/api';
import type { CandidateProfile, Experience, Education } from '@/types';

interface Props {
  initialProfile?: CandidateProfile | null;
}

// ── tiny helpers ────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-base font-bold text-gray-700 border-b border-gray-100 pb-2 mb-3">
      {children}
    </h4>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-magna/10 text-magna text-xs font-medium px-3 py-1 rounded-full">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="text-magna/60 hover:text-magna leading-none text-base">
          ×
        </button>
      )}
    </span>
  );
}

function Field({
  label, value, editing, onChange, multiline,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  if (!editing && !value) return null;
  return (
    <div className="mb-3">
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      {editing ? (
        multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="form-control text-sm"
            style={{ height: 'auto', padding: '10px 14px' }}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-control text-sm"
            style={{ height: 40, padding: '0 14px' }}
          />
        )
      ) : (
        <p className="text-gray-800 text-sm">{value}</p>
      )}
    </div>
  );
}

// ── main component ──────────────────────────────────────────

export default function ProfileDetails({ initialProfile }: Props) {
  const [profile, setProfile]   = useState<CandidateProfile | null>(initialProfile ?? null);
  const [loading, setLoading]   = useState(!initialProfile);
  const [fetchErr, setFetchErr] = useState('');
  const [editing, setEditing]   = useState(false);
  const [draft, setDraft]       = useState<CandidateProfile | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState('');
  const [saved, setSaved]       = useState(false);
  const [newSkill, setNewSkill] = useState('');

  // Fetch on first render if no initialProfile passed
  useState(() => {
    if (initialProfile) return;
    getCandidateProfile()
      .then(setProfile)
      .catch((e) => setFetchErr(e.message))
      .finally(() => setLoading(false));
  });

  const startEdit = () => {
    if (!profile) return;
    setDraft(JSON.parse(JSON.stringify(profile))); // deep clone
    setEditing(true);
    setSaveErr('');
    setSaved(false);
  };

  const cancelEdit = () => {
    setDraft(null);
    setEditing(false);
    setSaveErr('');
  };

  const saveEdit = async () => {
    if (!draft) return;
    setSaving(true);
    setSaveErr('');
    try {
      await updateCandidateProfile({
        name:                 draft.name,
        phone:                draft.phone,
        summary:              draft.summary,
        skills:               draft.skills,
        experience:           draft.experience,
        education:            draft.education,
        websites:             draft.websites.map((w) => (typeof w === 'string' ? w : w.url)),
        years_of_experience:  draft.years_of_experience,
      });
      setProfile({ ...draft });
      setEditing(false);
      setDraft(null);
      setSaved(true);
    } catch (e: unknown) {
      setSaveErr(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── helpers for draft mutation ──────────────────────────────

  const d = draft; // shorthand

  const setDraftField = (key: keyof CandidateProfile, val: unknown) =>
    setDraft((prev) => prev ? { ...prev, [key]: val } : prev);

  const addSkill = () => {
    const sk = newSkill.trim();
    if (!sk || !d) return;
    if (!d.skills.includes(sk)) setDraftField('skills', [...d.skills, sk]);
    setNewSkill('');
  };

  const removeSkill = (i: number) =>
    d && setDraftField('skills', d.skills.filter((_, idx) => idx !== i));

  const setExp = (i: number, key: keyof Experience, val: string) =>
    d && setDraftField('experience', d.experience.map((e, idx) =>
      idx === i ? { ...e, [key]: val } : e
    ));

  const addExp = () =>
    d && setDraftField('experience', [
      ...d.experience,
      { title: '', company: '', duration: '', description: '' },
    ]);

  const removeExp = (i: number) =>
    d && setDraftField('experience', d.experience.filter((_, idx) => idx !== i));

  const setEdu = (i: number, key: keyof Education, val: string) =>
    d && setDraftField('education', d.education.map((e, idx) =>
      idx === i ? { ...e, [key]: val } : e
    ));

  const addEdu = () =>
    d && setDraftField('education', [
      ...d.education,
      { year: '', degree: '', institution: '' },
    ]);

  const removeEdu = (i: number) =>
    d && setDraftField('education', d.education.filter((_, idx) => idx !== i));

  const setWebsite = (i: number, val: string) =>
    d && setDraftField('websites', d.websites.map((w, idx) =>
      idx === i ? { ...w, url: val } : w
    ));

  const addWebsite = () =>
    d && setDraftField('websites', [...d.websites, { url: '' }]);

  const removeWebsite = (i: number) =>
    d && setDraftField('websites', d.websites.filter((_, idx) => idx !== i));

  // ── data to render (draft when editing, profile otherwise) ──
  const data = editing ? draft : profile;

  // ── render ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="loader" style={{ fontSize: 4 }} />
      </div>
    );
  }

  if (fetchErr) {
    return <p className="text-red-500 text-sm py-4">{fetchErr}</p>;
  }

  if (!data) return null;

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold">Profile Details</h3>
        {!editing ? (
          <button onClick={startEdit} className="hami-btn btn-2" style={{ height: 36, lineHeight: '36px', padding: '0 20px', fontSize: 13 }}>
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={cancelEdit} className="hami-btn btn-2" style={{ height: 36, lineHeight: '36px', padding: '0 16px', fontSize: 13 }}>
              Cancel
            </button>
            <button onClick={saveEdit} disabled={saving} className="hami-btn" style={{ height: 36, lineHeight: '36px', padding: '0 20px', fontSize: 13 }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {saved && !editing && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg mb-4">
          Profile updated successfully.
        </div>
      )}
      {saveErr && (
        <p className="text-red-500 text-sm mb-4">{saveErr}</p>
      )}

      {/* ── Basic info ── */}
      <div className="grid sm:grid-cols-2 gap-x-6">
        <Field label="Full Name" value={data.name} editing={editing} onChange={(v) => d && setDraftField('name', v)} />
        <Field label="Phone" value={data.phone} editing={editing} onChange={(v) => d && setDraftField('phone', v)} />
        <Field label="Years of Experience" value={data.years_of_experience ? String(data.years_of_experience) : ''} editing={editing}
          onChange={(v) => d && setDraftField('years_of_experience', parseFloat(v) || 0)} />
      </div>

      {/* Summary */}
      <Field label="Summary" value={data.summary} editing={editing} onChange={(v) => d && setDraftField('summary', v)} multiline />

      {/* ── Skills ── */}
      {(data.skills.length > 0 || editing) && (
        <div className="mb-5">
          <SectionTitle>Skills</SectionTitle>
          <div className="flex flex-wrap gap-2 mb-2">
            {data.skills.map((sk, i) => (
              <Tag key={i} label={sk} onRemove={editing ? () => removeSkill(i) : undefined} />
            ))}
          </div>
          {editing && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add skill…"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="form-control text-sm flex-1"
                style={{ height: 38, padding: '0 14px' }}
              />
              <button onClick={addSkill} className="hami-btn" style={{ height: 38, lineHeight: '38px', padding: '0 16px', fontSize: 13 }}>
                Add
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Experience ── */}
      {(data.experience.length > 0 || editing) && (
        <div className="mb-5">
          <SectionTitle>Experience</SectionTitle>
          <div className="space-y-4">
            {data.experience.map((exp, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 relative">
                {editing && (
                  <button
                    onClick={() => removeExp(i)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-lg leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
                {editing ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(['title', 'company', 'duration'] as const).map((key) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-0.5 capitalize">{key}</p>
                        <input
                          type="text"
                          value={exp[key]}
                          onChange={(e) => setExp(i, key, e.target.value)}
                          className="form-control text-sm"
                          style={{ height: 36, padding: '0 12px' }}
                        />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-400 mb-0.5">Description</p>
                      <textarea
                        value={exp.description}
                        onChange={(e) => setExp(i, 'description', e.target.value)}
                        rows={2}
                        className="form-control text-sm"
                        style={{ height: 'auto', padding: '8px 12px' }}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-gray-800">{exp.title}</p>
                    <p className="text-gray-600 text-sm">{exp.company}</p>
                    {exp.duration && <p className="text-gray-400 text-xs mt-0.5">{exp.duration}</p>}
                    {exp.description && <p className="text-gray-600 text-sm mt-2">{exp.description}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <button onClick={addExp} className="mt-3 text-sm text-magna underline">
              + Add experience
            </button>
          )}
        </div>
      )}

      {/* ── Education ── */}
      {(data.education.length > 0 || editing) && (
        <div className="mb-5">
          <SectionTitle>Education</SectionTitle>
          <div className="space-y-4">
            {data.education.map((edu, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 relative">
                {editing && (
                  <button
                    onClick={() => removeEdu(i)}
                    className="absolute top-3 right-3 text-gray-300 hover:text-red-400 text-lg leading-none"
                    title="Remove"
                  >
                    ×
                  </button>
                )}
                {editing ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {(['degree', 'institution', 'year'] as const).map((key) => (
                      <div key={key}>
                        <p className="text-xs text-gray-400 mb-0.5 capitalize">{key}</p>
                        <input
                          type="text"
                          value={edu[key]}
                          onChange={(e) => setEdu(i, key, e.target.value)}
                          className="form-control text-sm"
                          style={{ height: 36, padding: '0 12px' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-gray-800">{edu.degree}</p>
                    <p className="text-gray-600 text-sm">{edu.institution}</p>
                    {edu.year && <p className="text-gray-400 text-xs mt-0.5">{edu.year}</p>}
                  </>
                )}
              </div>
            ))}
          </div>
          {editing && (
            <button onClick={addEdu} className="mt-3 text-sm text-magna underline">
              + Add education
            </button>
          )}
        </div>
      )}

      {/* ── Websites ── */}
      {(data.websites.length > 0 || editing) && (
        <div className="mb-2">
          <SectionTitle>Links &amp; Websites</SectionTitle>
          <div className="space-y-2">
            {data.websites.map((w, i) => {
              const url = typeof w === 'string' ? w : w.url;
              return editing ? (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setWebsite(i, e.target.value)}
                    className="form-control text-sm flex-1"
                    style={{ height: 36, padding: '0 12px' }}
                  />
                  <button onClick={() => removeWebsite(i)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
                </div>
              ) : (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                  className="block text-magna text-sm underline truncate">
                  {url}
                </a>
              );
            })}
          </div>
          {editing && (
            <button onClick={addWebsite} className="mt-2 text-sm text-magna underline">
              + Add link
            </button>
          )}
        </div>
      )}
    </div>
  );
}
