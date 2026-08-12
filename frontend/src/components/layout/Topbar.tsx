import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, Sun, Moon } from 'lucide-react';
import './Topbar.css';

interface TopbarProps {
  onMenuToggle: () => void;
  pageTitle?: string;
}

export default function Topbar({ onMenuToggle, pageTitle }: TopbarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const roleColor: Record<string, string> = {
    ADMIN: '#3b82f6',
    SALES: '#10b981',
    WAREHOUSE: '#f59e0b',
    ACCOUNTS: '#8b5cf6',
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuToggle} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        {pageTitle && <h2 className="topbar-page-title">{pageTitle}</h2>}
      </div>

      <div className="topbar-right">
        <button
          className="btn-icon"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="topbar-user">
          <span className="topbar-role-badge" style={{ background: roleColor[user?.role || 'ADMIN'] }}>
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
}
