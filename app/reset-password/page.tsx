'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { validatePassword } from '../../src/utils/validation';
import { Lock, KeyRound, ArrowLeft, Loader2, CheckCircle2, Check, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get('email') || '';

  const [formData, setFormData] = useState({
    email: emailParam,
    otp: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { isValid: passValid, requirements } = validatePassword(formData.new_password);
  const matches = formData.new_password === formData.confirm_password && formData.new_password !== '';
  const canSubmit = formData.email !== '' && formData.otp.length === 6 && passValid && matches;

  useEffect(() => {
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
  }, [emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          new_password: formData.new_password
        }),
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ type: 'success', text: 'Password reset successfully!' });
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus({ type: 'error', text: data.message });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (status?.type === 'success') {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Success!</h1>
        <p className="text-gray-500 mb-8">Your password has been updated. You can now log in with your new password.</p>
        <Link href="/login" className="px-8 py-3 bg-gray-900 text-white rounded-2xl text-[14px] font-bold hover:bg-black transition-all inline-block">
          Login Now
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link 
        href="/forgot-password" 
        className="inline-flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Change Email
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Set new password</h1>
        <p className="text-sm text-gray-500">Enter the OTP sent to your terminal and choose a new password.</p>
      </div>

      {status?.type === 'error' && (
        <div data-testid="reset-password-error" className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium mb-6">
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} data-testid="reset-password-form" className="space-y-4">
        <div>
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
            OTP Code
          </label>
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="text"
              required
              id="reset_password_otp"
              data-testid="reset-password-otp-input"
              value={formData.otp}
              onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
              placeholder="Enter 6-digit code"
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all font-mono tracking-widest"
              maxLength={6}
            />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              id="reset_password_new"
              data-testid="reset-password-new-input"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              placeholder="Secure password"
              className="w-full pl-11 pr-11 py-3 bg-gray-50 border border-transparent rounded-2xl text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-2 px-1">
            {requirements.map((req) => (
              <div key={req.id} data-testid={`reset-pass-req-${req.id}`} className="flex items-center gap-1.5">
                <div data-testid={`reset-pass-req-icon-${req.id}`} className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                  req.met ? 'bg-gray-900' : 'bg-gray-100'
                }`}>
                  {req.met ? <Check className="w-2.5 h-2.5 text-white" /> : <div className="w-1 h-1 rounded-full bg-gray-300" />}
                </div>
                <span className={`text-[10px] font-medium transition-colors ${
                  req.met ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {req.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
            <input
              type="password"
              required
              id="reset_password_confirm"
              data-testid="reset-password-confirm-input"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              placeholder="Repeat password"
              className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-2xl text-[14px] transition-all focus:outline-none focus:ring-2 ${
                formData.confirm_password !== '' && !matches 
                  ? 'border-red-200 focus:ring-red-100' 
                  : 'border-transparent focus:ring-gray-200 focus:bg-white'
              }`}
            />
          </div>
          {formData.confirm_password !== '' && !matches && (
            <p className="text-[10px] text-red-500 mt-1.5 px-1 font-medium italic">
              Passwords do not match.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!canSubmit || loading}
          id="btn_reset_password"
          data-testid="reset-password-submit-button"
          className="w-full py-3.5 bg-gray-900 text-white rounded-2xl text-[14px] font-bold hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all mt-4 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-gray-400">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
