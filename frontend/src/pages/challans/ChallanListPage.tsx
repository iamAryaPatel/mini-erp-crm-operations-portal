import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import type { Challan, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, FileText, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';

export default function ChallanListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [challans, setChallans] = useState<Challan[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchChallans = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      const response = await api.get('/challans', { params });
      setChallans(response.data.data);
      setPagination(response.data.pagination);
    } catch { /* empty */ } finally { setLoading(false); }
  }, [search, status, page]);

  useEffect(() => { fetchChallans(); }, [fetchChallans]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const canCreate = user && ['ADMIN', 'SALES'].includes(user.role);
  const statusBadge = (s: string) => {
    const m: Record<string, string> = { Draft: 'badge-warning', Confirmed: 'badge-success', Cancelled: 'badge-danger' };
    return m[s] || 'badge-default';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Challans</h1>
          <p className="page-subtitle">Sales challans and delivery notes</p>
        </div>
        {canCreate && (
          <Link to="/challans/new" className="btn btn-primary">
            <Plus size={16} /> Create Challan
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} className="text-muted" style={{ position: 'absolute', left: '12px' }} />
          <input 
            className="form-input search-input" 
            placeholder="Search challan # or customer..." 
            value={search}
            onChange={(e) => updateParam('search', e.target.value)} 
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <select className="form-select" value={status} onChange={(e) => updateParam('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="p-8">
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
        </div>
      ) : challans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FileText /></div>
          <div className="empty-title">No challans found</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Challan #</th><th>Customer</th><th>Total Qty</th><th>Status</th><th>Created By</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium" style={{ fontFamily: 'monospace' }}>
                      <Link to={`/challans/${c.id}`}>{c.challan_number}</Link>
                    </td>
                    <td>
                      <div className="font-medium text-text">{c.customer_name}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>{c.business_name}</div>
                    </td>
                    <td>{c.total_quantity}</td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td className="text-muted">{c.creator_name || '—'}</td>
                    <td className="text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/challans/${c.id}`} className="btn btn-secondary btn-icon" title="View details">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">Page {pagination.page} of {pagination.totalPages}</span>
              <div className="pagination-buttons">
                <button className="btn btn-secondary btn-sm" disabled={pagination.page <= 1}
                  onClick={() => updateParam('page', String(pagination.page - 1))}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <button className="btn btn-secondary btn-sm" disabled={pagination.page >= pagination.totalPages}
                  onClick={() => updateParam('page', String(pagination.page + 1))}>
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
