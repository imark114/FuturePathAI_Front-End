'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { careerService } from '@/services/career';

const CATEGORY_ICONS: Record<string, string> = {
  'AI': 'psychology',
  'Data': 'analytics',
  'ML': 'model_training',
  'Cloud': 'cloud',
  'Security': 'security',
  'Bio': 'biotech',
  'NLP': 'chat',
  'Vision': 'visibility',
  'Robotics': 'smart_toy',
  'Quant': 'show_chart',
  'Product': 'inventory_2',
  'Full': 'code',
  'Ethics': 'balance',
  'default': 'work',
};

function getIcon(title: string): string {
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (title.includes(key)) return CATEGORY_ICONS[key];
  }
  return CATEGORY_ICONS.default;
}

function growthColor(outlook: string): string {
  const n = parseInt(outlook || '0');
  if (n >= 40) return '#10b981';
  if (n >= 25) return '#3b82f6';
  return '#f59e0b';
}

export default function CareerExplorer() {
  const searchParams = useSearchParams();
  const matchParam = searchParams.get('matches'); // comma-separated career IDs from dashboard
  const matchedIds = new Set(
    matchParam ? matchParam.split(',').map(s => s.trim()).filter(Boolean) : []
  );
  const comingFromDashboard = matchedIds.size > 0;

  const [search, setSearch] = useState('');

  const { data: careers = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['careers'],
    queryFn: careerService.getCareers,
    staleTime: 10 * 60 * 1000,
  });

  const filtered = careers.filter((c: any) =>
    search.trim() === '' ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.required_skills || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  );

  // When coming from dashboard matches, sort matched careers first
  const sorted = comingFromDashboard && search.trim() === ''
    ? [
        ...filtered.filter((c: any) => matchedIds.has(String(c.id))),
        ...filtered.filter((c: any) => !matchedIds.has(String(c.id))),
      ]
    : filtered;

  return (
    <div className="p-8" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: '#3b82f6' }}>Career Intelligence</p>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9', letterSpacing: '-0.02em' }}>Career Explorer</h1>
        <p className="text-sm" style={{ color: '#64748b' }}>
          Browse {careers.length} in-demand career paths. Click any career to see requirements, trajectory, and start a simulation.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-lg">
        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: '18px', color: '#475569' }}>search</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by title or skill (e.g. Python, ML, Cloud…)"
          className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>close</span>
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-4 rounded mb-3" style={{ background: 'rgba(255,255,255,0.06)', width: '60%' }} />
              <div className="h-3 rounded mb-2" style={{ background: 'rgba(255,255,255,0.04)', width: '90%' }} />
              <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.04)', width: '70%' }} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="glass-card p-6 max-w-md text-center" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
          <span className="material-icons text-3xl mb-2" style={{ color: '#ef4444' }}>error_outline</span>
          <p className="text-sm mb-4" style={{ color: '#64748b' }}>Failed to load careers from the server.</p>
          <button onClick={() => refetch()} className="px-4 py-2 rounded-lg text-xs font-semibold" style={{ background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      )}

      {/* Matched careers banner */}
      {comingFromDashboard && !isLoading && !search && (
        <div className="mb-5 rounded-2xl px-5 py-4 flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(0,196,204,0.08), rgba(59,130,246,0.06))',
            border: '1px solid rgba(0,196,204,0.2)',
          }}
        >
          <span className="material-icons flex-shrink-0" style={{ fontSize: '18px', color: '#00c4cc' }}>auto_awesome</span>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: '#f1f5f9' }}>Your top {matchedIds.size} career matches are highlighted below</p>
            <p className="text-xs" style={{ color: '#475569' }}>Based on your skills, target roles, and simulation history</p>
          </div>
          <Link href="/settings" className="text-xs font-semibold flex-shrink-0" style={{ color: '#00c4cc' }}>Update profile →</Link>
        </div>
      )}

      {/* Results count */}
      {!isLoading && !isError && (
        <div className="mb-4">
          <p className="text-xs" style={{ color: '#475569' }}>
            {search ? `${sorted.length} result${sorted.length !== 1 ? 's' : ''} for "${search}"` : `Showing all ${sorted.length} careers`}
          </p>
        </div>
      )}

      {/* Career Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((c: any) => {
            const isMatch = matchedIds.has(String(c.id));
            const icon = getIcon(c.title);
            const gColor = growthColor(c.growth_outlook || '');
            const skills: string[] = (c.required_skills || []).slice(0, 4);

            return (
              <Link href={`/careers/${c.id}`} key={c.id}>
                <div
                  className="glass-card p-6 cursor-pointer transition-all group flex flex-col h-full relative"
                  style={{
                    border: isMatch
                      ? '1px solid rgba(0,196,204,0.35)'
                      : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: isMatch ? '0 0 20px rgba(0,196,204,0.06)' : undefined,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = isMatch ? 'rgba(0,196,204,0.55)' : 'rgba(59,130,246,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = isMatch ? 'rgba(0,196,204,0.35)' : 'rgba(255,255,255,0.06)')}
                >
                  {/* Best Match badge */}
                  {isMatch && (
                    <span
                      className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(0,196,204,0.12)', color: '#00c4cc', border: '1px solid rgba(0,196,204,0.25)' }}
                    >
                      ✦ Best Match
                    </span>
                  )}
                  {/* Title row */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(59,130,246,0.1)' }}>
                      <span className="material-icons" style={{ fontSize: '18px', color: '#3b82f6' }}>{icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold leading-snug" style={{ color: '#f1f5f9' }}>{c.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
                        {c.growth_outlook && (
                          <span style={{ color: gColor, fontWeight: 600 }}>{c.growth_outlook}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed flex-1 mb-4"
                    style={{ color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>

                  {/* Skills chips */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {skills.map((s: string) => (
                      <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(59,130,246,0.08)', color: '#64748b', border: '1px solid rgba(59,130,246,0.12)' }}>
                        {s}
                      </span>
                    ))}
                    {(c.required_skills || []).length > 4 && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#334155' }}>
                        +{c.required_skills.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      {c.avg_salary && (
                        <p className="text-sm font-bold" style={{ color: '#f1f5f9' }}>
                          ${Number(c.avg_salary).toLocaleString()}
                          <span className="text-xs font-normal ml-1" style={{ color: '#475569' }}>/yr</span>
                        </p>
                      )}
                    </div>
                    <span className="material-icons transition-transform group-hover:translate-x-1" style={{ color: '#3b82f6', fontSize: '18px' }}>
                      arrow_forward
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && !isLoading && (
            <div className="col-span-3 glass-card p-10 text-center">
              <span className="material-icons text-3xl mb-3" style={{ color: '#334155' }}>search_off</span>
              <p className="text-sm" style={{ color: '#475569' }}>No careers match "{search}"</p>
              <button onClick={() => setSearch('')} className="mt-3 text-xs" style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                Clear search
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
