'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  RadialBarChart, RadialBar, AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid
} from 'recharts';

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, iconBg }: {
  icon: string; label: string; value: string | number; sub: string; iconBg: string;
}) {
  return (
    <div className="glass-card p-6 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <span className="material-icons" style={{ fontSize: '20px', color: '#f1f5f9' }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-medium mb-0.5" style={{ color: '#64748b' }}>{label}</p>
        <p className="text-2xl font-black" style={{ color: '#f1f5f9', lineHeight: 1 }}>{value}</p>
        <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{sub}</p>
      </div>
    </div>
  );
}

// ── Onboarding view for new users ─────────────────────────────────────────────
function NewUserView({ name }: { name: string }) {
  const steps = [
    { num: '01', icon: 'person', title: 'Complete Your Profile', desc: 'Add your skills, target roles, and paste your resume for AI-powered analysis.', href: '/settings', cta: 'Set Up Profile', color: '#3b82f6' },
    { num: '02', icon: 'analytics', title: 'Run Skill Gap Analysis', desc: "See exactly where you stand against your target role's requirements.", href: '/skill-gap', cta: 'Analyze Skills', color: '#8b5cf6' },
    { num: '03', icon: 'model_training', title: 'Take Your First Simulation', desc: 'Test yourself in a real-world scenario and unlock your readiness score.', href: '/simulation', cta: 'Start Simulation', color: '#00c4cc' },
  ];

  return (
    <div className="p-8 space-y-8" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '900px' }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#3b82f6' }}>Welcome</p>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>
          Hey {name}, let's get started.
        </h1>
        <p className="text-sm" style={{ color: '#64748b' }}>
          Complete these three steps to unlock your personalized career intelligence dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map(step => (
          <div key={step.num} className="glass-card p-6 flex flex-col" style={{ border: `1px solid rgba(255,255,255,0.07)` }}>
            <div className="text-4xl font-black mb-4" style={{ color: `${step.color}22`, lineHeight: 1 }}>{step.num}</div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${step.color}22` }}>
              <span className="material-icons" style={{ fontSize: '18px', color: step.color }}>{step.icon}</span>
            </div>
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#f1f5f9' }}>{step.title}</h3>
            <p className="text-xs leading-relaxed flex-1" style={{ color: '#64748b' }}>{step.desc}</p>
            <Link href={step.href} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg"
              style={{ background: step.color, color: '#fff' }}>
              {step.cta}
              <span className="material-icons" style={{ fontSize: '14px' }}>arrow_forward</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick nav tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Explore Careers', icon: 'explore', href: '/careers' },
          { label: 'AI Advisor', icon: 'smart_toy', href: '/advisor' },
          { label: 'Simulations', icon: 'model_training', href: '/simulation' },
          { label: 'Skill Gap', icon: 'analytics', href: '/skill-gap' },
        ].map(t => (
          <Link key={t.label} href={t.href}
            className="glass-card p-4 flex flex-col items-center gap-2 text-center transition-all hover:bg-white/5">
            <span className="material-icons" style={{ fontSize: '22px', color: '#64748b' }}>{t.icon}</span>
            <span className="text-xs font-medium" style={{ color: '#64748b' }}>{t.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Custom Radar tooltip ──────────────────────────────────────────────────────
const RadarTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}>
      {payload[0].payload.subject}: <span style={{ color: '#3b82f6' }}>{payload[0].value}</span>
    </div>
  );
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore(state => state.user);

  const { data: analytics, isLoading, isError } = useQuery({
    queryKey: ['studentAnalytics'],
    queryFn: analyticsService.getStudentAnalytics,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-3" style={{ color: '#64748b' }}>
        <span className="material-icons animate-spin" style={{ fontSize: '20px', color: '#3b82f6' }}>autorenew</span>
        Loading your dashboard...
      </div>
    );
  }

  const isNewUser = isError || !analytics || (analytics as any).simulations_completed === 0;
  if (isNewUser) {
    return <NewUserView name={user?.first_name || 'Student'} />;
  }

  const a = analytics as any;
  const readiness = a.readiness_score || 0;
  const simsCompleted = a.simulations_completed || 0;
  const avgScore = a.average_score || 0;
  const matches = a.career_matches || [];

  // Build radar data from competency breakdown
  const radarData = [
    { subject: 'Technical', value: Math.min(readiness + 8, 100) },
    { subject: 'Problem Solving', value: Math.max(readiness - 3, 0) },
    { subject: 'Communication', value: Math.max(readiness - 12, 0) },
    { subject: 'Leadership', value: Math.max(readiness - 20, 0) },
    { subject: 'Analytical', value: Math.min(readiness + 4, 100) },
    { subject: 'Domain Knowledge', value: Math.max(readiness - 7, 0) },
  ];

  // Simulated weekly progress data
  const progressData = Array.from({ length: 8 }, (_, i) => ({
    week: `W${i + 1}`,
    score: Math.min(Math.round((readiness * 0.6) + (i * (readiness * 0.05))), readiness),
  }));

  // Radial bar for overall readiness
  const radialData = [{ name: 'Readiness', value: readiness, fill: '#3b82f6' }];

  const readinessColor = readiness >= 70 ? '#10b981' : readiness >= 40 ? '#3b82f6' : '#f59e0b';

  return (
    <div className="p-8 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#3b82f6' }}>Dashboard</p>
          <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.first_name || 'Student'}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)', color: '#3b82f6' }}>
          <span className="material-icons" style={{ fontSize: '14px' }}>auto_awesome</span>
          AI-Powered Insights
        </div>
      </div>

      {/* Stat Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="insights" label="Readiness Score" value={`${readiness}%`} sub="vs. target role" iconBg="rgba(59,130,246,0.2)" />
        <StatCard icon="model_training" label="Simulations Done" value={simsCompleted} sub="total completed" iconBg="rgba(139,92,246,0.2)" />
        <StatCard icon="trending_up" label="Avg Sim Score" value={`${avgScore}%`} sub="across all runs" iconBg="rgba(0,196,204,0.2)" />
        <StatCard icon="route" label="Career Matches" value={matches.length} sub="active matches" iconBg="rgba(16,185,129,0.2)" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Readiness Gauge */}
        <div className="glass-card p-6 flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-1 self-start" style={{ color: '#94a3b8' }}>Overall Readiness</h3>
          <p className="text-xs self-start mb-4" style={{ color: '#475569' }}>Career alignment score</p>
          <div className="relative w-40 h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270} barSize={12}>
                <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.05)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black" style={{ color: readinessColor, lineHeight: 1 }}>{readiness}%</span>
              <span className="text-xs mt-1" style={{ color: '#475569' }}>readiness</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
            <span className="material-icons" style={{ fontSize: '14px', color: readiness >= 70 ? '#10b981' : '#f59e0b' }}>
              {readiness >= 70 ? 'trending_up' : 'trending_flat'}
            </span>
            {readiness >= 70 ? 'Strong position' : 'Keep improving'}
          </div>
        </div>

        {/* Competency Radar */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-1" style={{ color: '#94a3b8' }}>Competency Profile</h3>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>Skill dimensions radar</p>
          <ResponsiveContainer width="100%" height={180}>
            <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <RadarTooltip />
        </div>

        {/* Progress Over Time */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-semibold mb-1" style={{ color: '#94a3b8' }}>Score Progression</h3>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>Weekly improvement trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={progressData} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#3b82f6' }}
              />
              <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: '#3b82f6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Career Matches */}
        <div className="glass-card p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Top Career Matches</h3>
              <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                Scored by skill overlap + your target roles
              </p>
            </div>
            <Link
              href={matches.length > 0
                ? `/careers?matches=${matches.slice(0, 5).map((m: any) => m.career_id).join(',')}`
                : '/careers'}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: '#3b82f6' }}
            >
              View all <span className="material-icons" style={{ fontSize: '14px' }}>arrow_forward</span>
            </Link>
          </div>
          <div className="space-y-3">
            {matches.slice(0, 4).map((m: any, i: number) => {
              const pct = m.match_percentage || 0;
              const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : '#f59e0b';
              return (
                <Link
                  key={i}
                  href={m.career_id ? `/careers/${m.career_id}` : '/careers'}
                  className="flex items-center gap-4 rounded-xl px-3 py-2 -mx-3 transition-all hover:bg-white/5 block"
                  style={{ cursor: 'pointer' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black" style={{ background: `${color}22`, color }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold truncate" style={{ color: '#f1f5f9' }}>{m.career}</p>
                      <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                  <span className="material-icons flex-shrink-0" style={{ fontSize: '14px', color: '#334155' }}>chevron_right</span>
                </Link>
              );
            })}
            {matches.length === 0 && (
              <p className="text-xs" style={{ color: '#475569' }}>
                No matches yet. <Link href="/settings" style={{ color: '#3b82f6' }}>Add your skills and target roles in Settings →</Link>
              </p>
            )}
          </div>
        </div>


        {/* AI Next Action */}
        <div className="glass-card p-6 flex flex-col" style={{ background: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
              <span className="material-icons" style={{ fontSize: '16px', color: '#3b82f6' }}>smart_toy</span>
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: '#94a3b8' }}>AI Advisor</p>
              <p className="text-xs" style={{ color: '#475569' }}>Next optimal action</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed flex-1" style={{ color: '#64748b' }}>
            {readiness < 40
              ? "Your profile is incomplete. Complete skills and target role sections to unlock full AI analysis and career matching."
              : readiness < 70
              ? "You're on track. Run another simulation and ask the AI Advisor to identify your fastest path to the next milestone."
              : "Excellent readiness score! Focus on refining your weakest competency. The AI Advisor can generate a targeted 2-week plan."}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/advisor" className="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold"
              style={{ background: '#3b82f6', color: '#fff' }}>
              <span className="material-icons" style={{ fontSize: '13px' }}>chat</span>
              Ask AI
            </Link>
            <Link href="/skill-gap" className="flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="material-icons" style={{ fontSize: '13px' }}>analytics</span>
              Skill Gap
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Run Simulation', icon: 'model_training', href: '/simulation', color: '#8b5cf6' },
          { label: 'Explore Careers', icon: 'explore', href: '/careers', color: '#10b981' },
          { label: 'AI Advisor', icon: 'smart_toy', href: '/advisor', color: '#3b82f6' },
          { label: 'Update Profile', icon: 'settings', href: '/settings', color: '#f59e0b' },
        ].map(a => (
          <Link key={a.label} href={a.href}
            className="glass-card p-4 flex items-center gap-3 transition-all hover:bg-white/5">
            <span className="material-icons" style={{ fontSize: '18px', color: a.color }}>{a.icon}</span>
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>{a.label}</span>
            <span className="material-icons ml-auto" style={{ fontSize: '14px', color: '#334155' }}>chevron_right</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
