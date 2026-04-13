import { useState, useEffect } from 'react';
import { saveAdditionalData } from '@/lib/api';
import type { AdditionalData, ProfileCompletion } from '@/types';

interface Props {
  initial: Partial<AdditionalData>;
  onSaved: (completion: ProfileCompletion) => void;
}

interface FieldMeta {
  key: keyof AdditionalData;
  label: string;
  placeholder: string;
  type: 'number' | 'text' | 'textarea';
}

const FIELDS: FieldMeta[] = [
  { key: 'current_ctc',             label: 'Current CTC (LPA)',      placeholder: 'e.g. 7.2',                         type: 'number'   },
  { key: 'expected_ctc',            label: 'Expected CTC (LPA)',     placeholder: 'e.g. 8.5',                         type: 'number'   },
  { key: 'notice_period_days',      label: 'Notice Period (days)',   placeholder: 'e.g. 30  (enter 0 for immediate)', type: 'number'   },
  { key: 'current_location',        label: 'Current Location',       placeholder: 'e.g. Bengaluru',                   type: 'text'     },
  { key: 'reason_for_change',       label: 'Reason for Job Change',  placeholder: 'e.g. Looking for growth opportunities…', type: 'textarea' },
  { key: 'open_to_relocate',        label: 'Open to Relocate?',      placeholder: 'e.g. Yes / Mumbai, Pune / No',     type: 'text'     },
  { key: 'preferred_work_location', label: 'Preferred Work Location', placeholder: 'e.g. Remote / Hybrid / Bengaluru', type: 'text'    },
];

function isFilled(key: keyof AdditionalData, val: string): boolean {
  if (key === 'notice_period_days') return val !== '';
  if (key === 'current_ctc' || key === 'expected_ctc') return val !== '' && Number(val) > 0;
  return val.trim().length > 0;
}

export default function AdditionalDataForm({ initial, onSaved }: Props) {
  const toForm = (d: Partial<AdditionalData>): Record<string, string> => ({
    current_ctc:             d.current_ctc             != null ? String(d.current_ctc)        : '',
    expected_ctc:            d.expected_ctc            != null ? String(d.expected_ctc)       : '',
    notice_period_days:      d.notice_period_days      != null ? String(d.notice_period_days) : '',
    current_location:        d.current_location        ?? '',
    reason_for_change:       d.reason_for_change       ?? '',
    open_to_relocate:        d.open_to_relocate        ?? '',
    preferred_work_location: d.preferred_work_location ?? '',
  });

  const [form, setForm] = useState<Record<string, string>>(() => toForm(initial));
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [saved,  setSaved]  = useState(false);

  // Re-fill form when parent loads existing data from the API
  useEffect(() => {
    const hasAny = Object.values(initial).some((v) => v != null && v !== '');
    if (hasAny) {
      setForm(toForm(initial));
      setSaved(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initial)]);

  const filledCount = FIELDS.filter((f) => isFilled(f.key, form[f.key])).length;
  const pct = Math.round((filledCount / FIELDS.length) * 100);

  const set = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaved(false);
    setError('');
  };

  const handleSave = async () => {
    if (filledCount < FIELDS.length) {
      setError(`Please fill all ${FIELDS.length} fields — ${filledCount} of ${FIELDS.length} done.`);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload: Partial<AdditionalData> = {
        current_ctc:             form.current_ctc        !== '' ? parseFloat(form.current_ctc)             : null,
        expected_ctc:            form.expected_ctc       !== '' ? parseFloat(form.expected_ctc)            : null,
        notice_period_days:      form.notice_period_days !== '' ? parseInt(form.notice_period_days, 10)    : null,
        current_location:        form.current_location        || null,
        reason_for_change:       form.reason_for_change       || null,
        open_to_relocate:        form.open_to_relocate        || null,
        preferred_work_location: form.preferred_work_location || null,
      };
      const completion = await saveAdditionalData(payload);
      setSaved(true);
      onSaved(completion);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-5 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
        <div className="flex-1 h-2 bg-indigo-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-magna rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-magna whitespace-nowrap">
          {filledCount} / {FIELDS.length} fields
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => {
          const filled = isFilled(f.key, form[f.key]);
          const cls = `w-full border rounded-xl px-3 py-2 text-sm outline-none transition-colors focus:border-magna ${
            filled ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
          }`;
          return (
            <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                {f.label} <span className="text-red-400">*</span>
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  rows={3}
                  className={cls}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              ) : (
                <input
                  type={f.type}
                  step={f.type === 'number' ? '0.1' : undefined}
                  min={f.type === 'number' ? '0' : undefined}
                  className={cls}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => set(f.key, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
      {saved && <p className="text-green-600 text-xs mt-3 font-semibold">✓ Saved successfully!</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="hami-btn mt-5 w-full disabled:opacity-50"
        style={{ height: 44, lineHeight: '44px', fontSize: 15 }}
      >
        {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save & Complete Profile'}
      </button>
    </div>
  );
}
