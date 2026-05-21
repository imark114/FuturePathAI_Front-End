'use client';

import Link from 'next/link';
import { use } from 'react';

const details: Record<string, { title: string; salary: string; growth: string; match: number; desc: string; skills: string[]; companies: string[] }> = {
  '1': {
    title: 'AI Research Scientist', salary: '$165,000', growth: '+45%', match: 94,
    desc: 'Develop novel machine learning architectures and push the boundaries of artificial general intelligence. Work at the cutting edge of AI research, publishing papers and building production-grade systems.',
    skills: ['Deep Learning', 'PyTorch/TensorFlow', 'Research Methodology', 'Python', 'Mathematics', 'NLP'],
    companies: ['Google DeepMind', 'OpenAI', 'Anthropic', 'Meta AI'],
  },
  '2': {
    title: 'Data Architect', salary: '$145,000', growth: '+28%', match: 87,
    desc: "Design, create, deploy and manage an organization's data architecture to support complex AI operations. Define data standards and principles that ensure quality and consistency across the enterprise.",
    skills: ['Cloud Architecture', 'Data Modeling', 'AWS/GCP', 'Spark', 'dbt', 'SQL'],
    companies: ['Amazon', 'Microsoft', 'Databricks', 'Snowflake'],
  },
  '3': {
    title: 'Quantitative Analyst', salary: '$155,000', growth: '+15%', match: 79,
    desc: 'Apply mathematical and statistical methods to financial and risk management problems in investment banking and fintech.',
    skills: ['Statistics', 'Python', 'R', 'Machine Learning', 'Finance', 'Risk Modeling'],
    companies: ['Goldman Sachs', 'Jane Street', 'Two Sigma', 'Citadel'],
  },
  '4': {
    title: 'Bioinformatics Scientist', salary: '$110,000', growth: '+32%', match: 71,
    desc: 'Develop algorithms and models to understand biological data, bridging computer science and biology in cutting-edge research.',
    skills: ['Bioinformatics', 'Python', 'R', 'Statistics', 'Genomics', 'Machine Learning'],
    companies: ['Illumina', 'Genentech', 'Broad Institute', '23andMe'],
  },
};

// Next.js 15+: params is a Promise — must be unwrapped with React.use()
export default function CareerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const career = details[id] || details['1'];

  return (
    <div className="p-8 max-w-4xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>{career.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm font-semibold" style={{ color: '#00c4cc' }}>{career.salary} avg</span>
            <span className="text-sm" style={{ color: '#64748b' }}>·</span>
            <span className="text-sm" style={{ color: '#10b981' }}>{career.growth} growth (5Y)</span>
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black" style={{ color: '#00c4cc', lineHeight: 1 }}>{career.match}%</div>
          <div className="text-xs mt-1" style={{ color: '#64748b' }}>match score</div>
        </div>
      </div>

      <div className="glass-card p-6 mb-5">
        <h2 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>Overview</h2>
        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>{career.desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#94a3b8' }}>Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {career.skills.map(skill => (
              <span key={skill} className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ background: 'rgba(0,196,204,0.1)', border: '1px solid rgba(0,196,204,0.2)', color: '#00c4cc' }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div className="glass-card p-6">
          <h2 className="text-sm font-semibold mb-4" style={{ color: '#94a3b8' }}>Top Hiring Companies</h2>
          <div className="space-y-2">
            {career.companies.map(company => (
              <div key={company} className="flex items-center gap-2">
                <span className="material-icons" style={{ fontSize: '14px', color: '#4f46e5' }}>business</span>
                <span className="text-sm" style={{ color: '#94a3b8' }}>{company}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Use Next.js Link for client-side nav — prevents full reload that clears auth state */}
      <div className="flex items-center gap-3">
        <Link
          href="/advisor"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: '#00c4cc', color: '#0a0f1e' }}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>smart_toy</span>
          Ask AI Advisor About This Role
        </Link>
        <Link
          href="/skill-gap"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="material-icons" style={{ fontSize: '16px' }}>analytics</span>
          View Skill Gap
        </Link>
      </div>
    </div>
  );
}
