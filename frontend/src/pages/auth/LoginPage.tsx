import { useState, FormEvent } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, EyeOff, Sun, Moon, Zap } from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Email is required'); return; }
    if (!password.trim()) { setError('Password is required'); return; }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Invalid credentials. Please try again.');
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (emailVal: string) => {
    setEmail(emailVal);
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-theme-toggle">
        <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Left Panel */}
      <div className="login-branding">
        <div className="login-branding-content">
          <div className="login-branding-logo">
            <Zap size={24} />
          </div>
          <h1 className="login-branding-title">Mini ERP</h1>
          <p className="login-branding-subtitle">
            Manage your entire distribution operation — customers, inventory, sales challans
            and business analytics — in one unified platform.
          </p>
          <div className="login-branding-features">
            <div className="login-feature">
              <span className="login-feature-dot" />
              Role-based access control
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Real-time inventory tracking
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Sales challan management
            </div>
            <div className="login-feature">
              <span className="login-feature-dot" />
              Customer CRM & follow-ups
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="login-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="login-test-creds">
            <div className="login-test-label">Demo Accounts</div>
            <div className="login-test-grid">
              <button type="button" className="login-test-item" onClick={() => fillCredentials('admin1@erp-demo.com')}>
                <span className="login-test-role admin">A</span>
                <span>Admin</span>
              </button>
              <button type="button" className="login-test-item" onClick={() => fillCredentials('sales1@erp-demo.com')}>
                <span className="login-test-role sales">S</span>
                <span>Sales</span>
              </button>
              <button type="button" className="login-test-item" onClick={() => fillCredentials('warehouse1@erp-demo.com')}>
                <span className="login-test-role warehouse">W</span>
                <span>Warehouse</span>
              </button>
              <button type="button" className="login-test-item" onClick={() => fillCredentials('accounts1@erp-demo.com')}>
                <span className="login-test-role accounts">AC</span>
                <span>Accounts</span>
              </button>
            </div>
          </div>

          <div className="login-footer-link">
            <Link to="/">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
