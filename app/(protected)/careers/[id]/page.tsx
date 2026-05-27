'use client';

import { use, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { careerService } from '@/services/career';
import { careerComparisonService } from '@/services/admin';

// ── Icon helper ───────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
  'AI': 'psychology', 'Data': 'analytics', 'ML': 'model_training',
  'Cloud': 'cloud', 'Security': 'security', 'Full': 'code',
  'Quant': 'show_chart', 'Product': 'inventory_2', 'Bio': 'biotech',
  'default': 'work',
};
function getIcon(title: string): string {
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (title?.includes(key)) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.default;
}

// ── Skill Gap Panel ───────────────────────────────────────────────────────────
function SkillComparisonPanel({ careerId, careerTitle }: { careerId: string; careerTitle: string }) {
  const [triggered, setTriggered] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['careerComparison', careerId],
    queryFn: () => careerComparisonService.compare(careerId),
    enabled: triggered,
    staleTime: 5 * 60 * 1000,
  });

  const priorityColor: Record<string, string> = {
    Critical: '#ef4444', High: '#f59e0b', Medium: '#3b82f6',
  };
  const actionIcon: Record<string, string> = {
    Simulate: 'model_training', Study: 'menu_book', Practice: 'code',
  };

  if (!triggered) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="material-icons mb-4" style={{ fontSize: '48px', color: 'rgba(0,196,204,0.3)' }}>
          compare_arrows
        </span>
        <p className="text-sm font-semibold mb-2" style={{ color: '#94a3b8' }}>
          AI Skill Comparison
        </p>
        <p className="text-xs mb-6 max-w-xs" style={{ color: '#475569' }}>
          Gemini will analyze your profile, skills, and resume against this career's requirements — giving you a personalized readiness report.
        </p>
        <button
          onClick={() => setTriggered(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #00c4cc, #4f46e5)', color: '#fff', cursor: 'pointer' }}
        >
          <span className="material-icons" style={{ fontSize: '18px' }}>auto_awesome</span>
          Analyze My Fit for {careerTitle}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="material-icons animate-spin" style={{ fontSize: '36px', color: '#00c4cc' }}>autorenew</span>
        <p className="text-sm" style={{ color: '#64748b' }}>Gemini is analyzing your profile...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-sm mb-3" style={{ color: '#ef4444' }}>Analysis failed. Please ensure your profile and skills are filled in.</p>
        <button onClick={() => setTriggered(false)} className="text-xs" style={{ color: '#00c4cc', background: 'none', border: 'none', cursor: 'pointer' }}>Try Again</button>
      </div>
    );
  }

  const matchColor = data.overall_match_percent >= 70 ? '#10b981' : data.overall_match_percent >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-5 animate-fp-in">
      {/* Overall Match */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Overall Match</h3>
          <span className="text-3xl font-black" style={{ color: matchColor, fontFamily: 'Geist, sans-serif' }}>
            {data.overall_match_percent}%
          </span>
        </div>
        <div className="w-full rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${data.overall_match_percent}%`, background: matchColor }}
          />
        </div>
        <p className="text-sm mt-4 leading-relaxed" style={{ color: '#94a3b8' }}>{data.verdict}</p>
        {data.weeks_to_ready > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="material-icons" style={{ fontSize: '14px', color: '#f59e0b' }}>schedule</span>
            <span className="text-xs" style={{ color: '#64748b' }}>
              Estimated <strong style={{ color: '#f59e0b' }}>{data.weeks_to_ready} weeks</strong> to be interview-ready
            </span>
          </div>
        )}
      </div>

      {/* Strengths */}
      {data.strengths?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>
            ✅ Your Strengths
          </h3>
          <div className="space-y-2">
            {data.strengths.map((s: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <span className="material-icons mt-0.5 flex-shrink-0" style={{ fontSize: '14px', color: '#10b981' }}>check_circle</span>
                <div>
                  <span className="text-xs font-semibold" style={{ color: '#f1f5f9' }}>{s.skill}</span>
                  <span className="text-xs ml-2" style={{ color: '#64748b' }}>— {s.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gaps */}
      {data.gaps?.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#f59e0b' }}>
            ⚠️ Skills to Develop
          </h3>
          <div className="space-y-3">
            {data.gaps.map((g: any, i: number) => (
              <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0"
                    style={{
                      background: `${priorityColor[g.priority] || '#94a3b8'}15`,
                      color: priorityColor[g.priority] || '#94a3b8',
                      border: `1px solid ${priorityColor[g.priority] || '#94a3b8'}30`,
                    }}>
                    {g.priority}
                  </span>
                  <span className="text-xs font-semibold truncate" style={{ color: '#f1f5f9' }}>{g.skill}</span>
                  {g.estimated_weeks > 0 && (
                    <span className="text-xs flex-shrink-0" style={{ color: '#334155' }}>~{g.estimated_weeks}w</span>
                  )}
                </div>
                <Link
                  href={g.action === 'Simulate'
                    ? `/simulation?career=${encodeURIComponent(data.career_title)}`
                    : `/learning?career=${encodeURIComponent(data.career_title)}`}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0"
                  style={{ background: 'rgba(0,196,204,0.1)', color: '#00c4cc', border: '1px solid rgba(0,196,204,0.2)' }}
                >
                  <span className="material-icons" style={{ fontSize: '12px' }}>{actionIcon[g.action] || 'arrow_forward'}</span>
                  {g.action}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Next */}
      {data.recommended_next && (
        <Link
          href={data.recommended_next === 'simulation' ? '/simulation' : data.recommended_next === 'pathway' ? '/learning' : '/skill-gap'}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg, rgba(0,196,204,0.15), rgba(79,70,229,0.15))', border: '1px solid rgba(0,196,204,0.25)', color: '#00c4cc', cursor: 'pointer' }}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>rocket_launch</span>
          {data.recommended_next === 'simulation'
            ? `Start ${data.career_title} Simulation →`
            : data.recommended_next === 'pathway'
            ? 'Generate Learning Pathway →'
            : 'Run Full Skill Gap Analysis →'}
        </Link>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CareerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<'overview' | 'comparison'>('overview');

  const { data: career, isLoading, isError } = useQuery({
    queryKey: ['career', id],
    queryFn: () => careerService.getCareerDetails(id),
    staleTime: 10 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton rounded-xl h-24" />
        ))}
      </div>
    );
  }

  if (isError || !career) {
    return (
      <div className="p-8 text-center">
        <span className="material-icons text-5xl mb-4" style={{ color: '#ef4444' }}>error_outline</span>
        <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>Career Not Found</h2>
        <Link href="/careers" className="text-sm" style={{ color: '#00c4cc' }}>← Back to Career Explorer</Link>
      </div>
    );
  }

  const icon = getIcon(career.title);
  const salary = career.avg_salary ? `$${Number(career.avg_salary).toLocaleString()}` : 'Market rate';
  const skills: string[] = Array.isArray(career.required_skills) ? career.required_skills : [];

  return (
    <div className="p-6 md:p-8" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '900px' }}>
      {/* Breadcrumb */}
      <Link href="/careers" className="flex items-center gap-1 text-xs mb-6 hover:opacity-80 transition-opacity w-fit"
        style={{ color: '#475569', cursor: 'pointer' }}>
        <span className="material-icons" style={{ fontSize: '14px' }}>arrow_back</span>
        Career Explorer
      </Link>

      {/* Hero Section */}
      <div className="glass-card p-6 mb-5 animate-fp-in">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,196,204,0.2), rgba(79,70,229,0.2))', border: '1px solid rgba(0,196,204,0.2)' }}>
            <span className="material-icons" style={{ fontSize: '26px', color: '#00c4cc' }}>{icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(0,196,204,0.1)', color: '#00c4cc', border: '1px solid rgba(0,196,204,0.2)' }}>
                Career Path
              </span>
            </div>
            <h1 className="text-xl font-black mb-2" style={{ color: '#f1f5f9', fontFamily: 'Geist, sans-serif', letterSpacing: '-0.02em' }}>
              {career.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="material-icons" style={{ fontSize: '14px', color: '#10b981' }}>payments</span>
                <span className="text-sm font-semibold" style={{ color: '#10b981' }}>{salary}/yr avg</span>
              </div>
              {career.growth_outlook && (
                <div className="flex items-center gap-1.5">
                  <span className="material-icons" style={{ fontSize: '14px', color: '#3b82f6' }}>trending_up</span>
                  <span className="text-sm" style={{ color: '#3b82f6' }}>{career.growth_outlook}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="material-icons" style={{ fontSize: '14px', color: '#8b5cf6' }}>code</span>
                <span className="text-sm" style={{ color: '#8b5cf6' }}>{skills.length} key skills</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setActiveTab('comparison')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00c4cc, #4f46e5)', color: '#fff', cursor: 'pointer', border: 'none' }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>auto_awesome</span>
            Analyze My Fit
          </button>
          <Link href={`/simulation?career=${encodeURIComponent(career.title)}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(79,70,229,0.15)', color: '#818cf8', border: '1px solid rgba(79,70,229,0.3)', cursor: 'pointer' }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>model_training</span>
            Start Simulation
          </Link>
          <Link href={`/learning?career=${encodeURIComponent(career.title)}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
          >
            <span className="material-icons" style={{ fontSize: '16px' }}>route</span>
            Learning Pathway
          </Link>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {(['overview', 'comparison'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="px-5 py-2 rounded-lg text-xs font-semibold capitalize transition-all"
            style={{
              background: activeTab === t ? 'rgba(0,196,204,0.12)' : 'transparent',
              color: activeTab === t ? '#00c4cc' : '#475569',
              border: activeTab === t ? '1px solid rgba(0,196,204,0.2)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            {t === 'comparison' ? '🤖 AI Skill Comparison' : '📋 Overview'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-fp-in">
          {/* About */}
          {career.description && (
            <div className="glass-card p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#475569' }}>About This Role</h2>
              <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{career.description}</p>
            </div>
          )}

          {/* Skills + Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Required Skills */}
            <div className="glass-card p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#475569' }}>
                Required Skills
              </h2>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span key={skill} className="text-xs px-3 py-1.5 rounded-full font-medium"
                      style={{
                        background: i < 3 ? 'rgba(0,196,204,0.12)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${i < 3 ? 'rgba(0,196,204,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        color: i < 3 ? '#00c4cc' : '#94a3b8',
                      }}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs" style={{ color: '#475569' }}>No skills listed yet.</p>
              )}
            </div>

            {/* Career Stats */}
            <div className="glass-card p-6">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#475569' }}>
                Career Stats
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-icons" style={{ fontSize: '14px', color: '#10b981' }}>payments</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>Average Salary</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#10b981', fontFamily: 'Geist, sans-serif' }}>{salary}</span>
                </div>
                {career.growth_outlook && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-icons" style={{ fontSize: '14px', color: '#3b82f6' }}>trending_up</span>
                      <span className="text-xs" style={{ color: '#64748b' }}>Growth Outlook</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: '#3b82f6', fontFamily: 'Geist, sans-serif' }}>{career.growth_outlook}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-icons" style={{ fontSize: '14px', color: '#8b5cf6' }}>code</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>Skills Required</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#8b5cf6', fontFamily: 'Geist, sans-serif' }}>{skills.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-icons" style={{ fontSize: '14px', color: '#f59e0b' }}>school</span>
                    <span className="text-xs" style={{ color: '#64748b' }}>Demand Level</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: '#f59e0b', fontFamily: 'Geist, sans-serif' }}>High</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advisor CTA */}
          <div className="glass-card p-5 flex items-center justify-between gap-4"
            style={{ background: 'linear-gradient(135deg, rgba(0,196,204,0.05), rgba(79,70,229,0.05))', border: '1px solid rgba(0,196,204,0.15)' }}>
            <div className="flex items-center gap-3">
              <span className="material-icons" style={{ fontSize: '22px', color: '#00c4cc' }}>smart_toy</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>Ask your AI Advisor</p>
                <p className="text-xs" style={{ color: '#475569' }}>Get personalized guidance about this career path</p>
              </div>
            </div>
            <Link href="/advisor"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold flex-shrink-0"
              style={{ background: 'rgba(0,196,204,0.12)', color: '#00c4cc', border: '1px solid rgba(0,196,204,0.2)', cursor: 'pointer' }}
            >
              Open Advisor
              <span className="material-icons" style={{ fontSize: '14px' }}>arrow_forward</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── COMPARISON TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'comparison' && (
        <SkillComparisonPanel careerId={id} careerTitle={career.title} />
      )}
    </div>
  );
}
