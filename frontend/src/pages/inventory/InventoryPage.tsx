import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { Product, StockMovement, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  PackageOpen, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, 
  Plus, X, Box, History
} from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<{ total_products: number; total_stock: number; low_stock_count: number } | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movPagination, setMovPagination] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stock' | 'movements'>('stock');

  // Add movement form
  const [showForm, setShowForm] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [movForm, setMovForm] = useState({ product_id: '', quantity: '', movement_type: 'IN', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const canManage = user && ['ADMIN', 'WAREHOUSE'].includes(user.role);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, movRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/products', { params: { limit: 100, low_stock: tab === 'stock' ? undefined : undefined } }),
        api.get('/inventory/movements', { params: { page: movPagination.page, limit: 20 } }),
      ]);
      setStats(statsRes.data.data);
      setProducts(productsRes.data.data);
      setAllProducts(productsRes.data.data);
      setMovements(movRes.data.data);
      setMovPagination(movRes.data.pagination);
    } catch {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  }, [tab, movPagination.page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movForm.product_id || !movForm.quantity || !movForm.reason) {
      toast.error('All fields are required'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/inventory/movements', {
        product_id: movForm.product_id,
        quantity: Number(movForm.quantity),
        movement_type: movForm.movement_type,
        reason: movForm.reason,
      });
      toast.success('Stock movement recorded');
      setMovForm({ product_id: '', quantity: '', movement_type: 'IN', reason: '' });
      setShowForm(false);
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to add movement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const isLowStock = (p: Product) => p.current_stock <= p.minimum_stock_quantity;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Track stock levels and movement history</p>
        </div>
        {canManage && (
          <button className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`} onClick={() => setShowForm(!showForm)}>
            {showForm ? <><X size={16}/> Close Form</> : <><Plus size={16}/> Add Movement</>}
          </button>
        )}
      </div>

      {stats && (
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}><PackageOpen /></div>
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{stats.total_products.toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}><Box /></div>
            <div className="stat-label">Total Stock Units</div>
            <div className="stat-value">{stats.total_stock.toLocaleString()}</div>
          </div>
          <div className="stat-card" style={{ borderColor: stats.low_stock_count > 0 ? 'var(--color-danger-light)' : '' }}>
            <div className="stat-icon" style={{ background: stats.low_stock_count > 0 ? 'var(--color-danger-light)' : 'var(--color-success-light)', color: stats.low_stock_count > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {stats.low_stock_count > 0 ? <AlertTriangle /> : <CheckCircle2 />}
            </div>
            <div className="stat-label">Low Stock Items</div>
            <div className="stat-value" style={{ color: stats.low_stock_count > 0 ? 'var(--color-danger)' : undefined }}>{stats.low_stock_count.toLocaleString()}</div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="card mb-6">
          <div className="card-header"><h3 className="card-title">Record Stock Movement</h3></div>
          <div className="card-body">
            <form onSubmit={handleAddMovement}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Product *</label>
                  <select className="form-select" value={movForm.product_id}
                    onChange={(e) => setMovForm({ ...movForm, product_id: e.target.value })}>
                    <option value="">Select product</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.product_name} ({p.sku}) — Stock: {p.current_stock}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Movement Type *</label>
                  <select className="form-select" value={movForm.movement_type}
                    onChange={(e) => setMovForm({ ...movForm, movement_type: e.target.value })}>
                    <option value="IN">IN (Purchase / Adjustment)</option>
                    <option value="OUT">OUT (Adjustment)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity *</label>
                  <input className="form-input" type="number" min="1" value={movForm.quantity}
                    onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason *</label>
                  <input className="form-input" value={movForm.reason} placeholder="e.g., Purchase order PO-001"
                    onChange={(e) => setMovForm({ ...movForm, reason: e.target.value })} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Recording...' : 'Record Movement'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab-btn ${tab === 'stock' ? 'active' : ''}`}
          onClick={() => setTab('stock')}>
          <Box size={14} style={{ display: 'inline', marginRight: '4px' }} /> Stock Levels
        </button>
        <button className={`tab-btn ${tab === 'movements' ? 'active' : ''}`}
          onClick={() => setTab('movements')}>
          <History size={14} style={{ display: 'inline', marginRight: '4px' }} /> Movement History
        </button>
      </div>

      {tab === 'stock' ? (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Current Stock</th><th>Min Stock</th><th>Warehouse</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.product_name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                    <td style={{ fontWeight: 600, color: isLowStock(p) ? '#ef4444' : '#10b981' }}>{p.current_stock}</td>
                    <td>{p.minimum_stock_quantity}</td>
                    <td className="text-muted">{p.warehouse_location || '—'}</td>
                    <td>
                      {isLowStock(p) ? (
                        <span className="badge badge-danger">Low Stock</span>
                      ) : (
                        <span className="badge badge-success">In Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>Quantity</th><th>Type</th><th>Reason</th><th>By</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state" style={{ padding: 'var(--space-8)' }}>No movements recorded</div></td></tr>
                ) : movements.map((m) => (
                  <tr key={m.id}>
                    <td className="font-medium">{m.product_name}<div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{m.sku}</div></td>
                    <td style={{ fontWeight: 600 }}>{m.quantity}</td>
                    <td><span className={`badge ${m.movement_type === 'IN' ? 'badge-success' : 'badge-danger'}`}>{m.movement_type}</span></td>
                    <td>{m.reason}</td>
                    <td className="text-muted">{m.creator_name || '—'}</td>
                    <td className="text-muted">{new Date(m.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {movPagination.totalPages > 1 && (
            <div className="pagination">
              <span className="pagination-info">Page {movPagination.page} of {movPagination.totalPages}</span>
              <div className="pagination-buttons">
                <button className="btn btn-secondary btn-sm" disabled={movPagination.page <= 1}
                  onClick={() => setMovPagination({ ...movPagination, page: movPagination.page - 1 })}>
                  <ChevronLeft size={16} /> Previous
                </button>
                <button className="btn btn-secondary btn-sm" disabled={movPagination.page >= movPagination.totalPages}
                  onClick={() => setMovPagination({ ...movPagination, page: movPagination.page + 1 })}>
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
