'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function LandingPage() {
  const [hydrated, setHydrated] = useState(false);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);

  // Wait for Zustand to rehydrate from localStorage before reading auth state
  useEffect(() => {
    setHydrated(true);
  }, []);

  const isLoggedIn = hydrated && isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0f1e', fontFamily: 'Inter, sans-serif' }} suppressHydrationWarning>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-tight" style={{ color: '#00c4cc' }}>FuturePath AI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Explorer', href: '/careers' },
            { label: 'Simulator', href: '/simulation' },
            { label: 'Advisor', href: '/advisor' },
            { label: 'Analytics', href: '/skill-gap' }
          ].map(item => (
            <Link key={item.label} href={item.href} className="text-sm font-medium transition-colors" style={{ color: '#94a3b8' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
              onMouseLeave={e => (e.currentTarget.style.color = '#94a3b8')}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth-aware navbar buttons */}
        <div className="flex items-center gap-3" suppressHydrationWarning>
          {isLoggedIn ? (
            <>
              <span className="text-sm" style={{ color: '#64748b' }}>
                Hi, <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{user?.first_name || 'there'}</span>
              </span>
              <Link href="/dashboard">
                <button
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                  style={{ background: '#00c4cc', color: '#0a0f1e' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#00b3ba')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#00c4cc')}
                >
                  Go to Dashboard
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <button
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
                  style={{ color: '#94a3b8', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f1f5f9'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button
                  className="text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                  style={{ background: '#00c4cc', color: '#0a0f1e' }}
                  onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#00b3ba')}
                  onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#00c4cc')}
                >
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32 relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,196,204,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8" style={{ background: 'rgba(0,196,204,0.1)', border: '1px solid rgba(0,196,204,0.2)', color: '#00c4cc' }}>
            <span className="material-icons" style={{ fontSize: '14px' }}>auto_awesome</span>
            Powered by Gemini 2.5 Flash
          </div>

          <h1 className="font-extrabold mb-6 leading-tight" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing: '-0.03em', color: '#f1f5f9' }}>
            Bridge the gap between<br />
            <span style={{ color: '#00c4cc' }}>academic theory</span> and industry reality.
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#94a3b8' }}>
            FuturePath AI uses predictive modeling and professional simulations to align your education directly with high-trajectory career outcomes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" suppressHydrationWarning>
            {/* Hero CTA — goes to dashboard if logged in, signup if not */}
            <Link href={isLoggedIn ? '/dashboard' : '/signup'}>
              <button
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-all"
                style={{ background: '#00c4cc', color: '#0a0f1e' }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = '#00b3ba')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = '#00c4cc')}
              >
                {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
                <span className="material-icons" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
            </Link>
            <button className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-medium text-base transition-all" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}>
              <span className="material-icons" style={{ fontSize: '18px', color: '#00c4cc' }}>play_circle</span>
              View Demo
            </button>
          </div>

          <p className="mt-10 text-sm" style={{ color: '#475569' }}>
            Trusted by high-achievers at top institutions
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-20 max-w-7xl mx-auto w-full">
        <p className="text-center text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#00c4cc' }}>Intelligence Suite</p>
        <h2 className="text-center text-3xl font-bold mb-4" style={{ color: '#f1f5f9' }}>We move beyond generic advice</h2>
        <p className="text-center max-w-xl mx-auto mb-16 text-base" style={{ color: '#64748b' }}>
          Utilizing multi-modal AI to map your specific skills to real-time market demands.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'trending_up', title: 'Career Prediction Engine', desc: 'Analyze 50M+ data points to forecast industry trends and identify high-leverage entry roles before they become saturated.' },
            { icon: 'hub', title: 'Dynamic Skill Mapping', desc: 'Upload your syllabus and projects. Our AI extracts your exact competencies and visualizes your gap against target job descriptions.' },
            { icon: 'record_voice_over', title: 'Stress-Tested Interview Sim', desc: 'Engage in voice-to-voice mock interviews with AI trained on technical and behavioral rubrics from top-tier tech and finance firms.' },
          ].map((f) => (
            <div key={f.title} className="glass-card p-8 transition-all" style={{ cursor: 'default' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: 'rgba(0,196,204,0.1)' }}>
                <span className="material-icons" style={{ color: '#00c4cc', fontSize: '22px' }}>{f.icon}</span>
              </div>
              <h3 className="font-semibold text-lg mb-3" style={{ color: '#f1f5f9' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="px-8 py-20 max-w-7xl mx-auto w-full">
        <p className="text-center text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: '#00c4cc' }}>The Intelligence Workflow</p>
        <h2 className="text-center text-3xl font-bold mb-4" style={{ color: '#f1f5f9' }}>A systematic approach</h2>
        <p className="text-center max-w-xl mx-auto mb-16 text-base" style={{ color: '#64748b' }}>
          Transitioning from academic potential to professional execution.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: '01', title: 'Ingest & Assess', desc: 'Connect your university accounts. The system parses your coursework, grades, and extracurriculars to establish a baseline.', icon: 'account_tree' },
            { num: '02', title: 'Synthesize Plan', desc: 'The Advisor module generates a deterministic timeline, recommending specific internships, certs, and networking targets.', icon: 'psychology' },
            { num: '03', title: 'Simulate & Execute', desc: 'Run continuous interview simulations and resume reviews until you hit the 90th percentile readiness threshold.', icon: 'rocket_launch' },
          ].map((step) => (
            <div key={step.num} className="glass-card p-8 relative">
              <div className="text-5xl font-black mb-6" style={{ color: 'rgba(0,196,204,0.12)', lineHeight: 1 }}>{step.num}</div>
              <div className="flex items-center gap-3 mb-3">
                <span className="material-icons" style={{ color: '#00c4cc', fontSize: '20px' }}>{step.icon}</span>
                <h3 className="font-semibold text-lg" style={{ color: '#f1f5f9' }}>{step.title}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 text-center">
        <div className="glass-card max-w-3xl mx-auto p-16" style={{ background: 'rgba(0,196,204,0.04)', border: '1px solid rgba(0,196,204,0.15)' }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#f1f5f9' }}>Ready to engineer your career?</h2>
          <p className="mb-8 text-base" style={{ color: '#64748b' }}>
            Stop guessing what employers want. Start building the exact profile they are actively recruiting.
          </p>
          <div suppressHydrationWarning>
            <Link href={isLoggedIn ? '/dashboard' : '/login'}>
              <button className="px-10 py-4 rounded-xl font-semibold text-base" style={{ background: '#00c4cc', color: '#0a0f1e' }}>
                {isLoggedIn ? 'Go to Dashboard' : 'Start Free Trial'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 mt-auto border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm" style={{ color: '#475569' }}>© 2025 FuturePath AI. Sophisticated Utility for High Achievers.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'University Partnerships', 'Contact Support'].map(link => (
              <a key={link} href="#" className="text-xs transition-colors" style={{ color: '#475569' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
                onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
