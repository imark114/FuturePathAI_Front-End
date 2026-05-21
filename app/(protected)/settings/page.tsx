'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user';

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner (0–1 years)' },
  { value: 'intermediate', label: 'Intermediate (1–3 years)' },
  { value: 'advanced', label: 'Advanced (3–5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass-card p-6 mb-5">
      <h2 className="text-sm font-semibold mb-5 uppercase tracking-widest" style={{ color: '#475569' }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748b' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f1f5f9',
};
const inputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor = 'rgba(0,196,204,0.4)');
const inputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
  (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)');

export default function SettingsPage() {
  const setUser = useAuthStore(s => s.setUser);
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    major: '', graduation_year: '', target_roles: '',
    bio: '', experience_level: 'beginner',
    current_skills: '', resume_text: '',
    linkedin_url: '', github_url: '',
  });

  const [saved, setSaved] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: userService.getMe,
  });

  useEffect(() => {
    if (profileData) {
      const p = (profileData as any).profile || {};
      setForm({
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        email: profileData.email || '',
        major: p.major || '',
        graduation_year: p.graduation_year?.toString() || '',
        target_roles: Array.isArray(p.target_roles) ? p.target_roles.join(', ') : (p.target_roles || ''),
        bio: p.bio || '',
        experience_level: p.experience_level || 'beginner',
        current_skills: Array.isArray(p.current_skills) ? p.current_skills.join(', ') : (p.current_skills || ''),
        resume_text: p.resume_text || '',
        linkedin_url: p.linkedin_url || '',
        github_url: p.github_url || '',
      });
      setUser(profileData);
    }
  }, [profileData, setUser]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => userService.updateMe(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['userProfile'], updatedUser);
      setUser(updatedUser);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: () => alert('Failed to update profile. Please try again.'),
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSave = () => {
    updateMutation.mutate({
      first_name: form.first_name,
      last_name: form.last_name,
      major: form.major,
      graduation_year: form.graduation_year,
      target_roles: form.target_roles,
      bio: form.bio,
      experience_level: form.experience_level,
      current_skills: form.current_skills,
      resume_text: form.resume_text,
      linkedin_url: form.linkedin_url,
      github_url: form.github_url,
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center gap-3" style={{ color: '#64748b' }}>
        <span className="material-icons animate-spin" style={{ fontSize: '20px', color: '#00c4cc' }}>autorenew</span>
        Loading profile...
      </div>
    );
  }

  const initials = `${form.first_name[0] || 'U'}${form.last_name[0] || ''}`.toUpperCase();

  return (
    <div className="p-8 max-w-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Profile Settings</h1>
        <p className="text-sm" style={{ color: '#64748b' }}>
          The more detail you provide, the better AI can personalize your career advice and skill gap analysis.
        </p>
      </div>

      {/* Avatar */}
      <div className="glass-card p-6 mb-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00c4cc, #4f46e5)', color: '#fff' }}>
            {initials}
          </div>
          <div>
            <p className="font-semibold" style={{ color: '#f1f5f9' }}>{form.first_name} {form.last_name}</p>
            <p className="text-sm" style={{ color: '#64748b' }}>Student · {form.email}</p>
            <p className="text-xs mt-1" style={{ color: '#475569' }}>
              {EXPERIENCE_LEVELS.find(l => l.value === form.experience_level)?.label || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <Section title="Personal Information">
        <div className="grid grid-cols-2 gap-4">
          <Field label="First Name">
            <input type="text" value={form.first_name} onChange={set('first_name')}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
          </Field>
          <Field label="Last Name">
            <input type="text" value={form.last_name} onChange={set('last_name')}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
          </Field>
          <div className="col-span-2">
            <Field label="Email Address">
              <input type="email" value={form.email} disabled
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none opacity-50 cursor-not-allowed"
                style={inputStyle} />
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Bio / Personal Summary (shown to AI advisor for context)">
              <textarea value={form.bio} onChange={set('bio')} rows={3}
                placeholder="e.g. CS student passionate about ML and distributed systems..."
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Academic Profile */}
      <Section title="Academic Profile">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Major / Field of Study">
            <input type="text" value={form.major} onChange={set('major')}
              placeholder="e.g. Computer Science"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
          </Field>
          <Field label="Graduation Year">
            <input type="text" value={form.graduation_year} onChange={set('graduation_year')}
              placeholder="e.g. 2026"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
          </Field>
          <div className="col-span-2">
            <Field label="Experience Level">
              <select value={form.experience_level} onChange={set('experience_level')}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ ...inputStyle, cursor: 'pointer' }} onFocus={inputFocus} onBlur={inputBlur}>
                {EXPERIENCE_LEVELS.map(l => (
                  <option key={l.value} value={l.value} style={{ background: '#0d1627' }}>{l.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Target Role(s) — comma-separated">
              <input type="text" value={form.target_roles} onChange={set('target_roles')}
                placeholder="e.g. AI Research Scientist, ML Engineer"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
            </Field>
          </div>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills & Expertise">
        <div className="mb-4">
          <Field label="Current Skills — comma-separated (used by AI for skill gap analysis)">
            <input type="text" value={form.current_skills} onChange={set('current_skills')}
              placeholder="e.g. Python, Machine Learning, SQL, Docker, React"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
          </Field>
          {form.current_skills && (
            <div className="flex flex-wrap gap-2 mt-3">
              {form.current_skills.split(',').filter(s => s.trim()).map(skill => (
                <span key={skill} className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(0,196,204,0.1)', border: '1px solid rgba(0,196,204,0.2)', color: '#00c4cc' }}>
                  {skill.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="LinkedIn Profile URL">
            <input type="url" value={form.linkedin_url} onChange={set('linkedin_url')}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
          </Field>
          <Field label="GitHub Profile URL">
            <input type="url" value={form.github_url} onChange={set('github_url')}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
          </Field>
        </div>
      </Section>

      {/* Resume */}
      <Section title="Resume / CV Text">
        <p className="text-xs mb-3" style={{ color: '#475569' }}>
          Paste your resume text below. The AI uses this for deep skill gap analysis and personalised career recommendations.
        </p>
        <Field label="Resume Text">
          <textarea value={form.resume_text} onChange={set('resume_text')} rows={8}
            placeholder="Paste your full resume/CV text here..."
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none font-mono"
            style={{ ...inputStyle, fontSize: '12px', lineHeight: '1.6' }}
            onFocus={inputFocus} onBlur={inputBlur} />
        </Field>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: '#00c4cc', color: '#0a0f1e', cursor: updateMutation.isPending ? 'not-allowed' : 'pointer' }}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm" style={{ color: '#10b981' }}>
            <span className="material-icons" style={{ fontSize: '16px' }}>check_circle</span>
            Saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}
