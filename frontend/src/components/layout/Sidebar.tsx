import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import {
  LayoutDashboard, Users, Package, Warehouse, FileText, Shield, LogOut
} from 'lucide-react';
import './Sidebar.css';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { path: '/customers', label: 'Customers', icon: <Users size={18} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { path: '/products', label: 'Products', icon: <Package size={18} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  { path: '/inventory', label: 'Inventory', icon: <Warehouse size={18} />, roles: ['ADMIN', 'WAREHOUSE', 'ACCOUNTS'] },
  { path: '/challans', label: 'Challans', icon: <FileText size={18} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
  { path: '/users', label: 'Users', icon: <Shield size={18} />, roles: ['ADMIN'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const roleColor: Record<string, string> = {
    ADMIN: '#3b82f6',
    SALES: '#10b981',
    WAREHOUSE: '#f59e0b',
    ACCOUNTS: '#8b5cf6',
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">Mini ERP</span>
            <span className="sidebar-brand-tag">Operations</span>
          </div>
        </div>

        <div className="sidebar-section-label">Navigation</div>

        <nav className="sidebar-nav">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive || (item.path !== '/dashboard' && location.pathname.startsWith(item.path)) ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-info">
            <div
              className="sidebar-user-avatar"
              style={{ background: roleColor[user?.role || 'ADMIN'] || '#3b82f6' }}
            >
              {user?.role.charAt(0)}
            </div>
            <div className="sidebar-user-meta">
              <span className="sidebar-user-role">{user?.role}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
