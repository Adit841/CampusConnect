import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AlertCircle,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { extractAuthError, registerUser } from '../../services/authService.js';
import { Card, focusRing } from '../../components/ui/Card.jsx';

function RegisterPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [role, setRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bio: '',
    // Student fields
    enrollmentNo: '',
    rollNo: '',
    course: '',
    department: '',
    year: '',
    section: '',
    // Teacher fields
    employeeId: '',
    designation: '',
    officeRoom: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (role === 'STUDENT') {
      if (!formData.enrollmentNo.trim()) {
        errors.enrollmentNo = 'Enrollment number is required for students';
      }
    } else if (role === 'TEACHER') {
      if (!formData.employeeId.trim()) {
        errors.employeeId = 'Employee ID is required for teachers';
      }
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role,
        phone: formData.phone.trim() || null,
        bio: formData.bio.trim() || null,
      };

      if (role === 'STUDENT') {
        payload.enrollmentNo = formData.enrollmentNo.trim();
        payload.rollNo = formData.rollNo.trim() || null;
        payload.course = formData.course.trim() || null;
        payload.department = formData.department.trim() || null;
        payload.year = formData.year ? parseInt(formData.year, 10) : null;
        payload.section = formData.section.trim() || null;
      } else if (role === 'TEACHER') {
        payload.employeeId = formData.employeeId.trim();
        payload.department = formData.department.trim() || null;
        payload.designation = formData.designation.trim() || null;
        payload.officeRoom = formData.officeRoom.trim() || null;
      }

      const response = await registerUser(payload);
      signIn(response);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const { message, fieldErrors: apiErrors } = extractAuthError(err);
      setGeneralError(message);
      setFieldErrors(apiErrors || {});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center">
          <Link to="/" className={`inline-flex items-center gap-2.5 rounded-xl p-1.5 ${focusRing}`}>
            <span className="inline-flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <GraduationCap className="size-6" aria-hidden="true" />
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">CampusConnect</span>
          </Link>
        </div>
        <h1 className="mt-4 text-center text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Create your account
        </h1>
        <p className="mt-1.5 text-center text-sm text-slate-500 dark:text-slate-400">
          Join your campus community to access coursework, discussions, and college updates.
        </p>

        {/* Role Switcher Tabs */}
        <div className="mt-6 flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => {
              setRole('STUDENT');
              setFieldErrors({});
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              role === 'STUDENT'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="size-4" aria-hidden="true" />
            Student Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('TEACHER');
              setFieldErrors({});
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
              role === 'TEACHER'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="size-4" aria-hidden="true" />
            Faculty / Teacher
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
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
            {/* Account Details */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="size-4" aria-hidden="true" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    disabled={loading}
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                      fieldErrors.name
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600'
                    } ${focusRing}`}
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.name}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  College Email <span className="text-rose-500">*</span>
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
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                      fieldErrors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600'
                    } ${focusRing}`}
                    placeholder={role === 'STUDENT' ? 'student@college.edu' : 'faculty@college.edu'}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="size-4" aria-hidden="true" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border bg-white py-2 pl-9 pr-10 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                      fieldErrors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600'
                    } ${focusRing}`}
                    placeholder="Min. 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="size-4" aria-hidden="true" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={loading}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`block w-full rounded-lg border bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                      fieldErrors.confirmPassword
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600'
                    } ${focusRing}`}
                    placeholder="Repeat password"
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Role Specific Section */}
            <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                {role === 'STUDENT' ? 'Academic Details' : 'Faculty Details'}
              </p>

              {role === 'STUDENT' ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="enrollmentNo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Enrollment Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="enrollmentNo"
                      name="enrollmentNo"
                      type="text"
                      required
                      disabled={loading}
                      value={formData.enrollmentNo}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                        fieldErrors.enrollmentNo
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600'
                      } ${focusRing}`}
                      placeholder="e.g. EN2024001"
                    />
                    {fieldErrors.enrollmentNo && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.enrollmentNo}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="rollNo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Roll Number
                    </label>
                    <input
                      id="rollNo"
                      name="rollNo"
                      type="text"
                      disabled={loading}
                      value={formData.rollNo}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`}
                      placeholder="e.g. CS-042"
                    />
                  </div>

                  <div>
                    <label htmlFor="course" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Course / Degree
                    </label>
                    <input
                      id="course"
                      name="course"
                      type="text"
                      disabled={loading}
                      value={formData.course}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`}
                      placeholder="e.g. B.Tech / BCA"
                    />
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Department
                    </label>
                    <input
                      id="department"
                      name="department"
                      type="text"
                      disabled={loading}
                      value={formData.department}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`}
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Year
                    </label>
                    <select
                      id="year"
                      name="year"
                      disabled={loading}
                      value={formData.year}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="section" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Section
                    </label>
                    <input
                      id="section"
                      name="section"
                      type="text"
                      disabled={loading}
                      value={formData.section}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`}
                      placeholder="e.g. A"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="employeeId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Employee ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="employeeId"
                      name="employeeId"
                      type="text"
                      required
                      disabled={loading}
                      value={formData.employeeId}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100 ${
                        fieldErrors.employeeId
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:hover:border-slate-600'
                      } ${focusRing}`}
                      placeholder="e.g. EMP-9821"
                    />
                    {fieldErrors.employeeId && (
                      <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{fieldErrors.employeeId}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="teacherDepartment" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Department
                    </label>
                    <input
                      id="teacherDepartment"
                      name="department"
                      type="text"
                      disabled={loading}
                      value={formData.department}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`}
                      placeholder="e.g. Department of Engineering"
                    />
                  </div>

                  <div>
                    <label htmlFor="designation" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Designation
                    </label>
                    <input
                      id="designation"
                      name="designation"
                      type="text"
                      disabled={loading}
                      value={formData.designation}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`}
                      placeholder="e.g. Assistant Professor"
                    />
                  </div>

                  <div>
                    <label htmlFor="officeRoom" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Office / Room
                    </label>
                    <input
                      id="officeRoom"
                      name="officeRoom"
                      type="text"
                      disabled={loading}
                      value={formData.officeRoom}
                      onChange={handleChange}
                      className={`mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${focusRing}`}
                      placeholder="e.g. Block C, Room 204"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 ${focusRing}`}
              >
                {loading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Creating account…
                  </>
                ) : (
                  `Complete ${role === 'STUDENT' ? 'Student' : 'Faculty'} Registration`
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-5 text-center dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className={`font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 ${focusRing}`}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default RegisterPage;
