'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

// ── Config ─────────────────────────────────────────────────────────────────────
const TOAST_DURATION = 4000; // ms before auto-dismiss
const EXIT_DURATION  = 300;  // ms for slide-out animation

const STYLES: Record<ToastType, { bg: string; border: string; icon: string; color: string }> = {
  success: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.35)',  icon: 'check_circle',  color: '#10b981' },
  error:   { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.35)',   icon: 'error',          color: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.35)',  icon: 'warning',        color: '#f59e0b' },
  info:    { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.35)',  icon: 'info',           color: '#3b82f6' },
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    // Mark as exiting first (for animation)
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, EXIT_DURATION);
  }, []);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), TOAST_DURATION);
  }, [dismiss]);

  const toast = {
    success: (msg: string) => show(msg, 'success'),
    error:   (msg: string) => show(msg, 'error'),
    warning: (msg: string) => show(msg, 'warning'),
    info:    (msg: string) => show(msg, 'info'),
  };

  return { toasts, toast, dismiss };
}

// ── Single Toast Item ──────────────────────────────────────────────────────────
function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const s = STYLES[t.type];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger slide-in on mount
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      onClick={onDismiss}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '12px 14px',
        borderRadius: '12px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        backdropFilter: 'blur(12px)',
        cursor: 'pointer',
        minWidth: '280px',
        maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        fontFamily: 'Inter, sans-serif',
        transition: `opacity ${EXIT_DURATION}ms ease, transform ${EXIT_DURATION}ms ease`,
        opacity: visible && !t.exiting ? 1 : 0,
        transform: visible && !t.exiting ? 'translateX(0)' : 'translateX(24px)',
      }}
    >
      <span className="material-icons" style={{ fontSize: '18px', color: s.color, flexShrink: 0, marginTop: '1px' }}>
        {s.icon}
      </span>
      <p style={{ fontSize: '13px', fontWeight: 500, color: '#f1f5f9', lineHeight: 1.45, flex: 1 }}>
        {t.message}
      </p>
      <span className="material-icons" style={{ fontSize: '14px', color: '#475569', flexShrink: 0, marginTop: '2px' }}>
        close
      </span>
    </div>
  );
}

// ── Container (render at page root) ───────────────────────────────────────────
export function ToastContainer({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}
