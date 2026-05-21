'use client';

export default function HelpPage() {
  const faqs = [
    { q: 'How does the Career Readiness Score work?', a: 'Your score is calculated by comparing your current skills against the requirements of your target role, weighted by industry demand and recent simulation performance.' },
    { q: 'How often is market data updated?', a: 'Our career intelligence data is refreshed weekly from 50M+ industry signals, ensuring your roadmap reflects current hiring trends.' },
    { q: 'Can I change my target career?', a: 'Yes. Navigate to Career Explorer, select any career, and set it as your target. Your dashboard and skill gap analysis will automatically recalibrate.' },
    { q: 'How do simulations affect my score?', a: 'Each completed simulation contributes up to 15 points to your Readiness Score. Scores are weighted by scenario difficulty and relevance to your target role.' },
  ];

  return (
    <div className="p-8 max-w-3xl" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>Help Center</h1>
        <p className="text-sm" style={{ color: '#64748b' }}>Frequently asked questions and support resources.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-2" style={{ color: '#f1f5f9' }}>{faq.q}</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 glass-card p-6 text-center" style={{ border: '1px solid rgba(0,196,204,0.15)', background: 'rgba(0,196,204,0.03)' }}>
        <span className="material-icons mb-3" style={{ color: '#00c4cc', fontSize: '32px', display: 'block' }}>support_agent</span>
        <h3 className="font-semibold mb-2" style={{ color: '#f1f5f9' }}>Still need help?</h3>
        <p className="text-sm mb-4" style={{ color: '#64748b' }}>Our support team responds within 24 hours.</p>
        <a href="mailto:support@futurepath.ai" className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold" style={{ background: '#00c4cc', color: '#0a0f1e' }}>
          <span className="material-icons" style={{ fontSize: '16px' }}>mail</span>
          Contact Support
        </a>
      </div>
    </div>
  );
}
