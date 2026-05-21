'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, sub }: {
  label: string; value: string | number; icon: string; color: string; sub?: string
}) {
  return (
    <div className="glass-card p-5 flex items-start gap-4 animate-fp-in">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15` }}>
        <span className="material-icons" style={{ fontSize: '22px', color }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs page-header-label mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-3xl font-black" style={{ color, fontFamily: 'Geist, sans-serif', lineHeight: 1 }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, color, children }: any) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-secondary)', fontFamily: 'Geist, sans-serif' }}>
        <span className="material-icons" style={{ fontSize: '16px', color }}>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ── Career Modal ───────────────────────────────────────────────────────────────
function CareerModal({ career, onClose, onSave }: { career: any; onClose: () => void; onSave: (data: any) => void }) {
  const isNew = !career?.id;
  const [form, setForm] = useState({
    title: career?.title || '',
    description: career?.description || '',
    required_skills: Array.isArray(career?.required_skills) ? career.required_skills.join(', ') : '',
    avg_salary: career?.avg_salary || '',
    growth_outlook: career?.growth_outlook || '',
  });

  const handle = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = () => {
    const data = {
      ...form,
      required_skills: form.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean),
      avg_salary: form.avg_salary ? parseFloat(form.avg_salary) : null,
    };
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card w-full max-w-lg p-6" style={{ border: '1px solid var(--border-normal)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Geist, sans-serif' }}>
            {isNew ? 'Add New Career' : 'Edit Career'}
          </h3>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px 8px' }}>
            <span className="material-icons" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>TITLE *</label>
            <input className="fp-input" value={form.title} onChange={e => handle('title', e.target.value)} placeholder="e.g. Machine Learning Engineer" />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>DESCRIPTION *</label>
            <textarea className="fp-input" rows={3} value={form.description} onChange={e => handle('description', e.target.value)} placeholder="Role description..." style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>REQUIRED SKILLS (comma-separated)</label>
            <input className="fp-input" value={form.required_skills} onChange={e => handle('required_skills', e.target.value)} placeholder="Python, ML, Docker, Kubernetes..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>AVG SALARY (USD/yr)</label>
              <input className="fp-input" type="number" value={form.avg_salary} onChange={e => handle('avg_salary', e.target.value)} placeholder="130000" />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--text-muted)' }}>GROWTH OUTLOOK</label>
              <input className="fp-input" value={form.growth_outlook} onChange={e => handle('growth_outlook', e.target.value)} placeholder="+35% over 5 years" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary" style={{ padding: '9px 18px', fontSize: '13px' }}>Cancel</button>
          <button onClick={submit} className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }} disabled={!form.title || !form.description}>
            <span className="material-icons" style={{ fontSize: '15px' }}>{isNew ? 'add' : 'save'}</span>
            {isNew ? 'Add Career' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'users' | 'careers' | 'simulations';

export default function AdminPanelPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('overview');
  const [userSearch, setUserSearch] = useState('');
  const [careerSearch, setCareerSearch] = useState('');
  const [careerModal, setCareerModal] = useState<any>(null); // null = closed, {} = new, {id, ...} = edit

  // ── Guard: only staff ────────────────────────────────────────────────────
  if (user && !(user as any).is_staff) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <span className="material-icons text-5xl mb-4" style={{ color: 'var(--red)', fontSize: '56px' }}>gpp_bad</span>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Geist, sans-serif' }}>Access Denied</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>You need staff/admin privileges to access this panel.</p>
        <button onClick={() => router.push('/dashboard')} className="btn-secondary mt-4">← Back to Dashboard</button>
      </div>
    );
  }

  // ── Queries ──────────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminService.getStats,
    enabled: tab === 'overview',
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers', userSearch],
    queryFn: () => adminService.getUsers(userSearch),
    enabled: tab === 'users',
  });

  const { data: careers = [], isLoading: careersLoading } = useQuery({
    queryKey: ['adminCareers', careerSearch],
    queryFn: () => adminService.getCareers(careerSearch),
    enabled: tab === 'careers',
  });

  const { data: simsData, isLoading: simsLoading } = useQuery({
    queryKey: ['adminSims'],
    queryFn: () => adminService.getSimulations(),
    enabled: tab === 'simulations',
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const toggleUserMut = useMutation({
    mutationFn: adminService.toggleUser,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminUsers'] }),
  });

  const saveCareerMut = useMutation({
    mutationFn: (data: any) => careerModal?.id
      ? adminService.updateCareer(careerModal.id, data)
      : adminService.createCareer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCareers'] });
      qc.invalidateQueries({ queryKey: ['adminStats'] });
      setCareerModal(null);
    },
  });

  const deleteCareerMut = useMutation({
    mutationFn: adminService.deleteCareer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCareers'] });
      qc.invalidateQueries({ queryKey: ['adminStats'] });
    },
  });

  // ── Tab bar ───────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',     label: 'Overview',     icon: 'dashboard' },
    { id: 'users',        label: 'Users',         icon: 'people' },
    { id: 'careers',      label: 'Careers',       icon: 'work' },
    { id: 'simulations',  label: 'Simulations',   icon: 'model_training' },
  ];

  return (
    <div className="p-6 md:p-8" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '1200px' }}>
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: 'var(--red)', boxShadow: '0 0 8px var(--red)' }} />
          <p className="page-header-label text-xs" style={{ color: 'var(--red)' }}>Admin Control Panel</p>
        </div>
        <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Geist, sans-serif', letterSpacing: '-0.03em' }}>
          Platform Administration
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Manage users, careers, simulations, and platform analytics.
        </p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 mb-7 p-1 rounded-xl w-fit" style={{ background: 'var(--surface-2)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t.id ? 'var(--surface-4)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
              border: tab === t.id ? '1px solid var(--border-normal)' : '1px solid transparent',
            }}
          >
            <span className="material-icons" style={{ fontSize: '15px' }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div className="animate-fp-in">
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
            </div>
          ) : stats ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
                <StatCard label="Total Users" value={stats.users.total} icon="people" color="var(--blue)" sub={`+${stats.users.new_last_7_days} this week`} />
                <StatCard label="Active (30d)" value={stats.users.active_last_30_days} icon="person_check" color="var(--green)" sub="Unique active users" />
                <StatCard label="Simulations" value={stats.simulations.total} icon="model_training" color="var(--purple)" sub={`${stats.simulations.completion_rate}% completion rate`} />
                <StatCard label="Avg Score" value={`${stats.simulations.average_score}%`} icon="grade" color="var(--amber)" sub="Across completed sims" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-7">
                <StatCard label="Total Careers" value={stats.careers.total} icon="work" color="var(--teal)" />
                <StatCard label="Learning Paths" value={stats.learning.total_paths} icon="route" color="var(--purple)" sub={`${stats.learning.active_paths} active`} />
                <StatCard label="Avg Readiness" value={`${stats.platform.avg_readiness_score}%`} icon="trending_up" color="var(--green)" sub="Platform-wide" />
              </div>

              {/* Top Careers */}
              <div className="glass-card p-5">
                <SectionHeader icon="leaderboard" title="TOP CAREERS BY SIMULATION COUNT" color="var(--amber)"><></></SectionHeader>
                <div className="space-y-3">
                  {(stats.careers.top_by_simulations || []).map((c: any, i: number) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <span className="text-xs font-black w-5 text-center" style={{ color: 'var(--text-dim)', fontFamily: 'Geist, sans-serif' }}>{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                      </div>
                      <span className="badge badge-amber">{c.sim_count} sims</span>
                    </div>
                  ))}
                  {!stats.careers.top_by_simulations?.length && (
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No simulation data yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ── USERS TAB ─────────────────────────────────────────────────────── */}
      {tab === 'users' && (
        <div className="animate-fp-in">
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-sm">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>search</span>
              <input className="fp-input pl-9 text-sm" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by email or name..." />
            </div>
            {usersData && (
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {usersData.count} user{usersData.count !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="glass-card overflow-hidden">
            {usersLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-8 rounded" />)}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="fp-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Experience</th>
                      <th>Target Role</th>
                      <th>Simulations</th>
                      <th>Readiness</th>
                      <th>Joined</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(usersData?.results || []).map((u: any) => (
                      <tr key={u.id}>
                        <td>
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {u.first_name || u.email.split('@')[0]} {u.last_name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-muted capitalize">{u.experience_level || '—'}</span>
                        </td>
                        <td>
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {u.target_roles?.[0] || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs font-bold" style={{ color: 'var(--blue)', fontFamily: 'Geist, sans-serif' }}>{u.sim_count}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="fp-progress w-14">
                              <div className="fp-progress-fill" style={{ width: `${u.readiness_score}%` }} />
                            </div>
                            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{u.readiness_score}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {new Date(u.date_joined).toLocaleDateString()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => toggleUserMut.mutate(u.id)}
                            className={u.is_active ? 'btn-danger' : 'btn-secondary'}
                            style={{ padding: '5px 10px', fontSize: '11px' }}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!usersData?.results?.length && (
                      <tr>
                        <td colSpan={8} className="text-center py-8">
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No users found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CAREERS TAB ───────────────────────────────────────────────────── */}
      {tab === 'careers' && (
        <div className="animate-fp-in">
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: '16px', color: 'var(--text-muted)' }}>search</span>
              <input className="fp-input pl-9 text-sm" value={careerSearch} onChange={e => setCareerSearch(e.target.value)} placeholder="Search careers..." />
            </div>
            <button onClick={() => setCareerModal({})} className="btn-primary" style={{ padding: '9px 16px', fontSize: '13px' }}>
              <span className="material-icons" style={{ fontSize: '15px' }}>add</span>
              Add Career
            </button>
          </div>

          <div className="glass-card overflow-hidden">
            {careersLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-8 rounded" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="fp-table">
                  <thead>
                    <tr>
                      <th>Career</th>
                      <th>Avg Salary</th>
                      <th>Growth</th>
                      <th>Skills</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(careers as any[]).map((c: any) => (
                      <tr key={c.id}>
                        <td>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{c.title}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.description}
                          </p>
                        </td>
                        <td>
                          <span className="text-xs font-bold" style={{ color: 'var(--green)', fontFamily: 'Geist, sans-serif' }}>
                            {c.avg_salary ? `$${Number(c.avg_salary).toLocaleString()}` : '—'}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs" style={{ color: 'var(--blue)' }}>{c.growth_outlook || '—'}</span>
                        </td>
                        <td>
                          <div className="flex flex-wrap gap-1">
                            {(c.required_skills || []).slice(0, 3).map((s: string) => (
                              <span key={s} className="badge badge-muted" style={{ fontSize: '10px', padding: '1px 7px' }}>{s}</span>
                            ))}
                            {(c.required_skills || []).length > 3 && (
                              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{c.required_skills.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setCareerModal(c)} className="btn-ghost" style={{ padding: '5px 8px' }} title="Edit">
                              <span className="material-icons" style={{ fontSize: '15px', color: 'var(--blue)' }}>edit</span>
                            </button>
                            <button
                              onClick={() => { if (confirm(`Delete "${c.title}"?`)) deleteCareerMut.mutate(c.id); }}
                              className="btn-ghost"
                              style={{ padding: '5px 8px' }}
                              title="Delete"
                            >
                              <span className="material-icons" style={{ fontSize: '15px', color: 'var(--red)' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!(careers as any[]).length && (
                      <tr>
                        <td colSpan={5} className="text-center py-8">
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No careers found.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SIMULATIONS TAB ───────────────────────────────────────────────── */}
      {tab === 'simulations' && (
        <div className="animate-fp-in">
          <div className="glass-card overflow-hidden">
            {simsLoading ? (
              <div className="p-6 space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-8 rounded" />)}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="fp-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User</th>
                      <th>Career</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(simsData?.results || []).map((s: any) => (
                      <tr key={s.id}>
                        <td><span className="text-xs font-mono" style={{ color: 'var(--text-dim)' }}>#{s.id}</span></td>
                        <td><span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.user_email}</span></td>
                        <td><span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{s.career}</span></td>
                        <td>
                          <span className={`badge ${s.status === 'completed' ? 'badge-green' : s.status === 'active' ? 'badge-blue' : 'badge-muted'}`}>
                            {s.status}
                          </span>
                        </td>
                        <td>
                          {s.final_score != null ? (
                            <span className="text-xs font-bold" style={{ color: s.final_score >= 70 ? 'var(--green)' : s.final_score >= 50 ? 'var(--amber)' : 'var(--red)', fontFamily: 'Geist, sans-serif' }}>
                              {s.final_score}%
                            </span>
                          ) : <span style={{ color: 'var(--text-dim)' }}>—</span>}
                        </td>
                        <td><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString()}</span></td>
                      </tr>
                    ))}
                    {!simsData?.results?.length && (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No simulations yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Career Modal */}
      {careerModal !== null && (
        <CareerModal
          career={careerModal}
          onClose={() => setCareerModal(null)}
          onSave={(data) => saveCareerMut.mutate(data)}
        />
      )}
    </div>
  );
}
