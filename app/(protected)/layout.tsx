'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics';

// ── Student nav ───────────────────────────────────────────────────────────────
const studentNav = [
  { href: '/dashboard',  icon: 'dashboard',      label: 'Dashboard' },
  { href: '/careers',    icon: 'explore',         label: 'Career Explorer' },
  { href: '/advisor',    icon: 'smart_toy',       label: 'AI Advisor' },
  { href: '/learning',   icon: 'route',           label: 'Learning Pathway' },
  { href: '/simulation', icon: 'model_training',  label: 'Simulations' },
  { href: '/skill-gap',  icon: 'analytics',       label: 'Skill Gap' },
  { href: '/settings',   icon: 'settings',        label: 'Settings' },
];

// ── Admin nav sections ────────────────────────────────────────────────────────
// Reflects B2B2C SaaS institutional business model
const adminNav = [
  {
    section: 'Platform',
    items: [
      { href: '/admin-panel',                  icon: 'dashboard_customize', label: 'Overview' },
      { href: '/admin-panel?tab=analytics',    icon: 'bar_chart',           label: 'Analytics' },
    ],
  },
  {
    section: 'Users & Institutions',
    items: [
      { href: '/admin-panel?tab=users',        icon: 'group',               label: 'User Management' },
      { href: '/admin-panel?tab=institutions', icon: 'account_balance',     label: 'Institutions' },
      { href: '/admin-panel?tab=cohorts',      icon: 'school',              label: 'Cohorts' },
    ],
  },
  {
    section: 'Content & AI',
    items: [
      { href: '/admin-panel?tab=careers',      icon: 'work',                label: 'Career Paths' },
      { href: '/admin-panel?tab=simulations',  icon: 'model_training',      label: 'Simulations' },
      { href: '/admin-panel?tab=ai',           icon: 'psychology',          label: 'AI Config' },
    ],
  },
  {
    section: 'Subscriptions',
    items: [
      { href: '/admin-panel?tab=plans',        icon: 'credit_card',         label: 'Plans & Billing' },
      { href: '/admin-panel?tab=licenses',     icon: 'verified',            label: 'Licenses' },
    ],
  },
  {
    section: 'System',
    items: [
      { href: '/admin-panel?tab=logs',         icon: 'terminal',            label: 'Audit Logs' },
      { href: '/admin-panel?tab=settings',     icon: 'settings',            label: 'System Settings' },
    ],
  },
];

/** Calculate career readiness score (0–100) from profile + analytics */
function calcReadiness(user: any, analytics: any): number {
  let score = 0;
  const profile = user?.profile || {};
  if (profile.bio) score += 8;
  if ((profile.current_skills?.length ?? 0) > 0) score += 10;
  if ((profile.target_roles?.length ?? 0) > 0) score += 8;
  if (profile.major) score += 5;
  if (profile.graduation_year) score += 4;
  if (profile.resume_text) score += 5;
  const completed = analytics?.completed_simulations ?? 0;
  score += Math.min(completed * 10, 40);
  const avg = analytics?.average_score ?? 0;
  score += Math.round((avg / 100) * 20);
  return Math.min(score, 100);
}

// ── Shared nav item renderer ──────────────────────────────────────────────────
function NavItem({ href, icon, label, isActive, accentColor = '#00c4cc' }: {
  href: string; icon: string; label: string; isActive: boolean; accentColor?: string;
}) {
  return (
    <Link href={href}>
      <div
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
        style={{
          background: isActive ? `${accentColor}18` : 'transparent',
          borderLeft: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
          color: isActive ? accentColor : '#64748b',
          marginLeft: '-2px',
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <span className="material-icons" style={{ fontSize: '20px' }}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';
  const isAdmin = !!(user?.role === 'admin' || (user as any)?.is_staff || (user as any)?.is_superuser);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/login');
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (hydrated && isAuthenticated && !isAdmin) {
      analyticsService.getStudentAnalytics()
        .then(setAnalytics)
        .catch(() => setAnalytics(null));
    }
  }, [hydrated, isAuthenticated, isAdmin]);

  if (!hydrated || !isAuthenticated) return null;

  const readiness = analytics?.readiness_score ?? calcReadiness(user, analytics);
  const readinessColor = readiness >= 70 ? '#10b981' : readiness >= 40 ? '#00c4cc' : '#f59e0b';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0f1e', fontFamily: 'Inter, sans-serif' }} suppressHydrationWarning>

      {/* ── ADMIN SIDEBAR ─────────────────────────────────────────────────── */}
      {isAdmin ? (
        <aside className="flex flex-col w-64 flex-shrink-0 h-full" style={{ background: '#0d1627', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Logo + Admin badge */}
          <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link href="/admin-panel">
              <span className="font-bold text-lg tracking-tight cursor-pointer" style={{ color: '#00c4cc' }}>FuturePath AI</span>
            </Link>
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <span className="material-icons" style={{ fontSize: '11px', color: '#ef4444' }}>shield</span>
              <span className="text-xs font-bold tracking-widest" style={{ color: '#ef4444' }}>ADMIN CONSOLE</span>
            </div>
          </div>

          {/* Admin user info */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {user && (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #7c3aed)', color: '#fff' }}>
                  {(user.first_name?.[0] || user.email?.[0] || 'A').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#f1f5f9' }}>
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email}
                  </p>
                  <p className="text-xs" style={{ color: '#ef4444' }}>
                    {(user as any)?.is_superuser ? 'Super Admin' : 'Staff Admin'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Admin nav sections */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
            {adminNav.map(group => (
              <div key={group.section}>
                <p className="text-xs font-bold uppercase tracking-widest px-3 mb-1"
                  style={{ color: '#1e2d47', fontSize: '10px', letterSpacing: '0.1em' }}>
                  {group.section}
                </p>
                <div className="space-y-0.5">
                  {group.items.map(item => {
                    const [hrefPath, hrefQuery] = item.href.split('?');
                    const hrefTab = hrefQuery?.split('tab=')[1];
                    const tabForActive = pathname === '/admin-panel' ? currentTab : null;
                    const isActive = pathname === hrefPath && (hrefTab ? tabForActive === hrefTab : tabForActive === 'overview');
                    return (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        label={item.label}
                        isActive={isActive}
                        accentColor="#ef4444"
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Admin bottom bar */}
          <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link href="/dashboard">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                style={{ color: '#475569' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; (e.currentTarget as HTMLDivElement).style.color = '#94a3b8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = '#475569'; }}
              >
                <span className="material-icons" style={{ fontSize: '18px' }}>person</span>
                <span className="text-sm font-medium">Student View</span>
              </div>
            </Link>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all text-left"
              style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>logout</span>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </aside>

      ) : (
        /* ── STUDENT SIDEBAR ──────────────────────────────────────────────── */
        <aside className="flex flex-col w-64 flex-shrink-0 h-full" style={{ background: '#0d1627', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Logo */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <Link href="/dashboard">
              <span className="font-bold text-lg tracking-tight cursor-pointer" style={{ color: '#00c4cc' }}>FuturePath AI</span>
            </Link>
          </div>

          {/* User Info + Readiness Badge */}
          <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {user && (
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #00c4cc, #4f46e5)', color: '#fff' }}>
                  {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: '#f1f5f9' }}>
                    {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#475569' }}>Student Plan</p>
                </div>
              </div>
            )}
            {/* Readiness bar */}
            <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(0,196,204,0.08)', border: '1px solid rgba(0,196,204,0.15)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Career Readiness</span>
                <span className="text-xs font-bold" style={{ color: readinessColor }}>
                  {analytics === null ? '—' : `${readiness}%`}
                </span>
              </div>
              <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: analytics === null ? '0%' : `${readiness}%`, background: `linear-gradient(90deg, #00c4cc, ${readinessColor})` }} />
              </div>
              {readiness < 40 && analytics !== null && (
                <p className="text-xs mt-1.5" style={{ color: '#64748b' }}>
                  Complete your <Link href="/settings" style={{ color: '#00c4cc' }}>profile</Link> to boost score
                </p>
              )}
            </div>
          </div>

          {/* Student Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {studentNav.map(item => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
                accentColor="#00c4cc"
              />
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all text-left"
              style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#64748b'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              <span className="material-icons" style={{ fontSize: '20px' }}>logout</span>
              <span className="text-sm font-medium">Log Out</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" suppressHydrationWarning>
        {children}
      </main>
    </div>
  );
}
