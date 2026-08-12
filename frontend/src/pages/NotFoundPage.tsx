import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--sp-6)',
      background: 'var(--color-bg)'
    }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', padding: 'var(--sp-10)' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          background: 'var(--color-danger-light)',
          color: 'var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--sp-6)'
        }}>
          <AlertCircle size={32} />
        </div>
        
        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: 800, color: 'var(--color-text)', marginBottom: 'var(--sp-2)', letterSpacing: '-0.02em' }}>404</h1>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 'var(--sp-4)' }}>Page Not Found</h2>
        
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--sp-8)', lineHeight: 'var(--leading-relaxed)' }}>
          The page you are looking for doesn't exist, has been moved, or is temporarily unavailable.
        </p>

        <Link 
          to={isAuthenticated ? '/dashboard' : '/'} 
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Home size={18} /> Back to {isAuthenticated ? 'Dashboard' : 'Home'}
        </Link>
      </div>
    </div>
  );
}
