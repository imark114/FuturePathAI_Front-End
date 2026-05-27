'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import ClientWrapper from '@/components/ClientWrapper';

/* ─── data ─────────────────────────────────────────────────────────────────── */
const features = [
  { icon: 'analytics', color: '#ef4444', title: 'Skill Gap Detection', desc: 'Gemini maps your current skills against real job requirements and returns a priority-ranked gap analysis with a realistic weeks-to-readiness timeline.' },
  { icon: 'route', color: '#8b5cf6', title: 'Adaptive Learning Pathways', desc: 'AI generates a personalised, week-by-week roadmap naming real courses, books, and projects — no generic advice.' },
  { icon: 'science', color: '#f59e0b', title: 'Workplace Simulations', desc: 'Gemini creates immersive crisis scenarios. You respond. Gemini evaluates and scores your technical reasoning and communication on a 0–100 scale.' },
  { icon: 'smart_toy', color: '#00c4cc', title: 'AI Career Advisor', desc: 'A persistent conversational mentor powered by Gemini that knows your full profile, resume, and goals. Every answer is personalised — not generic.' },
  { icon: 'adjust', color: '#10b981', title: 'Career Readiness Score', desc: 'A live 0–100 composite score updated dynamically from your profile completeness, simulation performance, and learning progress.' },
  { icon: 'explore', color: '#3b82f6', title: 'Career Intelligence', desc: 'Algorithmic matching that scores skill overlap against every career in the database and surfaces your top-aligned opportunities.' },
];

const institutions = [
  { icon: 'school', color: '#00c4cc', tag: 'Universities', title: 'Campus-wide career intelligence', desc: 'Give every student a personalised AI advisor. Track cohort readiness, identify department-wide skill gaps, and demonstrate placement outcomes.' },
  { icon: 'code', color: '#8b5cf6', tag: 'Bootcamps', title: 'Prove ROI with measurable readiness', desc: 'Replace generic curriculum with adaptive AI pathways. Students graduate with verified readiness scores employers trust.' },
  { icon: 'business_center', color: '#f59e0b', tag: 'Career Centers', title: 'Scale 1:1 advising with AI', desc: 'Multiply advisor capacity. The AI handles routine guidance while your team focuses on high-touch placement and employer relations.' },
];

/* ─── component ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  useEffect(() => { setHydrated(true); }, []);
  const isLoggedIn = hydrated && isAuthenticated;

  return (
    <ClientWrapper>
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0f1e', fontFamily: 'Inter, sans-serif' }}>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,15,30,0.85)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <span style={{ color: '#00c4cc', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>FuturePath AI</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {[['#impact', 'The Problem'], ['#features', 'Features'], ['#institutions', 'For Institutions'], ['#workflow', 'How It Works']].map(([href, label]) => (
            <a key={label} href={href} className="text-sm font-medium transition-colors" style={{ color: '#64748b' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>{label}</a>
          ))}
        </div>

        <div className="flex items-center gap-3" suppressHydrationWarning>
          {isLoggedIn ? (
            <>
              <span className="text-sm hidden sm:block" style={{ color: '#64748b' }}>
                Hi, <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{user?.first_name || 'there'}</span>
              </span>
              <Link href="/dashboard">
                <button className="btn-primary text-sm px-5 py-2">Go to Dashboard</button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <button className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
                  style={{ color: '#94a3b8', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#f1f5f9'; b.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#94a3b8'; b.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button className="btn-primary text-sm px-5 py-2">Get Started Free</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* ambient glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ position: 'absolute', top: '10%', left: '20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,196,204,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', bottom: '0', right: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'rgba(0,196,204,0.1)', border: '1px solid rgba(0,196,204,0.2)', color: '#00c4cc', fontSize: '0.78rem', fontWeight: 600 }}>
            <span className="material-icons" style={{ fontSize: '14px' }}>auto_awesome</span>
            Powered by Google Gemini 2.5 Flash · AI-Native EdTech
          </div>

          {/* headline */}
          <h1 style={{ fontSize: 'clamp(2.8rem,6.5vw,4.8rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.08, color: '#f1f5f9', marginBottom: '1.5rem' }}>
            Turn students into<br />
            <span style={{ background: 'linear-gradient(135deg, #00c4cc 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              workforce-ready professionals.
            </span>
          </h1>

          {/* sub-headline */}
          <p style={{ fontSize: '1.15rem', color: '#94a3b8', lineHeight: 1.75, maxWidth: '640px', margin: '0 auto 1.25rem' }}>
            FuturePath AI is an <strong style={{ color: '#f1f5f9' }}>AI-native adaptive career intelligence ecosystem</strong> that detects skill gaps, builds personalised learning pathways, and simulates real workplaces — all powered by Gemini.
          </p>

          {/* BD impact line — now a proper visible banner */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-10"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.85rem', color: '#94a3b8' }}>
            <span style={{ fontSize: '1.1rem' }}>🇧🇩</span>
            <span>Addressing Bangladesh's graduate employability crisis ·</span>
            <span style={{ color: '#00c4cc', fontWeight: 600 }}>Scalable across South Asia</span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" suppressHydrationWarning>
            <Link href={isLoggedIn ? '/dashboard' : '/signup'}>
              <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
                style={{ background: '#00c4cc', color: '#0a0f1e' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#00a8b0'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#00c4cc'}>
                {isLoggedIn ? 'Go to Dashboard' : 'Start Free — No Credit Card'}
                <span className="material-icons" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
            </Link>
            <a href="#institutions">
              <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium text-base transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}>
                <span className="material-icons" style={{ fontSize: '18px', color: '#8b5cf6' }}>business</span>
                For Institutions
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── IMPACT / PROBLEM STATEMENT ─────────────────────────────────────── */}
      <section id="impact" className="px-6 py-20 max-w-6xl mx-auto w-full">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="section-label">The Problem We're Solving</p>
          <h2 className="page-title mb-4">Millions of graduates. Zero workforce readiness.</h2>
          <p className="page-subtitle mx-auto text-center">
            In Bangladesh, India, and across South Asia, a systemic gap between academic theory and employer expectations leaves graduates unemployed and employers understaffed.
          </p>
        </div>

        {/* 3 stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { value: '47%', label: 'of South Asian graduates are underemployed within 2 years of graduation', icon: 'trending_down', color: '#ef4444' },
            { value: '73%', label: 'of employers say new hires lack the practical skills required on day one', icon: 'warning', color: '#f59e0b' },
            { value: '12 mo', label: 'average time wasted before a student finds a career-aligned role', icon: 'schedule', color: '#8b5cf6' },
          ].map(s => (
            <div key={s.value} className="glass-card hover-card p-8 text-center">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: `${s.color}18` }}>
                <span className="material-icons" style={{ color: s.color, fontSize: '22px' }}>{s.icon}</span>
              </div>
              <p className="stat-number mb-3" style={{ color: s.color }}>{s.value}</p>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.65 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Narrative callout */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-6"
          style={{ background: 'rgba(0,196,204,0.03)', border: '1px solid rgba(0,196,204,0.12)' }}>
          <span className="material-icons flex-shrink-0 text-4xl" style={{ color: '#00c4cc', fontSize: '40px' }}>lightbulb</span>
          <p style={{ fontSize: '1rem', color: '#94a3b8', lineHeight: 1.8 }}>
            Traditional career guidance is <strong style={{ color: '#f1f5f9' }}>expensive, unscalable, and generic.</strong> A single career advisor cannot meaningfully serve 5,000 students. FuturePath AI puts a personalised AI career advisor in the pocket of every student — for a fraction of the cost.
          </p>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────────── */}
      <section id="features" className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="section-label">AI Intelligence Suite</p>
          <h2 className="page-title mb-4">Six AI systems. One ecosystem.</h2>
          <p className="page-subtitle mx-auto text-center">Not AI sprinkled on top — every core feature is natively orchestrated by Gemini 2.5 Flash.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <div key={f.title} className="glass-card hover-card p-7">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}18` }}>
                <span className="material-icons" style={{ color: f.color, fontSize: '21px' }}>{f.icon}</span>
              </div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOR INSTITUTIONS ─────────────────────────────────────────────────── */}
      <section id="institutions" className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-5">
          <p className="section-label" style={{ color: '#8b5cf6' }}>Institutional Partners</p>
          <h2 className="page-title mb-4">Built for institutions. Loved by students.</h2>
          <p className="page-subtitle mx-auto text-center">
            FuturePath AI is a <strong style={{ color: '#f1f5f9' }}>B2B2C SaaS platform</strong> — institutions deploy it, students benefit. One license. Campus-wide impact.
          </p>
        </div>

        {/* Model clarity row */}
        <div className="flex flex-wrap justify-center gap-4 mb-14">
          {['🏛️ University licenses the platform', '🎓 Students get personalised AI guidance', '📊 Institution tracks readiness & outcomes'].map(t => (
            <span key={t} className="impact-badge" style={{ background: 'rgba(139,92,246,0.08)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.2)', fontSize: '0.82rem', padding: '8px 18px' }}>
              {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {institutions.map(s => (
            <div key={s.tag} className="glass-card hover-card p-8 flex flex-col" style={{ border: `1px solid ${s.color}15` }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <span className="material-icons" style={{ color: s.color, fontSize: '22px' }}>{s.icon}</span>
                </div>
                <span className="impact-badge" style={{ background: `${s.color}15`, color: s.color, fontSize: '0.72rem', padding: '4px 12px' }}>{s.tag}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.6rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.7, flex: 1 }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Partnership CTA */}
        <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          style={{ background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.18)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.3rem' }}>Interested in a partnership?</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Per-student pricing. White-label available. <span style={{ color: '#00c4cc', fontWeight: 600 }}>Free pilot for universities in Bangladesh.</span>
            </p>
          </div>
          <a href="mailto:partnership@futurepath.ai" className="flex-shrink-0">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: '#8b5cf6', color: '#fff' }}>
              <span className="material-icons" style={{ fontSize: '16px' }}>mail</span>
              Contact for Partnership
            </button>
          </a>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section id="workflow" className="px-6 py-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-14">
          <p className="section-label">The Intelligence Loop</p>
          <h2 className="page-title mb-4">From enrollment to employment-ready</h2>
          <p className="page-subtitle mx-auto text-center">A self-improving AI loop that adapts to each student's progress in real time.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: '01', icon: 'account_tree', title: 'Profile & Assess', desc: "Student builds their profile — skills, resume, target role. Gemini performs a deep skill gap analysis with a priority-ranked action plan and a weeks-to-readiness estimate." },
            { num: '02', icon: 'psychology', title: 'AI Generates a Plan', desc: "A personalised week-by-week learning pathway is created with named resources. The AI Advisor provides on-demand mentorship using the student's full context." },
            { num: '03', icon: 'rocket_launch', title: 'Simulate & Advance', desc: "Students run Gemini-powered workplace simulations scored 0–100. Scores feed the Career Readiness Score, closing the loop and triggering the next adaptation." },
          ].map(step => (
            <div key={step.num} className="glass-card hover-card p-8 relative overflow-hidden">
              <div style={{ position: 'absolute', top: '-10px', right: '16px', fontSize: '5rem', fontWeight: 900, color: 'rgba(0,196,204,0.06)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>{step.num}</div>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{ background: 'rgba(0,196,204,0.1)' }}>
                <span className="material-icons" style={{ color: '#00c4cc', fontSize: '21px' }}>{step.icon}</span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '0.6rem' }}>{step.title}</h3>
              <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>



      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="px-6 py-24 text-center">
        <div className="glass-card max-w-3xl mx-auto p-14 relative overflow-hidden"
          style={{ background: 'rgba(0,196,204,0.04)', border: '1px solid rgba(0,196,204,0.18)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(0,196,204,0.07), transparent 65%)', pointerEvents: 'none' }} />
          <div className="relative z-10">
            <p className="section-label" style={{ textAlign: 'center' }}>Start Today</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#f1f5f9', marginBottom: '1rem' }}>
              Ready to close your skill gap?
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '0.5rem' }}>
              Join the platform that turns academic potential into workforce readiness.
            </p>
            <p style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '2.5rem' }}>
              Free for individual students · Institutional plans available
            </p>
            <div suppressHydrationWarning>
              <Link href={isLoggedIn ? '/dashboard' : '/signup'}>
                <button className="px-10 py-4 rounded-xl font-bold text-base transition-all"
                  style={{ background: '#00c4cc', color: '#0a0f1e' }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#00a8b0'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = '#00c4cc'}>
                  {isLoggedIn ? 'Go to Dashboard' : 'Get Started Free'}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="px-8 py-8 mt-auto border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>FuturePath AI</p>
            <p style={{ fontSize: '0.75rem', color: '#334155', marginTop: '2px' }}>
              AI-Native Career Intelligence & Adaptive Learning Ecosystem · Infinity AI BuildFest 2026 🇧🇩
            </p>
          </div>
          <div className="flex gap-6">
            {['Privacy Policy', 'University Partnerships', 'API Access', 'Contact'].map(l => (
              <a key={l} href="#" style={{ fontSize: '0.75rem', color: '#475569', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
    </ClientWrapper>
  );
}
