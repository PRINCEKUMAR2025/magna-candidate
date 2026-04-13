import { useRef, useState } from 'react';
import { uploadResume } from '@/lib/api';

interface Props {
  onUploaded: (url: string) => void;
}

const ACCEPTED = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
const MAX_MB   = 5;

export default function ResumeUpload({ onUploaded }: Props) {
  const inputRef            = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState('');
  const [warning, setWarning]     = useState('');
  const [error, setError]         = useState('');

  const handleFile = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB} MB.`);
      return;
    }
    setError('');
    setWarning('');
    setUploading(true);
    setProgress('Uploading and parsing your resume with AI…');
    try {
      const result = await uploadResume(file);
      if (result.warning) setWarning(result.warning);
      onUploaded(result.resume_url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      setProgress('');
    }
  };

  return (
    <div>
      <div
        className="border-2 border-dashed border-magna rounded-xl p-8 text-center cursor-pointer hover:bg-magna/5 transition"
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          if (file && !uploading) handleFile(file);
        }}
      >
        {uploading ? (
          <>
            <div className="loader mx-auto mb-3" style={{ fontSize: 4 }} />
            <p className="text-gray-500 text-sm">{progress}</p>
          </>
        ) : (
          <>
            <p className="text-gray-500 mb-3">
              Drag &amp; drop your resume here, or
            </p>
            <button type="button" className="hami-btn" disabled={uploading}>
              Choose File
            </button>
            <p className="text-xs text-gray-400 mt-2">
              PDF · DOCX · JPG · PNG &nbsp;·&nbsp; Max {MAX_MB} MB
            </p>
          </>
        )}
      </div>

      {warning && (
        <p className="text-amber-600 text-xs mt-2">⚠ {warning}</p>
      )}
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          // Reset so same file can be re-uploaded
          e.target.value = '';
        }}
      />
    </div>
  );
}
