'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

interface SkillGap {
  title: string;
  description: string;
  current_percent: number;
  target_percent: number;
  priority: 'Critical' | 'High' | 'Medium';
}
interface SkillGapAnalysis {
  role_alignment_percent: number;
  estimated_weeks: number;
  gaps: SkillGap[];
  strategic_insight: string;
}

const CACHE_KEY = 'fp_skill_gap_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function loadCache(): SkillGapAnalysis | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) { localStorage.removeItem(CACHE_KEY); return null; }
    return data;
  } catch { return null; }
}
function saveCache(data: SkillGapAnalysis) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

const priorityMeta = {
  Critical: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', barColor: '#ef4444' },
  High:     { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', barColor: '#f59e0b' },
  Medium:   { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6', barColor: '#3b82f6' },
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'current_percent' ? 'Current' : 'Target'}: {p.value}%
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}>
      {payload[0].name}: <span style={{ color: payload[0].payload.fill }}>{payload[0].value} gaps</span>
    </div>
  );
};

export default function SkillGapPage() {
  const router = useRouter();
  const [data, setData] = useState<SkillGapAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  // Load from cache on mount — do NOT auto-fetch
  useEffect(() => {
    const cached = loadCache();
    if (cached) {
      setData(cached);
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) setLastAnalyzed(new Date(JSON.parse(raw).ts));
      } catch {}
    }
  }, []);

  const analyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/skill-gap/');
      setData(res.data);
      saveCache(res.data);
      setLastAnalyzed(new Date());
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load analysis.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStudy = (gap: SkillGap) => {
    const topic = encodeURIComponent(gap.title);
    router.push(`/advisor?study=${topic}`);
  };

  const handleSimulation = (gap: SkillGap) =>
    router.push(`/simulation?skill=${encodeURIComponent(gap.title)}`);
  const handleLearn = () => router.push('/learning');

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full gap-4" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#8b5cf6' }} />
        <p className="text-sm font-medium" style={{ color: '#64748b' }}>Gemini is analyzing your skill gaps…</p>
        <p className="text-xs" style={{ color: '#334155' }}>This may take 10–20 seconds</p>
      </div>
    );
  }

  // ── No data yet ────────────────────────────────────────────────────────────
  if (!data && !error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="glass-card p-10 text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(139,92,246,0.1)' }}>
            <span className="material-icons" style={{ fontSize: '32px', color: '#8b5cf6' }}>analytics</span>
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>No Analysis Yet</h2>
          <p className="text-sm mb-6 leading-relaxed" style={{ color: '#64748b' }}>
            Run a Gemini-powered skill gap analysis to see exactly where you stand
            against your target role and what to focus on.
          </p>
          <button onClick={analyze} className="btn-primary mx-auto">
            <span className="material-icons" style={{ fontSize: '18px' }}>auto_awesome</span>
            Analyze My Skill Gaps
          </button>
          <p className="text-xs mt-4" style={{ color: '#334155' }}>
            Results are cached for 24 hours — no repeated charges.
          </p>
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    const needsProfile = error.includes('target role') || error.includes('profile');
    return (
      <div className="p-8 max-w-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <span className="material-icons" style={{ fontSize: '40px', color: '#ef4444' }}>error_outline</span>
          <h2 className="font-semibold mt-3 mb-2" style={{ color: '#f1f5f9' }}>Analysis Unavailable</h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>{error}</p>
          {needsProfile ? (
            <Link href="/settings" className="btn-primary inline-flex">
              <span className="material-icons" style={{ fontSize: '16px' }}>settings</span>
              Update Profile
            </Link>
          ) : (
            <button onClick={analyze} className="btn-primary">
              <span className="material-icons" style={{ fontSize: '16px' }}>refresh</span>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  const gaps = data!.gaps;
  const criticalCount = gaps.filter(g => g.priority === 'Critical').length;
  const highCount = gaps.filter(g => g.priority === 'High').length;
  const mediumCount = gaps.filter(g => g.priority === 'Medium').length;
  const alignment = data!.role_alignment_percent;
  const alignColor = alignment >= 70 ? '#10b981' : alignment >= 40 ? '#3b82f6' : '#f59e0b';

  const radarData = gaps.slice(0, 6).map(g => ({
    subject: g.title.length > 14 ? g.title.slice(0, 14) + '…' : g.title,
    current: g.current_percent, target: g.target_percent,
  }));
  const barData = gaps.slice(0, 6).map(g => ({
    name: g.title.length > 16 ? g.title.slice(0, 16) + '…' : g.title,
    current_percent: g.current_percent, target_percent: g.target_percent, priority: g.priority,
  }));
  const pieData = [
    { name: 'Critical', value: criticalCount, fill: '#ef4444' },
    { name: 'High', value: highCount, fill: '#f59e0b' },
    { name: 'Medium', value: mediumCount, fill: '#3b82f6' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-8 space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#8b5cf6' }}>AI Analysis</p>
          <h1 className="text-2xl font-bold" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>Skill Gap Analysis</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            Powered by Gemini 2.5 Flash
            {lastAnalyzed && (
              <span style={{ color: '#334155' }}> · Last analyzed {lastAnalyzed.toLocaleDateString()} {lastAnalyzed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </p>
        </div>
        <button
          onClick={analyze}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer' }}
        >
          <span className="material-icons" style={{ fontSize: '14px' }}>refresh</span>
          Re-analyze
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Role Alignment', value: `${alignment}%`, icon: 'adjust', color: alignColor },
          { label: 'Est. Time to 80%', value: `~${data!.estimated_weeks}w`, icon: 'schedule', color: '#8b5cf6' },
          { label: 'Critical Gaps', value: criticalCount, icon: 'error', color: '#ef4444' },
          { label: 'Total Gaps', value: gaps.length, icon: 'analytics', color: '#3b82f6' },
        ].map(k => (
          <div key={k.label} className="glass-card p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${k.color}22` }}>
              <span className="material-icons" style={{ fontSize: '18px', color: k.color }}>{k.icon}</span>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#475569' }}>{k.label}</p>
              <p className="text-xl font-black" style={{ color: k.color, lineHeight: 1.1 }}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alignment bar */}
      <div className="glass-card p-6" style={{ border: `1px solid ${alignColor}22` }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Overall Role Alignment</h3>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              You are <span style={{ color: alignColor, fontWeight: 600 }}>{alignment}%</span> aligned. Est.{' '}
              <span style={{ color: '#8b5cf6', fontWeight: 600 }}>~{data!.estimated_weeks} weeks</span> to reach 80%+ readiness.
            </p>
          </div>
          <span className="text-3xl font-black" style={{ color: alignColor }}>{alignment}%</span>
        </div>
        <div className="relative h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="absolute top-0 h-full w-0.5 z-10" style={{ left: '80%', background: 'rgba(255,255,255,0.2)' }} />
          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${alignment}%`, background: `linear-gradient(90deg, ${alignColor}, #8b5cf6)` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs" style={{ color: '#334155' }}>0%</span>
          <span className="text-xs" style={{ color: '#475569' }}>Target: 80%</span>
          <span className="text-xs" style={{ color: '#334155' }}>100%</span>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 md:col-span-2">
          <h3 className="text-sm font-semibold mb-1" style={{ color: '#94a3b8' }}>Current vs Target — Radar View</h3>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>Skill proficiency across all gap areas</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
              <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Target" dataKey="target" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 2" />
              <Legend iconType="line" iconSize={12} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6 flex flex-col">
          <h3 className="text-sm font-semibold mb-1" style={{ color: '#94a3b8' }}>Gap Distribution</h3>
          <p className="text-xs mb-4" style={{ color: '#475569' }}>By priority level</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} opacity={0.85} />)}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
                  <span style={{ color: '#64748b' }}>{p.name}</span>
                </div>
                <span className="font-semibold" style={{ color: p.fill }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold mb-1" style={{ color: '#94a3b8' }}>Skill Proficiency — Current vs Required</h3>
        <p className="text-xs mb-5" style={{ color: '#475569' }}>Comparison of your current level against role requirements</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="current_percent" name="current_percent" radius={[4, 4, 0, 0]} maxBarSize={20}>
              {barData.map((entry, i) => <Cell key={i} fill={priorityMeta[entry.priority as keyof typeof priorityMeta].barColor} opacity={0.8} />)}
            </Bar>
            <Bar dataKey="target_percent" name="target_percent" radius={[4, 4, 0, 0]} fill="rgba(255,255,255,0.08)" maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Prioritized Gap Cards ─────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#94a3b8' }}>
          <span className="material-icons" style={{ fontSize: '16px', color: '#ef4444' }}>priority_high</span>
          Prioritized Skill Gaps — Action Required
        </h2>
        <div className="space-y-3">
          {gaps.map((gap, idx) => {
            const meta = priorityMeta[gap.priority] || priorityMeta.Medium;
            const delta = gap.target_percent - gap.current_percent;
            return (
              <div key={gap.title} className="glass-card p-5" style={{ border: `1px solid ${meta.color}18` }}>
                <div className="flex items-start gap-4">
                  {/* Index badge */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black"
                    style={{ background: meta.bg, color: meta.color }}>
                    {idx + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bg, color: meta.color }}>
                        {gap.priority}
                      </span>
                      <h3 className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{gap.title}</h3>
                      <span className="ml-auto text-xs font-bold" style={{ color: meta.color }}>+{delta}% needed</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: '#64748b' }}>{gap.description}</p>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: '#475569' }}>Current: <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{gap.current_percent}%</span></span>
                        <span style={{ color: '#475569' }}>Required: <span style={{ color: meta.color, fontWeight: 600 }}>{gap.target_percent}%</span></span>
                      </div>
                      <div className="relative h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="absolute h-full rounded-full" style={{ width: `${gap.target_percent}%`, background: `${meta.color}18` }} />
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${gap.current_percent}%`, background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99)` }} />
                      </div>
                    </div>
                  </div>

                  {/* ── Single Action Button based on priority ── */}
                  <div className="flex-shrink-0">
                    {gap.priority === 'Critical' && (
                      <button
                        onClick={() => handleStudy(gap)}
                        title={`AI Advisor will teach you ${gap.title}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: 'rgba(0,196,204,0.12)', color: '#00c4cc', border: '1px solid rgba(0,196,204,0.3)', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        <span className="material-icons" style={{ fontSize: '14px' }}>menu_book</span>
                        Study
                      </button>
                    )}
                    {gap.priority === 'High' && (
                      <button
                        onClick={() => handleSimulation(gap)}
                        title={`Start a simulation focused on ${gap.title}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        <span className="material-icons" style={{ fontSize: '14px' }}>science</span>
                        Simulation
                      </button>
                    )}
                    {gap.priority === 'Medium' && (
                      <button
                        onClick={handleLearn}
                        title="Generate a learning pathway"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.3)', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                      >
                        <span className="material-icons" style={{ fontSize: '14px' }}>route</span>
                        Learn
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insight */}
      <div className="glass-card p-6" style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(139,92,246,0.15)' }}>
            <span className="material-icons" style={{ fontSize: '20px', color: '#8b5cf6' }}>tips_and_updates</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>AI Strategic Insight</h3>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6' }}>Gemini 2.5 Flash</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{data!.strategic_insight}</p>
          </div>
          <Link href="/advisor"
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
            style={{ background: '#8b5cf6', color: '#fff' }}>
            <span className="material-icons" style={{ fontSize: '13px' }}>smart_toy</span>
            Ask AI
          </Link>
        </div>
      </div>
    </div>
  );
}
