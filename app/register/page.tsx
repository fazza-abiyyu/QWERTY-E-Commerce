'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validatePassword, validateEmail } from '../../src/utils/validation';
import { Check, X, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const emailValid = email === '' || validateEmail(email);
  const { isValid: passValid, requirements } = validatePassword(password);
  const matches = password === confirmPassword && password !== '';
  
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched on submit attempt
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (fullName === '') {
      setError('Please enter your full name.');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!passValid) {
      setError('Password does not meet all requirements.');
      return;
    }

    if (!matches) {
      setError('Passwords do not match.');
      return;
    }
    
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/login?registered=true');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Create account</h1>
          <p className="text-sm text-gray-500">Join QWERTY to start shopping</p>
        </div>

        {/* Error Notification */}
        {error && (
          <div data-testid="register-error-message" className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 text-[13px] rounded-2xl text-center font-bold animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} noValidate className="space-y-5">
          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Full Name</label>
            <input
              type="text"
              required
              data-testid="register-name-input"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              onBlur={() => handleBlur('fullName')}
              placeholder="John Doe"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                touched.fullName && fullName === '' 
                  ? 'border-red-200 text-red-600 focus:ring-red-100' 
                  : 'border-transparent text-gray-900 focus:ring-gray-200 focus:bg-white'
              }`}
            />
            {touched.fullName && fullName === '' && (
              <p className="text-[10px] text-red-500 mt-1.5 px-1 font-bold">
                Nama lengkap wajib diisi!
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              required
              data-testid="register-email-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                touched.email && !validateEmail(email)
                  ? 'border-red-200 text-red-600 focus:ring-red-100' 
                  : 'border-transparent text-gray-900 focus:ring-gray-200 focus:bg-white'
              }`}
            />
            {touched.email && email !== '' && !validateEmail(email) && (
              <p className="text-[10px] text-red-500 mt-1.5 px-1 font-bold">
                Format email tidak valid!
              </p>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                data-testid="register-password-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                placeholder="Secure password"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:bg-white transition-all pr-11 ${
                  touched.password && !passValid ? 'border-red-100' : 'border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Requirements */}
            <div className="mt-3 grid grid-cols-2 gap-2 px-1">
              {requirements.map((req) => (
                <div key={req.id} data-testid={`pass-req-${req.id}`} className="flex items-center gap-1.5">
                  <div data-testid={`pass-req-icon-${req.id}`} className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
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
            <label className="block text-[13px] font-bold text-gray-700 mb-1.5 ml-1">Confirm Password</label>
            <input
              type="password"
              required
              data-testid="register-confirm-password-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Repeat password"
              className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                touched.confirmPassword && !matches 
                  ? 'border-red-200 focus:ring-red-100' 
                  : 'border-transparent focus:ring-gray-200 focus:bg-white'
              }`}
            />
            {touched.confirmPassword && confirmPassword !== '' && !matches && (
              <p className="text-[10px] text-red-500 mt-1.5 px-1 font-bold">
                Password tidak cocok!
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="register-submit-button"
            className="w-full py-3.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all mt-4 active:scale-[0.98] shadow-lg shadow-gray-200"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-gray-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

