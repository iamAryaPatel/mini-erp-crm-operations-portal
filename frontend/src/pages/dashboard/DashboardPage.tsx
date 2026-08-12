import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { DashboardStats } from '../../types';
import { 
  Users, Package, Warehouse, FileText, 
  AlertTriangle, CheckCircle2, ChevronRight 
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data.data);
      } catch {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="page-header mb-8">
          <div className="skeleton skeleton-text" style={{ width: '200px', height: '32px' }} />
          <div className="skeleton skeleton-text" style={{ width: '300px', height: '20px' }} />
        </div>
        <div className="stats-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="stat-card skeleton" style={{ height: '140px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><AlertTriangle /></div>
        <div className="empty-title">{error}</div>
        <button className="btn btn-primary mt-4" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!stats) return null;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { Draft: 'badge-warning', Confirmed: 'badge-success', Cancelled: 'badge-danger' };
    return map[status] || 'badge-default';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{getGreeting()}</h1>
          <p className="page-subtitle">Here's an overview of your operations today</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
            <Users />
          </div>
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.customers.total.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Package />
          </div>
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.products.total.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <Warehouse />
          </div>
          <div className="stat-label">Total Stock Units</div>
          <div className="stat-value">{stats.products.total_stock.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ borderColor: stats.lowStockCount > 0 ? 'var(--color-danger-light)' : '' }}>
          <div className="stat-icon" style={{ background: stats.lowStockCount > 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)', color: stats.lowStockCount > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
            {stats.lowStockCount > 0 ? <AlertTriangle /> : <CheckCircle2 />}
          </div>
          <div className="stat-label">Low Stock Products</div>
          <div className="stat-value" style={{ color: stats.lowStockCount > 0 ? 'var(--color-danger)' : undefined }}>
            {stats.lowStockCount.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <FileText />
          </div>
          <div className="stat-label">Draft Challans</div>
          <div className="stat-value">{stats.challans.draft.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <CheckCircle2 />
          </div>
          <div className="stat-label">Confirmed Challans</div>
          <div className="stat-value">{stats.challans.confirmed.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--sp-5)' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Challans</h3>
            <Link to="/challans" className="btn btn-secondary btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats.recentChallans.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
                <p className="text-muted">No challans yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Challan #</th>
                      <th>Customer</th>
                      <th>Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentChallans.map((c) => (
                      <tr key={c.id}>
                        <td className="font-mono"><Link to={`/challans/${c.id}`}>{c.challan_number}</Link></td>
                        <td className="font-medium">{c.customer_name}</td>
                        <td>{c.total_quantity}</td>
                        <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Stock Movements</h3>
            <Link to="/inventory" className="btn btn-secondary btn-sm">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats.recentMovements.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
                <p className="text-muted">No stock movements yet</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Type</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentMovements.map((m) => (
                      <tr key={m.id}>
                        <td className="font-medium">{m.product_name}</td>
                        <td>{m.quantity}</td>
                        <td>
                          <span className={`badge ${m.movement_type === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                            {m.movement_type}
                          </span>
                        </td>
                        <td className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
