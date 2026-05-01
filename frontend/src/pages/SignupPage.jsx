import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member',
    adminSignupCode: '',
  });
  const [showPwd, setShowPwd]   = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { signup }  = useAuth();
  const navigate    = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email || !form.password)
      return setError('All required fields must be filled.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (form.role === 'admin' && !form.adminSignupCode.trim())
      return setError('Admin signup code is required for admin accounts.');

    setLoading(true);
    try {
      await signup(form.name, form.email, form.password, form.role, form.adminSignupCode);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <CheckSquare size={22} className="text-white" />
        </div>

        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Join TaskFlow and start managing work</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              placeholder="Jane Smith"
              autoComplete="name"
              autoFocus
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field"
              placeholder="jane@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input-field pr-10"
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Account type
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="input-field"
            >
              <option value="member">Member — join and work on projects</option>
              <option value="admin">Admin — create projects and manage teams</option>
            </select>
          </div>

          {/* Admin code */}
          {form.role === 'admin' && (
            <div className="animate-fade-in">
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                <ShieldCheck size={14} className="text-violet-500" />
                Admin signup code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  name="adminSignupCode"
                  value={form.adminSignupCode}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Enter the admin access code"
                />
                <button
                  type="button"
                  onClick={() => setShowCode((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showCode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Contact your organization to get the admin access code.
              </p>
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full gap-2 py-3">
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating account…
              </>
            ) : (
              <>
                Create account
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
