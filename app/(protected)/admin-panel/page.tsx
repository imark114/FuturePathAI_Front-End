'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@/services/admin';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast, ToastContainer } from '@/components/Toast';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend,
} from 'recharts';

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
type Tab = 'overview' | 'analytics' | 'users' | 'institutions' | 'cohorts' | 'careers' | 'simulations' | 'ai' | 'plans' | 'licenses' | 'logs' | 'settings';

export default function AdminPanelPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'overview'; // URL-driven tab
  const qc = useQueryClient();
  const { toasts, toast, dismiss } = useToast();
  const [userSearch, setUserSearch] = useState('');
  const [careerSearch, setCareerSearch] = useState('');
  const [careerModal, setCareerModal] = useState<any>(null); // null = closed, {} = new, {id, ...} = edit

  // ── Guard: only admin/staff ───────────────────────────────────────────────
  const isAdmin = user && (user.role === 'admin' || user.is_staff || user.is_superuser);
  if (user && !isAdmin) {
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
    enabled: tab === 'overview' || tab === 'analytics',
  });

  const { data: chartData } = useQuery({
    queryKey: ['adminActivityChart'],
    queryFn: adminService.getActivityChart,
    enabled: tab === 'overview' || tab === 'analytics',
  });
  const days = chartData?.days || [];

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
    onSuccess: (_data, userId) => {
      qc.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status updated successfully.');
    },
    onError: () => toast.error('Failed to update user status. Please try again.'),
  });

  const saveCareerMut = useMutation({
    mutationFn: (data: any) => careerModal?.id
      ? adminService.updateCareer(careerModal.id, data)
      : adminService.createCareer(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCareers'] });
      qc.invalidateQueries({ queryKey: ['adminStats'] });
      setCareerModal(null);
      toast.success(careerModal?.id ? 'Career path updated.' : 'New career path created.');
    },
    onError: () => toast.error('Failed to save career. Please try again.'),
  });

  const deleteCareerMut = useMutation({
    mutationFn: adminService.deleteCareer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminCareers'] });
      qc.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Career path deleted.');
    },
    onError: () => toast.error('Failed to delete career. Please try again.'),
  });

  const TAB_LABELS: Record<string, string> = {
    overview: 'Overview', analytics: 'Analytics', users: 'User Management',
    institutions: 'Institutions', cohorts: 'Cohorts', careers: 'Career Paths',
    simulations: 'Simulations', ai: 'AI Config', plans: 'Plans & Billing',
    licenses: 'Licenses', logs: 'Audit Logs', settings: 'System Settings',
  };

  return (
    <div className="p-6 md:p-8" style={{ fontFamily: 'Inter, sans-serif', maxWidth: '1200px' }}>
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ef4444' }}>Admin Console</p>
        </div>
        <h1 className="text-2xl font-black mb-1" style={{ color: '#f1f5f9', fontFamily: 'Geist, sans-serif', letterSpacing: '-0.03em' }}>
          {TAB_LABELS[tab] || 'Platform Administration'}
        </h1>
        <p className="text-sm" style={{ color: '#64748b' }}>
          {tab === 'overview' && 'Real-time platform health, user growth, and activity metrics.'}
          {tab === 'analytics' && 'Deep-dive charts — signups, simulation trends, platform readiness.'}
          {tab === 'users' && 'View, search, and manage all registered users.'}
          {tab === 'institutions' && 'Manage university, bootcamp, and enterprise partner accounts.'}
          {tab === 'cohorts' && 'Organise students into institution-specific cohorts.'}
          {tab === 'careers' && 'Add, edit, and remove career paths available to students.'}
          {tab === 'simulations' && 'Browse all simulation sessions across the platform.'}
          {tab === 'ai' && 'Configure AI model behaviour, prompts, and response tuning.'}
          {tab === 'plans' && 'Manage subscription plans, pricing tiers, and billing.'}
          {tab === 'licenses' && 'Track and manage institutional licenses and seat counts.'}
          {tab === 'logs' && 'Full audit trail of admin actions across the platform.'}
          {tab === 'settings' && 'System-wide configuration, maintenance, and environment settings.'}
        </p>
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

              {/* Charts Row 1: Signups + Simulations over time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                {/* User Signups Area Chart */}
                <div className="glass-card p-5">
                  <SectionHeader icon="person_add" title="USER SIGNUPS — LAST 14 DAYS" color="var(--blue)"><></></SectionHeader>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={days} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false}/>
                      <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false}/>
                      <Tooltip contentStyle={{ background: '#0d1627', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}/>
                      <Area type="monotone" dataKey="signups" stroke="#3b82f6" strokeWidth={2} fill="url(#signupGrad)"/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Simulation Activity Bar Chart */}
                <div className="glass-card p-5">
                  <SectionHeader icon="model_training" title="SIMULATION ACTIVITY — LAST 14 DAYS" color="var(--purple)"><></></SectionHeader>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={days} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
                      <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false}/>
                      <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false}/>
                      <Tooltip contentStyle={{ background: '#0d1627', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}/>
                      <Bar dataKey="simulations" fill="#8b5cf6" radius={[3, 3, 0, 0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Charts Row 2: Top Careers + Platform Readiness */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Top Careers Horizontal Bar */}
                <div className="glass-card p-5">
                  <SectionHeader icon="leaderboard" title="TOP CAREERS BY SIMULATIONS" color="var(--amber)"><></></SectionHeader>
                  {stats.careers.top_by_simulations?.length ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart
                        layout="vertical"
                        data={stats.careers.top_by_simulations.map((c: any) => ({ name: c.title.length > 20 ? c.title.slice(0,20)+'…' : c.title, sims: c.sim_count }))}
                        margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false}/>
                        <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false}/>
                        <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} width={100}/>
                        <Tooltip contentStyle={{ background: '#0d1627', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}/>
                        <Bar dataKey="sims" fill="#f59e0b" radius={[0, 3, 3, 0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>No simulation data yet.</p>
                  )}
                </div>

                {/* Platform Readiness Radial */}
                <div className="glass-card p-5 flex flex-col items-center justify-center">
                  <SectionHeader icon="trending_up" title="PLATFORM AVG READINESS" color="var(--green)"><></></SectionHeader>
                  <ResponsiveContainer width="100%" height={160}>
                    <RadialBarChart
                      cx="50%" cy="50%" innerRadius="55%" outerRadius="80%"
                      data={[{ name: 'Readiness', value: stats.platform.avg_readiness_score, fill: '#10b981' }]}
                      startAngle={90} endAngle={90 - (stats.platform.avg_readiness_score / 100) * 360}
                    >
                      <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(255,255,255,0.04)' }}/>
                      <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" fill="#10b981" fontSize={28} fontWeight={900}>
                        {stats.platform.avg_readiness_score}
                      </text>
                      <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize={11}>
                        / 100
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
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

      {/* ── ANALYTICS TAB ─────────────────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div className="animate-fp-in space-y-6">
          {/* Stat summary row */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Users" value={stats.users.total} icon="people" color="#3b82f6" sub={`+${stats.users.new_last_7_days} this week`} />
              <StatCard label="Simulations Run" value={stats.simulations.total} icon="model_training" color="#8b5cf6" sub={`${stats.simulations.completion_rate}% completed`} />
              <StatCard label="Avg Readiness" value={`${stats.platform.avg_readiness_score}%`} icon="trending_up" color="#10b981" sub="Platform-wide score" />
              <StatCard label="Avg Sim Score" value={`${stats.simulations.average_score}%`} icon="grade" color="#f59e0b" sub="Across all users" />
            </div>
          )}
          {/* Signup trend chart */}
          {days.length > 0 && (
            <div className="glass-card p-5">
              <SectionHeader icon="show_chart" title="Daily Signups — Last 14 Days" color="#3b82f6" />
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip contentStyle={{ background: '#0d1627', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                  <Area type="monotone" dataKey="signups" stroke="#3b82f6" fill="url(#gSignups)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
          {/* Simulations trend chart */}
          {days.length > 0 && (
            <div className="glass-card p-5">
              <SectionHeader icon="bar_chart" title="Daily Simulations — Last 14 Days" color="#8b5cf6" />
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={days} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#475569' }} />
                  <Tooltip contentStyle={{ background: '#0d1627', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="simulations" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── INSTITUTIONS TAB ──────────────────────────────────────────────── */}
      {tab === 'institutions' && (
        <div className="animate-fp-in">
          <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
            <span className="material-icons mb-4" style={{ fontSize: '48px', color: '#3b82f6' }}>account_balance</span>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>Institution Management</h2>
            <p className="text-sm mb-4" style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 16px' }}>
              Add and manage your B2B clients — universities, bootcamps, and career centres. Each institution gets its own license, cohorts, and usage dashboard.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <span className="material-icons" style={{ fontSize: '14px', color: '#3b82f6' }}>rocket_launch</span>
              <span className="text-xs font-bold" style={{ color: '#3b82f6' }}>Coming in Phase 2 — Subscription Launch</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 text-left">
              {[
                { icon: 'add_business', title: 'Onboard Partners', desc: 'Invite universities and bootcamps with a guided setup wizard.' },
                { icon: 'group', title: 'Manage Seats', desc: 'Assign, revoke, and track student seat allocations per institution.' },
                { icon: 'analytics', title: 'Partner Analytics', desc: 'Per-institution placement rates, readiness scores, and engagement metrics.' },
              ].map(f => (
                <div key={f.title} className="glass-card p-4" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="material-icons mb-2" style={{ fontSize: '20px', color: '#3b82f6' }}>{f.icon}</span>
                  <p className="text-xs font-bold mb-1" style={{ color: '#f1f5f9' }}>{f.title}</p>
                  <p className="text-xs" style={{ color: '#475569' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COHORTS TAB ───────────────────────────────────────────────────── */}
      {tab === 'cohorts' && (
        <div className="animate-fp-in">
          <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
            <span className="material-icons mb-4" style={{ fontSize: '48px', color: '#10b981' }}>school</span>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>Cohort Management</h2>
            <p className="text-sm mb-4" style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 16px' }}>
              Group students by institution, academic year, or program. Track cohort-level progress, readiness trends, and placement outcomes.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <span className="material-icons" style={{ fontSize: '14px', color: '#10b981' }}>rocket_launch</span>
              <span className="text-xs font-bold" style={{ color: '#10b981' }}>Coming in Phase 2 — Subscription Launch</span>
            </div>
          </div>
        </div>
      )}

      {/* ── AI CONFIG TAB ─────────────────────────────────────────────────── */}
      {tab === 'ai' && (
        <div className="animate-fp-in space-y-4">
          <div className="glass-card p-6" style={{ border: '1px solid rgba(139,92,246,0.2)' }}>
            <SectionHeader icon="psychology" title="AI Engine Configuration" color="#8b5cf6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Model', value: 'Gemini 2.5 Flash', icon: 'auto_awesome', color: '#8b5cf6' },
                { label: 'Advisor Sessions', value: 'Active', icon: 'smart_toy', color: '#10b981' },
                { label: 'Skill Gap Analysis', value: 'Active', icon: 'analytics', color: '#10b981' },
                { label: 'Simulation Engine', value: 'Active', icon: 'model_training', color: '#10b981' },
                { label: 'Career Comparison', value: 'Active', icon: 'compare', color: '#10b981' },
                { label: 'Resume Parsing', value: 'Active (pdfplumber)', icon: 'description', color: '#10b981' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="material-icons" style={{ fontSize: '18px', color: item.color }}>{item.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-xs font-semibold" style={{ color: item.color }}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <p className="text-xs font-bold mb-1" style={{ color: '#8b5cf6' }}>Advanced AI Tuning</p>
              <p className="text-xs" style={{ color: '#475569' }}>Per-institution prompt customization, response temperature control, and domain-specific fine-tuning will be available in the enterprise tier.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── PLANS & BILLING TAB ───────────────────────────────────────────── */}
      {tab === 'plans' && (
        <div className="animate-fp-in space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Free', price: '$0', period: 'forever', color: '#64748b', features: ['5 simulations/month', 'AI Advisor (limited)', 'Career Explorer', 'Basic skill gap'], badge: null },
              { name: 'Pro Student', price: '$9', period: 'per month', color: '#00c4cc', features: ['Unlimited simulations', 'Full AI Advisor', 'Resume AI parsing', 'Priority career matching', 'Downloadable reports'], badge: 'Popular' },
              { name: 'Institution', price: 'Custom', period: 'per student/yr', color: '#8b5cf6', features: ['Everything in Pro', 'Cohort management', 'Institution analytics', 'White-label option', 'Dedicated support'], badge: 'Enterprise' },
            ].map(plan => (
              <div key={plan.name} className="glass-card p-6 flex flex-col" style={{ border: `1px solid ${plan.color}30` }}>
                {plan.badge && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-3" style={{ background: `${plan.color}20`, color: plan.color, border: `1px solid ${plan.color}40` }}>{plan.badge}</span>
                )}
                <p className="text-sm font-bold mb-1" style={{ color: '#f1f5f9' }}>{plan.name}</p>
                <p className="text-2xl font-black mb-1" style={{ color: plan.color }}>{plan.price}</p>
                <p className="text-xs mb-4" style={{ color: '#475569' }}>{plan.period}</p>
                <ul className="space-y-2 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
                      <span className="material-icons" style={{ fontSize: '14px', color: plan.color }}>check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 text-xs text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#334155' }}>
                  Stripe integration coming soon
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LICENSES TAB ──────────────────────────────────────────────────── */}
      {tab === 'licenses' && (
        <div className="animate-fp-in">
          <div className="glass-card p-8 text-center" style={{ border: '1px solid rgba(245,158,11,0.2)' }}>
            <span className="material-icons mb-4" style={{ fontSize: '48px', color: '#f59e0b' }}>verified</span>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>License Management</h2>
            <p className="text-sm mb-4" style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto 16px' }}>
              Issue, track and revoke institutional licenses. Each license defines the seat count, expiry date, and allowed feature tier for a partner institution.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <span className="material-icons" style={{ fontSize: '14px', color: '#f59e0b' }}>rocket_launch</span>
              <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>Coming in Phase 2 — Subscription Launch</span>
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOGS TAB ────────────────────────────────────────────────── */}
      {tab === 'logs' && (
        <div className="animate-fp-in">
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold" style={{ color: '#94a3b8' }}>Recent Admin Actions</p>
            </div>
            {[
              { action: 'User deactivated', detail: 'student@test.com', time: '2 min ago', icon: 'person_off', color: '#ef4444' },
              { action: 'Career path created', detail: 'Quantum Computing Engineer', time: '1 hour ago', icon: 'add_circle', color: '#10b981' },
              { action: 'Career path updated', detail: 'Data Scientist', time: '3 hours ago', icon: 'edit', color: '#3b82f6' },
              { action: 'Admin login', detail: 'me.rakib@gmail.com', time: '4 hours ago', icon: 'login', color: '#8b5cf6' },
              { action: 'User activated', detail: 'newstudent@uni.edu', time: '1 day ago', icon: 'person_check', color: '#10b981' },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${log.color}15` }}>
                  <span className="material-icons" style={{ fontSize: '14px', color: log.color }}>{log.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: '#f1f5f9' }}>{log.action}</p>
                  <p className="text-xs" style={{ color: '#475569' }}>{log.detail}</p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: '#334155' }}>{log.time}</span>
              </div>
            ))}
            <div className="p-4 text-center">
              <p className="text-xs" style={{ color: '#334155' }}>Full persistent audit logging will be stored to database in Phase 2</p>
            </div>
          </div>
        </div>
      )}

      {/* ── SYSTEM SETTINGS TAB ───────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="animate-fp-in space-y-4">
          {[
            { section: 'AI & Services', icon: 'psychology', color: '#8b5cf6', items: [
              { label: 'Gemini API Key', value: '••••••••••••••••', editable: false },
              { label: 'AI Model', value: 'gemini-2.5-flash', editable: false },
              { label: 'Max tokens per response', value: '2048', editable: true },
            ]},
            { section: 'Platform', icon: 'settings', color: '#3b82f6', items: [
              { label: 'App Name', value: 'FuturePath AI', editable: true },
              { label: 'Default Language', value: 'English', editable: true },
              { label: 'Maintenance Mode', value: 'Off', editable: true },
            ]},
            { section: 'Email & Notifications', icon: 'email', color: '#10b981', items: [
              { label: 'SMTP Host', value: 'Not configured', editable: false },
              { label: 'Sender Email', value: 'noreply@futurepath.ai', editable: false },
            ]},
          ].map(group => (
            <div key={group.section} className="glass-card overflow-hidden" style={{ border: `1px solid ${group.color}20` }}>
              <div className="flex items-center gap-2 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="material-icons" style={{ fontSize: '16px', color: group.color }}>{group.icon}</span>
                <p className="text-xs font-bold" style={{ color: '#94a3b8' }}>{group.section}</p>
              </div>
              {group.items.map(item => (
                <div key={item.label} className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-xs" style={{ color: '#64748b' }}>{item.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: '#f1f5f9' }}>{item.value}</span>
                    {item.editable && (
                      <span className="material-icons" style={{ fontSize: '14px', color: '#334155', cursor: 'pointer' }}>edit</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
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
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </div>
  );
}
