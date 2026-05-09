'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '../../src/store/auth.store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const registered = searchParams.get('registered') === 'true';
  const [error, setError] = useState(
    searchParams.get('error') === 'unauthorized' ? 'Admin access required.' :
    searchParams.get('error') === 'expired' ? 'Session expired. Please sign in again.' :
    searchParams.get('error') === 'session_invalid' ? 'Session invalid. Please sign in.' : ''
  );

  // Auto-redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get('redirect') || (user.role === 'admin' ? '/admin' : '/');
      router.replace(redirect);
    }
  }, [user, router, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.data);
        const redirect = searchParams.get('redirect') || (data.data.role === 'admin' ? '/admin' : '/');
        router.push(redirect);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to your account to continue</p>
        </div>

        {/* Messages */}
        {registered && (
          <div className="mb-5 p-3 bg-green-50 text-green-700 text-[13px] rounded-xl text-center font-medium">
            Account created! Please sign in.
          </div>
        )}
        {error && (
          <div data-testid="login-error-message" className="mb-5 p-3 bg-red-50 text-red-600 text-[13px] rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} data-testid="login-form" className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              id="login_email_input"
              data-testid="login-email-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-medium text-gray-700">Password</label>
              <Link href="/forgot-password" title="Reset your password" className="text-[12px] font-semibold text-gray-900 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              id="login_password_input"
              data-testid="login-password-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            id="login_submit_button"
            data-testid="login-submit-button"
            className="w-full py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-gray-900 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center text-gray-400 text-sm">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
