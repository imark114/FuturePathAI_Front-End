'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';

interface SimulationData {
  id: number;
  career_title: string;
  scenario_context: string;
  status: string;
  final_score: number | null;
}

interface EvaluationResult {
  score: number;
  technical_feedback: string;
  communication_feedback: string;
  improvement: string;
}

async function fetchCareers() {
  const response = await api.get('/careers/');
  return response.data.results || response.data;
}

async function fetchSimulations(): Promise<SimulationData[]> {
  const response = await api.get('/simulation/');
  return response.data.results || response.data;
}

export default function SimulationPage() {
  const searchParams = useSearchParams();
  const skillParam = searchParams.get('skill'); // e.g. ?skill=Version+Control+Systems
  const careerParam = searchParams.get('career'); // e.g. ?career=Full+Stack+Developer
  const autoStartedRef = useRef(false);

  const queryClient = useQueryClient();
  const [activeSimulation, setActiveSimulation] = useState<SimulationData | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [autoStartNotice, setAutoStartNotice] = useState<string | null>(null);
  const [careerPromptDismissed, setCareerPromptDismissed] = useState(false);

  const { data: careers = [] } = useQuery({ queryKey: ['careers'], queryFn: fetchCareers });
  const { data: pastSimulations = [] } = useQuery({ queryKey: ['simulations'], queryFn: fetchSimulations });

  const startMutation = useMutation({
    mutationFn: (careerId: number) => api.post('/simulation/', { career_id: careerId }).then(r => r.data),
    onSuccess: (sim: SimulationData) => {
      setActiveSimulation(sim);
      setUserResponse('');
      setEvaluation(null);
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    }
  });

  const submitMutation = useMutation({
    mutationFn: () => api.post(`/simulation/${activeSimulation!.id}/submit/`, { response: userResponse }).then(r => r.data),
    onSuccess: (data) => {
      setActiveSimulation(data.simulation);
      setEvaluation(data.evaluation);
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
    }
  });

  // Auto-start: when ?skill= is present, find the best matching career and start immediately
  useEffect(() => {
    if (!skillParam || autoStartedRef.current || careers.length === 0 || startMutation.isPending) return;

    const skill = decodeURIComponent(skillParam).toLowerCase();

    // Try to find a career whose required_skills or title overlap with the skill keyword
    let bestMatch = careers.find((c: any) =>
      (c.required_skills || []).some((s: string) => s.toLowerCase().includes(skill) || skill.includes(s.toLowerCase()))
    );

    // Fall back: match career title contains any word from skill name
    if (!bestMatch) {
      const words = skill.split(/[\s/()]+/).filter(w => w.length > 3);
      bestMatch = careers.find((c: any) =>
        words.some(w => c.title.toLowerCase().includes(w))
      );
    }

    // Last resort: just use the first career
    const targetCareer = bestMatch || careers[0];

    if (targetCareer) {
      autoStartedRef.current = true;
      setAutoStartNotice(`Auto-starting simulation for "${targetCareer.title}" to help you practice "${decodeURIComponent(skillParam)}"`);
      startMutation.mutate(targetCareer.id);
    }
  }, [skillParam, careers, startMutation]);

  // ── Scenario chooser screen ────────────────────────────────────────────────
  if (!activeSimulation) {
    return (
      <div className="p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#00c4cc' }}>Practice</p>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Workforce Simulation</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Real-world scenarios powered by Gemini AI — make decisions under pressure.</p>
        </div>

        {/* Career-specific prompt banner — from career detail page */}
        {careerParam && !careerPromptDismissed && !startMutation.isPending && (
          <div
            className="mb-6 rounded-2xl p-5 animate-fp-in"
            style={{
              background: 'linear-gradient(135deg, rgba(79,70,229,0.12), rgba(0,196,204,0.08))',
              border: '1px solid rgba(79,70,229,0.3)',
            }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(79,70,229,0.15)' }}>
                <span className="material-icons" style={{ fontSize: '20px', color: '#818cf8' }}>model_training</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#818cf8' }}>
                  Career Simulation
                </p>
                <p className="text-sm font-semibold mb-1" style={{ color: '#f1f5f9' }}>
                  Start a simulation for <span style={{ color: '#818cf8' }}>{decodeURIComponent(careerParam)}</span>?
                </p>
                <p className="text-xs" style={{ color: '#475569' }}>
                  Gemini will generate a real-world workplace scenario specifically for this career path.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => {
                  const decoded = decodeURIComponent(careerParam);
                  const match = (careers as any[]).find((c: any) =>
                    c.title.toLowerCase() === decoded.toLowerCase() ||
                    c.title.toLowerCase().includes(decoded.toLowerCase())
                  ) || (careers as any[])[0];
                  if (match) startMutation.mutate(match.id);
                  setCareerPromptDismissed(true);
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <span className="material-icons" style={{ fontSize: '15px' }}>play_arrow</span>
                Yes, start simulation
              </button>
              <button
                onClick={() => setCareerPromptDismissed(true)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
              >
                No, let me choose
              </button>
            </div>
          </div>
        )}

        {/* Auto-start notice (skill-based) */}
        {skillParam && autoStartNotice && (
          <div className="mb-5 glass-card px-5 py-3 flex items-center gap-3" style={{ border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="material-icons flex-shrink-0" style={{ color: '#f59e0b', fontSize: '18px' }}>info</span>
            <p className="text-sm" style={{ color: '#94a3b8' }}>{autoStartNotice}</p>
          </div>
        )}

        {startMutation.isPending ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#00c4cc' }} />
            <p className="text-sm" style={{ color: '#64748b' }}>Gemini is generating your scenario…</p>
            {skillParam && (
              <p className="text-xs" style={{ color: '#475569' }}>
                Creating a scenario to help you practice <span style={{ color: '#f59e0b', fontWeight: 600 }}>{decodeURIComponent(skillParam)}</span>
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Career cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              {careers.length === 0 ? (
                <div className="glass-card p-6 col-span-2 text-center">
                  <p className="text-sm" style={{ color: '#64748b' }}>No career tracks available. Please check back later.</p>
                </div>
              ) : (
                careers.slice(0, 4).map((career: any) => (
                  <div key={career.id} className="glass-card p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,196,204,0.1)' }}>
                        <span className="material-icons" style={{ color: '#00c4cc', fontSize: '22px' }}>work</span>
                      </div>
                      <div>
                        <h3 className="text-base font-semibold" style={{ color: '#f1f5f9' }}>{career.title}</h3>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,196,204,0.1)', color: '#00c4cc' }}>AI Generated</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748b' }}>~15 min</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm mb-5" style={{ color: '#64748b' }}>{career.description || 'Face real workplace challenges and get evaluated by Gemini AI.'}</p>
                    <button
                      onClick={() => startMutation.mutate(career.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background: '#00c4cc', color: '#0a0f1e' }}
                    >
                      <span className="material-icons" style={{ fontSize: '16px' }}>play_arrow</span>
                      Start Simulation
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Past simulations */}
            {pastSimulations.length > 0 && (
              <>
                <h2 className="text-sm font-semibold mb-4" style={{ color: '#94a3b8' }}>Past Simulations</h2>
                <div className="space-y-3">
                  {pastSimulations.map((sim: SimulationData) => (
                    <div key={sim.id} className="glass-card p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>{sim.career_title}</p>
                        <p className="text-xs" style={{ color: '#475569' }}>Status: {sim.status}</p>
                      </div>
                      {sim.final_score !== null && (
                        <span className="text-lg font-bold" style={{ color: sim.final_score >= 75 ? '#10b981' : '#f59e0b' }}>
                          {sim.final_score}/100
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    );
  }

  // ── Active simulation or results view ─────────────────────────────────────
  return (
    <div className="p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#00c4cc' }}>Live Scenario</p>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Workforce Simulation</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>{activeSimulation.career_title}</p>
        </div>
        <button
          onClick={() => { setActiveSimulation(null); setEvaluation(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="material-icons" style={{ fontSize: '14px' }}>arrow_back</span>
          Choose Different Scenario
        </button>
      </div>

      {/* Skill context banner (shown when arriving from Skill Gap) */}
      {skillParam && !evaluation && (
        <div className="mb-5 glass-card px-4 py-3 flex items-center gap-3" style={{ border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.04)' }}>
          <span className="material-icons flex-shrink-0" style={{ color: '#f59e0b', fontSize: '16px' }}>science</span>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            This simulation was started to help you practice{' '}
            <span style={{ color: '#f59e0b', fontWeight: 600 }}>{decodeURIComponent(skillParam)}</span>.
            Apply what you know about this skill in your response.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Scenario */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: evaluation ? '#10b981' : '#ef4444' }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: evaluation ? '#10b981' : '#ef4444' }}>
                {evaluation ? 'Completed' : 'Live Scenario'}
              </span>
            </div>
            <h3 className="text-base font-semibold mb-3" style={{ color: '#f1f5f9' }}>Your Challenge</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#94a3b8', whiteSpace: 'pre-line' }}>{activeSimulation.scenario_context}</p>
          </div>

          {/* Response or Evaluation */}
          {!evaluation ? (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>Your Response</h3>
              <textarea
                rows={6}
                value={userResponse}
                onChange={e => setUserResponse(e.target.value)}
                placeholder="Describe your approach to this challenge in detail. Be specific about the steps you would take, tools you'd use, and how you'd communicate with stakeholders..."
                className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,196,204,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending || !userResponse.trim()}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  style={{ background: '#00c4cc', color: '#0a0f1e' }}
                >
                  {submitMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-transparent animate-spin" style={{ borderTopColor: '#0a0f1e' }} />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <span className="material-icons" style={{ fontSize: '16px' }}>send</span>
                      Submit for AI Evaluation
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 space-y-4" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
              <h3 className="text-sm font-semibold" style={{ color: '#94a3b8' }}>AI Evaluation Results</h3>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Technical Reasoning</p>
                <p className="text-sm" style={{ color: '#c8d3e0' }}>{evaluation.technical_feedback}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Communication</p>
                <p className="text-sm" style={{ color: '#c8d3e0' }}>{evaluation.communication_feedback}</p>
              </div>
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Improvement Suggestion</p>
                <p className="text-sm" style={{ color: '#c8d3e0' }}>{evaluation.improvement}</p>
              </div>
              <button
                onClick={() => { setActiveSimulation(null); setEvaluation(null); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold mt-2"
                style={{ background: '#00c4cc', color: '#0a0f1e' }}
              >
                Try Another Simulation
              </button>
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="space-y-5">
          {evaluation ? (
            <div className="glass-card p-6" style={{ border: '1px solid rgba(16,185,129,0.2)', background: 'rgba(16,185,129,0.03)' }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: '#94a3b8' }}>Final Score</h3>
              <div className="flex flex-col items-center">
                <span className="text-6xl font-black" style={{ color: evaluation.score >= 75 ? '#10b981' : '#f59e0b', lineHeight: 1 }}>{evaluation.score}</span>
                <span className="text-sm mt-1" style={{ color: '#475569' }}>out of 100</span>
                <div className="w-full h-2 rounded-full mt-4" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${evaluation.score}%`, background: evaluation.score >= 75 ? '#10b981' : '#f59e0b' }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6" style={{ border: '1px solid rgba(0,196,204,0.15)', background: 'rgba(0,196,204,0.03)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-icons" style={{ fontSize: '18px', color: '#00c4cc' }}>neurology</span>
                <h3 className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Evaluation Criteria</h3>
              </div>
              <div className="space-y-3">
                {['Technical Reasoning', 'Communication Clarity', 'Problem Solving Approach'].map(c => (
                  <div key={c} className="flex items-center gap-2">
                    <span className="material-icons" style={{ fontSize: '14px', color: '#00c4cc' }}>check_circle</span>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold mb-4" style={{ color: '#94a3b8' }}>Tips for Success</h3>
            <div className="space-y-2">
              {['Be specific and detailed', 'Explain your reasoning', "Mention tools you'd use", 'Address stakeholder impact'].map(tip => (
                <div key={tip} className="flex items-start gap-2">
                  <span className="material-icons mt-0.5" style={{ fontSize: '14px', color: '#4f46e5' }}>lightbulb</span>
                  <span className="text-xs" style={{ color: '#64748b' }}>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
