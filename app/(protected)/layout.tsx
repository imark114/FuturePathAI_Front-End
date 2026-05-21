'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { analyticsService } from '@/services/analytics';

const navItems = [
  { href: '/dashboard',  icon: 'dashboard',      label: 'Dashboard' },
  { href: '/careers',    icon: 'explore',         label: 'Career Explorer' },
  { href: '/advisor',    icon: 'smart_toy',       label: 'AI Advisor' },
  { href: '/learning',   icon: 'route',           label: 'Learning Pathway' },
  { href: '/simulation', icon: 'model_training',  label: 'Simulations' },
  { href: '/skill-gap',  icon: 'analytics',       label: 'Skill Gap' },
  { href: '/settings',   icon: 'settings',        label: 'Settings' },
];

/** Calculate a career readiness score (0–100) from profile + analytics data */
function calcReadiness(user: any, analytics: any): number {
  let score = 0;
  const profile = user?.profile || {};

  // Profile completeness — 40 points max
  if (profile.bio) score += 8;
  if ((profile.current_skills?.length ?? 0) > 0) score += 10;
  if ((profile.target_roles?.length ?? 0) > 0) score += 8;
  if (profile.major) score += 5;
  if (profile.graduation_year) score += 4;
  if (profile.resume_text) score += 5;

  // Simulation activity — 40 points max
  const completed = analytics?.completed_simulations ?? 0;
  const simScore = Math.min(completed * 10, 40);
  score += simScore;

  // Average simulation score bonus — 20 points max
  const avg = analytics?.average_score ?? 0;
  score += Math.round((avg / 100) * 20);

  return Math.min(score, 100);
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [hydrated, isAuthenticated, router]);

  useEffect(() => {
    if (hydrated && isAuthenticated) {
      analyticsService.getStudentAnalytics()
        .then(setAnalytics)
        .catch(() => setAnalytics(null));
    }
  }, [hydrated, isAuthenticated]);

  if (!hydrated || !isAuthenticated) return null;

  const readiness = analytics?.readiness_score ?? calcReadiness(user, analytics);
  const readinessColor = readiness >= 70 ? '#10b981' : readiness >= 40 ? '#00c4cc' : '#f59e0b';
  const isStaff = (user as any)?.is_staff;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0f1e', fontFamily: 'Inter, sans-serif' }} suppressHydrationWarning>
      {/* Sidebar */}
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
                <p className="text-xs truncate" style={{ color: '#475569' }}>
                  {isStaff ? 'Admin' : 'Student Plan'}
                </p>
              </div>
            </div>
          )}

          {/* Dynamic readiness bar */}
          <div className="px-3 py-2.5 rounded-lg" style={{ background: 'rgba(0,196,204,0.08)', border: '1px solid rgba(0,196,204,0.15)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Career Readiness</span>
              <span className="text-xs font-bold" style={{ color: readinessColor }}>
                {analytics === null ? '—' : `${readiness}%`}
              </span>
            </div>
            <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: analytics === null ? '0%' : `${readiness}%`,
                  background: `linear-gradient(90deg, #00c4cc, ${readinessColor})`,
                }}
              />
            </div>
            {readiness < 40 && analytics !== null && (
              <p className="text-xs mt-1.5" style={{ color: '#64748b' }}>
                Complete your <Link href="/settings" style={{ color: '#00c4cc' }}>profile</Link> to boost score
              </p>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                  style={{
                    background: isActive ? 'rgba(0,196,204,0.1)' : 'transparent',
                    borderLeft: isActive ? '2px solid #00c4cc' : '2px solid transparent',
                    color: isActive ? '#00c4cc' : '#64748b',
                    marginLeft: '-2px',
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <span className="material-icons" style={{ fontSize: '20px' }}>{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}

          {/* Admin section — only for staff */}
          {isStaff && (
            <>
              <div className="pt-3 pb-1 px-3">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#2d3748', fontSize: '10px' }}>Admin</p>
              </div>
              {(() => {
                const isActive = pathname === '/admin-panel';
                return (
                  <Link href="/admin-panel">
                    <div
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all"
                      style={{
                        background: isActive ? 'rgba(239,68,68,0.1)' : 'transparent',
                        borderLeft: isActive ? '2px solid #ef4444' : '2px solid transparent',
                        color: isActive ? '#ef4444' : '#64748b',
                        marginLeft: '-2px',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.04)'; }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <span className="material-icons" style={{ fontSize: '20px' }}>admin_panel_settings</span>
                      <span className="text-sm font-medium">Admin Panel</span>
                    </div>
                  </Link>
                );
              })()}
            </>
          )}
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" suppressHydrationWarning>
        {children}
      </main>
    </div>
  );
}
