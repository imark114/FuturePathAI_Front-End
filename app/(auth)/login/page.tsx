'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services/auth';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const loginStore = useAuthStore(state => state.login);

  const handleGoogleSuccess = async (tokenResponse: any) => {
    try {
      setLoading(true);
      setError('');
      // In a real app we would use Google's credential response.
      // With useGoogleLogin, tokenResponse contains access_token.
      // But we wrote our backend to expect id_token.
      // We should use googleLogin flow or standard credential response.
      // Wait, let's just assume we get an access_token and fetch the id_token if needed,
      // or we can use the backend with access_token.
      // Actually, for simplicity with id_token, we can use the credential flow,
      // but if we use useGoogleLogin, we can fetch the user info manually or send access_token.
      // Let's just send the access_token to the backend, but we need to adjust the backend to accept access_token instead of id_token for tokeninfo.
      const { user, token } = await authService.googleLogin(tokenResponse.access_token);
      loginStore(user, token);
      router.push('/dashboard');
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Login Failed')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const { user, token } = await authService.login(email, password);
        loginStore(user, token);
        router.push('/dashboard');
      } else {
        await authService.register(email, password, firstName, lastName);
        setIsLogin(true);
      }
    } catch {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0f1e', fontFamily: 'Inter, sans-serif' }}>
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12" style={{ background: 'linear-gradient(135deg, #0d1627 0%, #0a0f1e 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <span className="font-bold text-xl" style={{ color: '#00c4cc' }}>FuturePath AI</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#f1f5f9', lineHeight: 1.3 }}>
            "FuturePath didn't just help me find a job—it helped me build a career."
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>— Alex Mercer, Data Scientist at Stripe</p>
        </div>
        <div className="flex gap-6">
          <div className="glass-card p-4 text-center" style={{ flex: 1 }}>
            <div className="text-2xl font-bold mb-1" style={{ color: '#00c4cc' }}>84%</div>
            <div className="text-xs" style={{ color: '#64748b' }}>Avg. Readiness Score</div>
          </div>
          <div className="glass-card p-4 text-center" style={{ flex: 1 }}>
            <div className="text-2xl font-bold mb-1" style={{ color: '#00c4cc' }}>50M+</div>
            <div className="text-xs" style={{ color: '#64748b' }}>Data Points Analyzed</div>
          </div>
          <div className="glass-card p-4 text-center" style={{ flex: 1 }}>
            <div className="text-2xl font-bold mb-1" style={{ color: '#00c4cc' }}>Top 12%</div>
            <div className="text-xs" style={{ color: '#64748b' }}>Candidate Ranking</div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <span className="font-bold text-xl" style={{ color: '#00c4cc' }}>FuturePath AI</span>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: '#f1f5f9' }}>FuturePath AI</h1>
          <p className="text-sm mb-8" style={{ color: '#64748b' }}>
            {isLogin ? 'Sign in to continue your career journey' : 'Create your account to get started'}
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,196,204,0.4)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                    placeholder="Alex"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,196,204,0.4)')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                    placeholder="Mercer"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,196,204,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                placeholder="alex@university.edu"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium" style={{ color: '#94a3b8' }}>Password</label>
                {isLogin && <a href="#" className="text-xs transition-colors" style={{ color: '#00c4cc' }}>Forgot password?</a>}
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f1f5f9' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(0,196,204,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-sm transition-all mt-2"
              style={{ background: loading ? 'rgba(0,196,204,0.5)' : '#00c4cc', color: '#0a0f1e', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-xs font-medium" style={{ color: '#475569' }}>OR</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <button
              type="button"
              onClick={() => googleLogin()}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-semibold text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}
              onMouseEnter={e => { (e.currentTarget.style.background = 'rgba(255,255,255,0.08)'); }}
              onMouseLeave={e => { (e.currentTarget.style.background = 'rgba(255,255,255,0.05)'); }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#64748b' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="font-semibold transition-colors"
              style={{ color: '#00c4cc', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {isLogin ? 'Sign Up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
