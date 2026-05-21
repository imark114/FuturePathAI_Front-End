'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { learningService } from '@/services/learning';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LearningStep {
  id: number;
  week_number: number;
  title: string;
  description: string;
  skill_targeted: string;
  resource_type: string;
  resource_title: string;
  resource_url: string;
  estimated_hours: number;
  completed: boolean;
}

interface LearningPath {
  id: number;
  target_role: string;
  title: string;
  overview: string;
  estimated_weeks: number;
  status: string;
  progress_percent: number;
  steps: LearningStep[];
  created_at: string;
}

// ── Resource type metadata ────────────────────────────────────────────────────
const resourceMeta: Record<string, { icon: string; color: string; label: string }> = {
  course:        { icon: 'school',         color: '#3b82f6', label: 'Course' },
  project:       { icon: 'build',          color: '#10b981', label: 'Project' },
  book:          { icon: 'menu_book',      color: '#8b5cf6', label: 'Book' },
  simulation:    { icon: 'model_training', color: '#f59e0b', label: 'Simulation' },
  article:       { icon: 'article',        color: '#00c4cc', label: 'Article' },
  certification: { icon: 'verified',       color: '#ef4444', label: 'Certification' },
};

// ── Step Card ─────────────────────────────────────────────────────────────────
function StepCard({ step, onToggle }: { step: LearningStep; onToggle: (id: number) => void }) {
  const meta = resourceMeta[step.resource_type] || resourceMeta.course;

  return (
    <div
      className="glass-card p-5 transition-all"
      style={{
        border: step.completed ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)',
        opacity: step.completed ? 0.75 : 1,
      }}
    >
      <div className="flex items-start gap-4">
        {/* Week badge */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black"
            style={{ background: step.completed ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.1)', color: step.completed ? '#10b981' : '#3b82f6' }}>
            {step.week_number}
          </div>
          <span className="text-xs" style={{ color: '#334155' }}>wk</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: `${meta.color}15`, color: meta.color, border: `1px solid ${meta.color}25` }}>
              <span className="material-icons align-middle mr-1" style={{ fontSize: '11px' }}>{meta.icon}</span>
              {meta.label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#475569' }}>
              {step.skill_targeted}
            </span>
            <span className="text-xs ml-auto" style={{ color: '#334155' }}>
              ~{step.estimated_hours}h
            </span>
          </div>

          <h3 className="text-sm font-semibold mb-1" style={{ color: step.completed ? '#64748b' : '#f1f5f9' }}>
            {step.completed && <span className="material-icons align-middle mr-1 text-sm" style={{ color: '#10b981' }}>check_circle</span>}
            {step.title}
          </h3>
          <p className="text-xs leading-relaxed mb-3" style={{ color: '#64748b' }}>{step.description}</p>

          {step.resource_title && (
            <div className="flex items-center gap-2">
              <span className="material-icons" style={{ fontSize: '14px', color: meta.color }}>{meta.icon}</span>
              {step.resource_url ? (
                <a href={step.resource_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs font-medium" style={{ color: meta.color }}>
                  {step.resource_title} ↗
                </a>
              ) : (
                <span className="text-xs font-medium" style={{ color: '#64748b' }}>{step.resource_title}</span>
              )}
            </div>
          )}
        </div>

        {/* Complete toggle */}
        <button
          onClick={() => onToggle(step.id)}
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
          style={{
            background: step.completed ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
            border: step.completed ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer',
            color: step.completed ? '#10b981' : '#475569',
          }}
          title={step.completed ? 'Mark incomplete' : 'Mark complete'}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>
            {step.completed ? 'check_circle' : 'radio_button_unchecked'}
          </span>
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function LearningPage() {
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  const { data: paths = [], isLoading, isError } = useQuery({
    queryKey: ['learningPaths'],
    queryFn: learningService.getPaths,
  });

  const activePath: LearningPath | undefined = (paths as LearningPath[]).find(p => p.status === 'active')
    || (paths as LearningPath[])[0];

  const generateMutation = useMutation({
    mutationFn: learningService.generatePath,
    onMutate: () => { setGenerating(true); setGenError(''); },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['learningPaths'] });
      setGenerating(false);
    },
    onError: (e: any) => {
      setGenError(e?.response?.data?.error || 'Generation failed. Please try again.');
      setGenerating(false);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: learningService.completeStep,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['learningPaths'] }),
  });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-3" style={{ color: '#64748b' }}>
        <span className="material-icons animate-spin" style={{ fontSize: '20px', color: '#3b82f6' }}>autorenew</span>
        Loading your learning pathway...
      </div>
    );
  }

  // ── No path yet ────────────────────────────────────────────────────────────
  if (!activePath) {
    return (
      <div className="p-8 max-w-2xl" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#8b5cf6' }}>Adaptive Learning</p>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>Learning Pathway</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Your AI-generated, week-by-week plan to reach your target role.
          </p>
        </div>

        <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(139,92,246,0.1)' }}>
            <span className="material-icons" style={{ fontSize: '28px', color: '#8b5cf6' }}>route</span>
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>No Learning Pathway Yet</h2>
          <p className="text-sm mb-2 leading-relaxed" style={{ color: '#64748b' }}>
            Generate your personalized AI-powered pathway based on your profile, skills, and target role.
            Gemini will create a week-by-week plan with specific resources.
          </p>
          <p className="text-xs mb-6" style={{ color: '#475569' }}>
            Make sure you've set your <Link href="/settings" style={{ color: '#8b5cf6' }}>target role in Settings</Link> first.
          </p>

          {genError && (
            <div className="mb-4 p-3 rounded-lg text-xs text-left" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
              {genError}
            </div>
          )}

          <button
            onClick={() => generateMutation.mutate()}
            disabled={generating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: '#8b5cf6', color: '#fff', border: 'none', cursor: generating ? 'wait' : 'pointer', opacity: generating ? 0.7 : 1 }}
          >
            {generating ? (
              <>
                <span className="material-icons animate-spin" style={{ fontSize: '18px' }}>autorenew</span>
                Gemini is generating your plan...
              </>
            ) : (
              <>
                <span className="material-icons" style={{ fontSize: '18px' }}>auto_awesome</span>
                Generate My Learning Pathway
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Active Path View ───────────────────────────────────────────────────────
  const completedSteps = activePath.steps.filter(s => s.completed).length;
  const totalHours = activePath.steps.reduce((sum, s) => sum + (s.estimated_hours || 0), 0);
  const doneHours = activePath.steps.filter(s => s.completed).reduce((sum, s) => sum + (s.estimated_hours || 0), 0);
  const progressColor = activePath.progress_percent >= 70 ? '#10b981' : activePath.progress_percent >= 40 ? '#3b82f6' : '#8b5cf6';

  return (
    <div className="p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#8b5cf6' }}>Adaptive Learning</p>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>{activePath.title}</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>{activePath.overview}</p>
        </div>
        <button
          onClick={() => { if (confirm('Generate a fresh pathway? The current one will be archived.')) generateMutation.mutate(); }}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer' }}
        >
          <span className="material-icons" style={{ fontSize: '14px' }}>refresh</span>
          {generating ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Progress', value: `${activePath.progress_percent}%`, icon: 'donut_large', color: progressColor },
          { label: 'Steps Done', value: `${completedSteps}/${activePath.steps.length}`, icon: 'check_circle', color: '#10b981' },
          { label: 'Hours Done', value: `${Math.round(doneHours)}h`, icon: 'schedule', color: '#3b82f6' },
          { label: 'Total Weeks', value: `${activePath.estimated_weeks}w`, icon: 'calendar_today', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}18` }}>
              <span className="material-icons" style={{ fontSize: '18px', color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#475569' }}>{s.label}</p>
              <p className="text-xl font-black" style={{ color: s.color, lineHeight: 1.1 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>
            Overall Progress — <span style={{ color: '#f1f5f9' }}>{activePath.target_role}</span>
          </span>
          <span className="text-sm font-bold" style={{ color: progressColor }}>{activePath.progress_percent}%</span>
        </div>
        <div className="h-2.5 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${activePath.progress_percent}%`, background: `linear-gradient(90deg, #8b5cf6, ${progressColor})` }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: '#475569' }}>
          {Math.round(doneHours)}h of ~{Math.round(totalHours)}h completed · {activePath.steps.length - completedSteps} steps remaining
        </p>
      </div>

      {/* Steps List */}
      <h2 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#94a3b8' }}>
        <span className="material-icons" style={{ fontSize: '16px', color: '#8b5cf6' }}>route</span>
        Week-by-Week Plan
      </h2>
      <div className="space-y-3">
        {activePath.steps.map(step => (
          <StepCard
            key={step.id}
            step={step}
            onToggle={(id) => toggleMutation.mutate(id)}
          />
        ))}
      </div>

      {/* Completed */}
      {activePath.progress_percent === 100 && (
        <div className="mt-8 glass-card p-8 text-center" style={{ border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.03)' }}>
          <span className="material-icons text-4xl mb-3" style={{ color: '#10b981', fontSize: '48px' }}>emoji_events</span>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#f1f5f9' }}>Pathway Complete! 🎉</h2>
          <p className="text-sm mb-5" style={{ color: '#64748b' }}>
            You've completed all steps. Run a simulation or ask the AI Advisor for your next challenge.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/simulation" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#3b82f6', color: '#fff' }}>
              <span className="material-icons" style={{ fontSize: '16px' }}>model_training</span>
              Run Simulation
            </Link>
            <button onClick={() => generateMutation.mutate()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', border: '1px solid rgba(139,92,246,0.2)', cursor: 'pointer' }}>
              <span className="material-icons" style={{ fontSize: '16px' }}>auto_awesome</span>
              Generate Next Pathway
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
