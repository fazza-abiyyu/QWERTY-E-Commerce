'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        // Redirect after delay or let user click link
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Forgot password?</h1>
          <p className="text-sm text-gray-500">Enter your email and we&apos;ll send you an OTP code.</p>
        </div>

        {message && (
          <div data-testid="forgot-password-message" className={`p-4 rounded-xl text-sm font-medium mb-6 ${
            message.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-50 text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="forgot-password-form" className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                id="forgot_password_email"
                type="email"
                required
                data-testid="forgot-password-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            id="btn_send_otp"
            data-testid="forgot-password-submit-button"
            className="w-full py-3.5 bg-gray-900 text-white rounded-2xl text-[14px] font-bold hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2 active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
