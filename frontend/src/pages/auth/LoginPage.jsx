import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AlertCircle, Eye, EyeOff, GraduationCap, Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { extractAuthError, loginUser } from '../../services/authService.js';
import { Card, focusRing } from '../../components/ui/Card.jsx';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, startDemo } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const redirectTarget = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      signIn(response);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      const { message, fieldErrors: apiErrors } = extractAuthError(err);
      setGeneralError(message);
      setFieldErrors(apiErrors || {});
    } finally {
      setLoading(false);
    }
  };

  const handleDevDemo = (role) => {
    startDemo(role);
    navigate(redirectTarget, { replace: true });
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link to="/" className={`inline-flex items-center gap-2.5 rounded-xl p-1.5 ${focusRing}`}>
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">CampusConnect</span>
          </Link>
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Sign in to your account
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
          Enter your credentials to access academics, announcements, and campus tools.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="px-6 py-8 sm:px-10">
          {generalError && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
              <div className="flex-1 font-medium">{generalError}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="size-4" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                  }}
                  className={`block w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 ${
                    fieldErrors.email
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500/50'
                      : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600'
                  } ${focusRing}`}
                  placeholder="name@college.edu"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="size-4" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                  }}
                  className={`block w-full rounded-lg border bg-white py-2 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 disabled:opacity-60 dark:bg-slate-900 dark:text-slate-100 ${
                    fieldErrors.password
                      ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-500/50'
                      : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600'
                  } ${focusRing}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Signing in…
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className={`font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ${focusRing}`}
              >
                Register here
              </Link>
            </p>
          </div>

          {import.meta.env.DEV && (
            <div className="mt-6 border-t border-amber-200/60 bg-amber-50/50 p-3 rounded-lg text-xs text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-200">
              <p className="font-semibold mb-1.5">Dev Preview (Simulated Role):</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDevDemo('STUDENT')}
                  className="rounded bg-amber-100 px-2 py-1 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-200"
                >
                  Student Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDevDemo('TEACHER')}
                  className="rounded bg-amber-100 px-2 py-1 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-200"
                >
                  Teacher Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleDevDemo('ADMIN')}
                  className="rounded bg-amber-100 px-2 py-1 text-amber-900 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-200"
                >
                  Admin Demo
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
