import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * Development-Only Authentication Modal.
 *
 * Allows developers and QA to sign in with real database accounts or register
 * test users to obtain real JWT tokens for testing chat end-to-end.
 *
 * This component is strictly disabled and completely inactive in production builds.
 */
export default function DevAuthModal({ open, onClose }) {
  if (!import.meta.env.DEV) return null;

  const {
    currentUser,
    token,
    isDemo,
    loginWithCredentials,
    registerWithCredentials,
    signOut,
  } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [enrollmentNo, setEnrollmentNo] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!open) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await loginWithCredentials(email.trim(), password);
      setSuccess('Successfully signed in with database account!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        enrollmentNo: role === 'STUDENT' ? (enrollmentNo.trim() || `ENR-${Date.now()}`) : undefined,
        employeeId: role === 'TEACHER' ? (employeeId.trim() || `EMP-${Date.now()}`) : undefined,
      };
      await registerWithCredentials(payload);
      setSuccess('Account created and signed in successfully!');
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    setSuccess('Signed out. Switched back to development demo mode.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Dev Account Switcher"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-amber-300">
        {/* Banner */}
        <div className="bg-amber-500 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-amber-700/60 px-2 py-0.5 rounded">
              DEV ONLY
            </span>
            <h2 className="text-sm font-semibold">Database Authentication</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-lg font-bold p-1 leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Current status info */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-700">Current Session: </span>
              {token ? (
                <span className="text-emerald-700 font-medium">
                  {currentUser?.name || currentUser?.email} (Real JWT active)
                </span>
              ) : (
                <span className="text-amber-700 font-medium">
                  Demo Mode (No JWT token — API calls fail)
                </span>
              )}
            </div>
            {token && (
              <button
                type="button"
                onClick={handleSignOut}
                className="text-red-600 hover:underline font-semibold ml-2"
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${
              mode === 'login'
                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white'
                : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Sign In with Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors ${
              mode === 'register'
                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white'
                : 'text-slate-500 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            Register New Test User
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
              {success}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alice@campusconnect.local"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Authenticating…' : 'Sign In with JWT'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alice Smith"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alice@campusconnect.local"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>
              </div>

              {role === 'STUDENT' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Enrollment No (optional, auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    value={enrollmentNo}
                    onChange={(e) => setEnrollmentNo(e.target.value)}
                    placeholder="e.g. STU-1001"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Employee ID (optional, auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. TCH-2001"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Registering…' : 'Create & Sign In'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
