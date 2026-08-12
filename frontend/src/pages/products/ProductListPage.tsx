import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import type { Product, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, Search, Package as PackageIcon, AlertCircle, ChevronLeft, ChevronRight,
  Edit
} from 'lucide-react';

export default function ProductListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const lowStock = searchParams.get('low_stock') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (lowStock) params.low_stock = lowStock;
      const response = await api.get('/products', { params });
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, lowStock, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    setSearchParams(params);
  };

  const canManage = user && ['ADMIN', 'WAREHOUSE'].includes(user.role);
  const isLowStock = (p: Product) => p.current_stock <= p.minimum_stock_quantity;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage product catalog and pricing</p>
        </div>
        {canManage && (
          <Link to="/products/new" className="btn btn-primary">
            <Plus size={16} /> Add Product
          </Link>
        )}
      </div>

      <div className="filters-bar">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} className="text-muted" style={{ position: 'absolute', left: '12px' }} />
          <input 
            className="form-input search-input" 
            placeholder="Search name or SKU..." 
            value={search}
            onChange={(e) => updateParam('search', e.target.value)} 
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <select className="form-select" value={category} onChange={(e) => updateParam('category', e.target.value)}>
          <option value="">All Categories</option>
          <option value="Cables">Cables</option>
          <option value="Peripherals">Peripherals</option>
          <option value="Accessories">Accessories</option>
        </select>
        <label className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', cursor: 'pointer', userSelect: 'none' }}>
          <input type="checkbox" checked={lowStock === 'true'} onChange={(e) => updateParam('low_stock', e.target.checked ? 'true' : '')} />
          Low stock only
        </label>
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
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><PackageIcon /></div>
          <div className="empty-title">No products found</div>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Min Stock</th><th>Warehouse</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.product_name}</td>
                    <td style={{ fontFamily: 'monospace' }}>{p.sku}</td>
                    <td><span className="badge badge-default">{p.category}</span></td>
                    <td>₹{Number(p.unit_price).toLocaleString()}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: isLowStock(p) ? '#ef4444' : '#10b981' }}>
                        {p.current_stock}
                      </span>
                      {isLowStock(p) && <span className="badge badge-danger" style={{ marginLeft: '8px' }}>Low</span>}
                    </td>
                    <td>{p.minimum_stock_quantity}</td>
                    <td className="text-muted">{p.warehouse_location || '—'}</td>
                    <td>
                      {canManage && (
                        <Link to={`/products/${p.id}/edit`} className="btn btn-secondary btn-icon" title="Edit product">
                          <Edit size={16} />
                        </Link>
                      )}
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
