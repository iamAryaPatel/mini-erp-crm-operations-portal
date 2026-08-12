import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import type { Customer, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Users as UsersIcon, AlertCircle, ChevronLeft, ChevronRight,
  Eye, Edit
} from 'lucide-react';

export default function CustomerListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const customerType = searchParams.get('customer_type') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      if (customerType) params.customer_type = customerType;
      const response = await api.get('/customers', { params });
      setCustomers(response.data.data);
      setPagination(response.data.pagination);
    } catch {
      setError('Failed to load customers.');
    } finally {
      setLoading(false);
    }
  }, [search, status, customerType, page]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const canManage = user && ['ADMIN', 'SALES'].includes(user.role);
  const statusBadge = (s: string) => {
    const m: Record<string, string> = { Active: 'badge-success', Lead: 'badge-warning', Inactive: 'badge-danger' };
    return m[s] || 'badge-default';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage your retail and wholesale customer base</p>
        </div>
        {canManage && (
          <Link to="/customers/new" className="btn btn-primary">
            <Plus size={16} /> Add Customer
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} className="text-muted" style={{ position: 'absolute', left: '12px' }} />
          <input 
            className="form-input search-input" 
            placeholder="Search name, business, mobile..." 
            value={search}
            onChange={(e) => updateParam('search', e.target.value)} 
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <select className="form-select" value={status} onChange={(e) => updateParam('status', e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="form-select" value={customerType} onChange={(e) => updateParam('customer_type', e.target.value)}>
          <option value="">All Types</option>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
        </select>
      </div>

      {error && (
        <div className="empty-state">
          <div className="empty-icon"><AlertCircle /></div>
          <div className="empty-title">{error}</div>
        </div>
      )}

      {loading ? (
        <div className="p-8">
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
          <div className="skeleton skeleton-row" />
        </div>
      ) : customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><UsersIcon /></div>
          <div className="empty-title">No customers found</div>
          <p className="text-muted">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Business</th><th>Mobile</th><th>Type</th><th>Status</th><th>Follow-up</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-medium text-text">{c.customer_name}</div>
                      <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>{c.email || '—'}</div>
                    </td>
                    <td>{c.business_name}</td>
                    <td className="font-mono">{c.mobile_number}</td>
                    <td><span className="badge badge-default">{c.customer_type}</span></td>
                    <td><span className={`badge ${statusBadge(c.status)}`}>{c.status}</span></td>
                    <td className="text-muted">{c.follow_up_date ? new Date(c.follow_up_date).toLocaleDateString() : '—'}</td>
                    <td>
                      <div className="flex gap-2">
                        <Link to={`/customers/${c.id}`} className="btn btn-secondary btn-icon" title="View details">
                          <Eye size={16} />
                        </Link>
                        {canManage && (
                          <Link to={`/customers/${c.id}/edit`} className="btn btn-secondary btn-icon" title="Edit customer">
                            <Edit size={16} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
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
