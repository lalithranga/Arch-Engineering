import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HardHat, AlertCircle } from 'lucide-react';
import { Input } from '../components/ui/Input.jsx';
import Button from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { COMPANY_NAME } from '../utils/constants.js';

/**
 * Login.jsx
 * ----------------------------------------------------------------------
 * Admin-only sign-in screen. There is intentionally NO public sign-up
 * link anywhere on this page — admin accounts are provisioned manually
 * in the Supabase Dashboard (Authentication > Users > Invite/Add User),
 * which keeps the attack surface small: there is no client-exposed path
 * to create a privileged account.
 *
 * On success, redirects back to whatever protected route the visitor
 * originally tried to reach (see ProtectedRoute in App.jsx), or to
 * /admin by default.
 * ----------------------------------------------------------------------
 */
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const redirectTo = location.state?.from?.pathname || '/admin';

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      // Supabase returns a generic "Invalid login credentials" message —
      // deliberately not specific about whether the email exists, so we
      // pass it through as-is rather than guessing at a friendlier wording.
      setError(err.message || 'Sign in failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <HardHat className="h-8 w-8 text-brand" strokeWidth={1.5} />
          <h1 className="font-display text-xl font-semibold text-ink">{COMPANY_NAME}</h1>
          <p className="text-sm text-ink-faint">Admin Dashboard Sign In</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-sm border border-slate-200 bg-white p-8 shadow-card"
        >
          <Input
            id="email"
            type="email"
            label="Email Address"
            placeholder="admin@summitstone.co.nz"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="flex items-start gap-2 rounded-sm bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-1">
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-ink-faint">
          This area is restricted to authorized staff. Accounts are
          provisioned internally — there is no public sign-up.
        </p>
      </div>
    </div>
  );
}
