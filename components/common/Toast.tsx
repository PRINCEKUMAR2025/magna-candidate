import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  onDone: () => void;
  duration?: number;
}

export default function Toast({ message, onDone, duration = 3500 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), duration - 400);
    const done = setTimeout(onDone, duration);
    return () => { clearTimeout(hide); clearTimeout(done); };
  }, [duration, onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#1a1a2e',
          color: '#fff',
          borderRadius: 100,
          padding: '12px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          fontSize: 14,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          maxWidth: '90vw',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        <span style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: '#22c55e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 12,
          fontWeight: 700,
        }}>
          ✓
        </span>
        {message}
      </div>
    </div>
  );
}
