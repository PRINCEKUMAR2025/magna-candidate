import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCandidateAuth } from '@/components/auth/CandidateAuthContext';
import {
  getCandidateNotifications,
  markCandidateNotificationRead,
  markAllCandidateNotificationsRead,
  dismissCandidateNotification,
} from '@/lib/api';
import type { CandidateNotification } from '@/types';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Jobs', href: '/jobs' },
];

// ── Shared outside-click hook ─────────────────────────────────

function useClickOutside(cb: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [cb]);
  return ref;
}

// ── Guest "Your Account" dropdown ────────────────────────────

function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref   = useClickOutside(close);

  return (
    <div ref={ref} className="relative ml-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-4 pr-3 h-[38px] rounded-full bg-magna text-white font-semibold text-sm select-none hover:bg-magna/90 transition-all shadow-sm"
        aria-label="Account menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 opacity-80" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
        Your Account
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="currentColor"
        >
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-[46px] w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-[200]">
          {/* Header */}
          <div className="px-4 py-3 bg-magna/5 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Welcome</p>
            <p className="text-sm font-bold text-gray-700 mt-0.5">Join Magna Hire</p>
          </div>

          {/* Sign In */}
          <Link
            href="/login"
            onClick={close}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-magna/5 hover:text-magna transition-colors group"
          >
            <span className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-magna/10 flex items-center justify-center flex-shrink-0 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 group-hover:text-magna" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/>
              </svg>
            </span>
            <div>
              <p className="font-semibold leading-tight">Sign In</p>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">Access your account</p>
            </div>
          </Link>

          <div className="mx-4 border-t border-gray-100" />

          {/* Register */}
          <Link
            href="/register"
            onClick={close}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-magna/5 hover:text-magna transition-colors group"
          >
            <span className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-magna/10 flex items-center justify-center flex-shrink-0 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500 group-hover:text-magna" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.7 0-8 1.3-8 4v2h16v-2c0-2.7-5.3-4-8-4z"/>
              </svg>
            </span>
            <div>
              <p className="font-semibold leading-tight">Register</p>
              <p className="text-xs text-gray-400 leading-tight mt-0.5">Create a new account</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Authenticated avatar dropdown ─────────────────────────────

function AvatarDropdown({ name, onLogout }: { name: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const close           = () => setOpen(false);
  const ref             = useClickOutside(close);
  const initial         = name.charAt(0).toUpperCase();
  const router          = useRouter();

  return (
    <div ref={ref} className="relative ml-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-10 h-10 rounded-full bg-magna text-white font-bold text-base flex items-center justify-center select-none hover:ring-2 hover:ring-magna/40 transition-all"
        aria-label="Account menu"
        title={name}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-[200]">
          <div className="px-4 py-2.5 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm truncate">{name}</p>
          </div>
          <button
            onClick={() => { close(); router.push('/dashboard'); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-magna/5 hover:text-magna transition-colors flex items-center gap-2"
          >
            <span>👤</span> My Profile
          </button>
          <button
            onClick={() => { close(); onLogout(); }}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center gap-2"
          >
            <span>↩</span> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

// ── Notification Bell ─────────────────────────────────────────

function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<CandidateNotification[]>([]);
  const [unread, setUnread]               = useState(0);
  const ref = useClickOutside(() => setOpen(false));

  const load = useCallback(async () => {
    try {
      const { notifications: n, unread: u } = await getCandidateNotifications(30);
      setNotifications(n);
      setUnread(u);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) load();
  };

  const handleRead = async (id: number) => {
    await markCandidateNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnread((u) => Math.max(0, u - 1));
  };

  const handleDismiss = async (id: number, wasUnread: boolean) => {
    await dismissCandidateNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnread((u) => Math.max(0, u - 1));
  };

  const handleReadAll = async () => {
    await markAllCandidateNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  };

  const scoreColor = (pct: number) =>
    pct >= 70 ? '#10b981' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div ref={ref} className="relative mr-2">
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition text-gray-600"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 max-h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[300] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <span className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-magna" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 00-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={handleReadAll}
                className="text-xs font-semibold text-magna hover:bg-magna/5 px-2 py-1 rounded-md transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map((n) => {
                const d    = n.data;
                const pct  = d.score_pct || 0;
                const col  = scoreColor(pct);
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleRead(n.id)}
                    className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition ${
                      n.is_read ? 'bg-white hover:bg-gray-50' : 'bg-purple-50 hover:bg-purple-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>
                        {/* Role + company */}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs bg-magna/10 text-magna font-semibold px-2 py-0.5 rounded-full">{d.job_role}</span>
                          <span className="text-xs text-gray-500">{d.company_name}</span>
                          {d.location && <span className="text-xs text-gray-400">📍 {d.location}</span>}
                        </div>
                        {/* Score bar */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div style={{ width: `${pct}%`, background: col }} className="h-full rounded-full" />
                          </div>
                          <span style={{ color: col }} className="text-[11px] font-bold min-w-[30px]">{pct}%</span>
                        </div>
                        {/* Job link */}
                        {d.job_id && (
                          <Link
                            href={`/jobs/${d.job_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-block mt-2 text-xs font-semibold text-magna underline"
                          >
                            View Job →
                          </Link>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDismiss(n.id, !n.is_read); }}
                        className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0 transition"
                        aria-label="Dismiss"
                      >
                        ×
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      {new Date(n.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────

export default function Navbar() {
  const { candidate, logout } = useCandidateAuth();
  const router                = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  return (
    <div className="classy-nav-container sticky top-0 z-50 shadow-sm">
      <div className="container">
        <nav className="classy-navbar">

          {/* Logo */}
          <Link href="/" className="nav-brand">
            <Image
              src="/img/logo/Magna-Hire-Normal.png"
              alt="Magna Hire"
              width={120}
              height={40}
              priority
            />
          </Link>

          {/* Hamburger (mobile) */}
          <button
            className="hamburger-btn flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <span className="block w-6 h-0.5 bg-gray-700" />
            <span className="block w-6 h-0.5 bg-gray-700" />
            <span className="block w-6 h-0.5 bg-gray-700" />
          </button>

          {/* Desktop nav */}
          <div className="classynav desktop-nav">
            <ul className="items-center">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href} className={isActive(href) ? 'active' : ''}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}

              {candidate && (
                <li className="flex items-center">
                  <NotificationBell />
                </li>
              )}
              <li className="flex items-center">
                {candidate ? (
                  <AvatarDropdown name={candidate.name} onLogout={logout} />
                ) : (
                  <AccountDropdown />
                )}
              </li>
            </ul>
          </div>
        </nav>

        {/* Mobile nav menu */}
        {mobileOpen && (
          <div className="mobile-nav-menu flex-col py-3 border-t border-gray-100">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`block px-4 py-2 font-medium text-sm ${
                  isActive(href) ? 'text-magna' : 'text-gray-700'
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}

            {candidate ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100 mt-1">
                  <div className="w-9 h-9 rounded-full bg-magna text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {candidate.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-800 text-sm truncate">{candidate.name}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-magna font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  👤 My Profile
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-500"
                >
                  ↩ Sign Out
                </button>
              </>
            ) : (
              <div className="border-t border-gray-100 mt-1 pt-1">
                {/* Mobile accordion-style "Your Account" */}
                <button
                  onClick={() => setMobileAccountOpen((o) => !o)}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-semibold text-magna"
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                    Your Account
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-4 h-4 transition-transform duration-200 ${mobileAccountOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="currentColor"
                  >
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>

                {mobileAccountOpen && (
                  <div className="pl-4 pb-1">
                    <Link
                      href="/login"
                      className="block px-4 py-2 text-sm text-gray-700 font-medium"
                      onClick={() => { setMobileOpen(false); setMobileAccountOpen(false); }}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2 text-sm text-magna font-semibold"
                      onClick={() => { setMobileOpen(false); setMobileAccountOpen(false); }}
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
