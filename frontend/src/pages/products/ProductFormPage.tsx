import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

interface FormData {
  product_name: string; sku: string; category: string; unit_price: string;
  current_stock: string; minimum_stock_quantity: string; warehouse_location: string;
}

const initialForm: FormData = {
  product_name: '', sku: '', category: '', unit_price: '',
  current_stock: '0', minimum_stock_quantity: '0', warehouse_location: '',
};

export default function ProductFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (isEdit) {
      api.get(`/products/${id}`).then((res) => {
        const p = res.data.data;
        setForm({
          product_name: p.product_name, sku: p.sku, category: p.category,
          unit_price: String(p.unit_price), current_stock: String(p.current_stock),
          minimum_stock_quantity: String(p.minimum_stock_quantity),
          warehouse_location: p.warehouse_location || '',
        });
        setFetching(false);
      }).catch(() => { toast.error('Failed to load product'); navigate('/products'); });
    }
  }, [id, isEdit, navigate]);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.product_name.trim()) e.product_name = 'Required';
    if (!form.sku.trim()) e.sku = 'Required';
    if (!form.category.trim()) e.category = 'Required';
    if (!form.unit_price || Number(form.unit_price) < 0) e.unit_price = 'Must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = {
        product_name: form.product_name, sku: form.sku, category: form.category,
        unit_price: Number(form.unit_price),
        ...(!isEdit && { current_stock: Number(form.current_stock) }),
        minimum_stock_quantity: Number(form.minimum_stock_quantity),
        warehouse_location: form.warehouse_location || null,
      };
      if (isEdit) {
        await api.put(`/products/${id}`, data);
        toast.success('Product updated');
      } else {
        await api.post('/products', data);
        toast.success('Product created');
      }
      navigate('/products');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{isEdit ? 'Edit Product' : 'Add Product'}</h1></div>
        <button className="btn btn-secondary" onClick={() => navigate('/products')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input className={`form-input ${errors.product_name ? 'error' : ''}`} value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
              {errors.product_name && <div className="form-error">{errors.product_name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input className={`form-input ${errors.sku ? 'error' : ''}`} value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })} />
              {errors.sku && <div className="form-error">{errors.sku}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input className={`form-input ${errors.category ? 'error' : ''}`} value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })} />
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input className={`form-input ${errors.unit_price ? 'error' : ''}`} type="number" step="0.01" value={form.unit_price}
                onChange={(e) => setForm({ ...form, unit_price: e.target.value })} />
              {errors.unit_price && <div className="form-error">{errors.unit_price}</div>}
            </div>
            {!isEdit && (
              <div className="form-group">
                <label className="form-label">Initial Stock</label>
                <input className="form-input" type="number" value={form.current_stock}
                  onChange={(e) => setForm({ ...form, current_stock: e.target.value })} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Minimum Stock Quantity</label>
              <input className="form-input" type="number" value={form.minimum_stock_quantity}
                onChange={(e) => setForm({ ...form, minimum_stock_quantity: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Warehouse Location</label>
              <input className="form-input" value={form.warehouse_location}
                onChange={(e) => setForm({ ...form, warehouse_location: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={16}/> {isEdit ? 'Update Product' : 'Create Product'}</>}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
          </div>
        </form>
      </div></div>
    </div>
  );
}
