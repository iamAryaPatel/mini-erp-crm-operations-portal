import { useState, useEffect } from 'react';
import api from '../../services/api';
import type { User } from '../../types';
import { ShieldAlert } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        setUsers(res.data.data);
      } catch { /* empty */ } finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><ShieldAlert /></div>
        <div className="empty-title">No users found</div>
      </div>
    );
  }

  const roleBadge = (role: string) => {
    const m: Record<string, string> = { ADMIN: 'badge-info', SALES: 'badge-success', WAREHOUSE: 'badge-warning', ACCOUNTS: 'badge-default' };
    return m[role] || 'badge-default';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">System users and role-based access control</p>
        </div>
      </div>
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="font-medium text-text">{u.name}</div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`badge ${roleBadge(u.role)}`}>{u.role}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
