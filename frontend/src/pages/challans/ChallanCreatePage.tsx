import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { Customer, Product } from '../../types';
import { ArrowLeft, Save, CheckCircle, Plus, X, AlertTriangle } from 'lucide-react';

interface ChallanItemRow {
  product_id: string;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  available_stock: number;
}

export default function ChallanCreatePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<ChallanItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers', { params: { limit: 100, status: 'Active' } }),
          api.get('/products', { params: { limit: 100 } }),
        ]);
        setCustomers(custRes.data.data);
        setProducts(prodRes.data.data);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addItem = () => {
    setItems([...items, { product_id: '', product_name: '', sku: '', unit_price: 0, quantity: 1, available_stock: 0 }]);
  };

  const updateItem = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    // Check if product already added
    const existing = items.findIndex((item, i) => i !== index && item.product_id === productId);
    if (existing >= 0) {
      toast.error('Product already added. Adjust quantity instead.');
      return;
    }
    const updated = [...items];
    updated[index] = {
      product_id: product.id,
      product_name: product.product_name,
      sku: product.sku,
      unit_price: Number(product.unit_price),
      quantity: updated[index]?.quantity || 1,
      available_stock: product.current_stock,
    };
    setItems(updated);
  };

  const updateQuantity = (index: number, qty: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index]!, quantity: Math.max(1, qty) };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSave = async (confirm: boolean) => {
    if (!customerId) { toast.error('Please select a customer'); return; }
    if (items.length === 0 || items.some(i => !i.product_id)) { toast.error('Please add at least one product'); return; }

    if (confirm) {
      setConfirmDialog(true);
      return;
    }

    await submitChallan(false);
  };

  const submitChallan = async (confirm: boolean) => {
    setSubmitting(true);
    setConfirmDialog(false);
    try {
      const response = await api.post('/challans', {
        customer_id: customerId,
        items: items.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
      });

      if (confirm) {
        try {
          await api.post(`/challans/${response.data.data.id}/confirm`);
          toast.success('Challan created and confirmed!');
        } catch (err: unknown) {
          const axiosErr = err as { response?: { data?: { message?: string; details?: { productName?: string; available?: number; requested?: number } } } };
          const details = axiosErr.response?.data?.details;
          if (details && 'available' in details) {
            toast.error(`Insufficient stock for ${details.productName}: available ${details.available}, requested ${details.requested}`);
          } else {
            toast.error(axiosErr.response?.data?.message || 'Failed to confirm challan');
          }
          navigate(`/challans/${response.data.data.id}`);
          return;
        }
      } else {
        toast.success('Challan saved as draft');
      }
      navigate('/challans');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to create challan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Create Challan</h1></div>
        <button className="btn btn-secondary" onClick={() => navigate('/challans')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="card mb-6">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.customer_name} — {c.business_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <div className="card-header">
          <h3 className="card-title">Products</h3>
          <button className="btn btn-primary btn-sm" onClick={addItem}>
            <Plus size={14} /> Add Product
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--sp-8)' }}>
              <p className="text-muted">No products added. Click "+ Add Product" to begin.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>Available</th><th>Quantity</th><th>Unit Price</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <select className="form-select" value={item.product_id}
                        onChange={(e) => updateItem(index, e.target.value)}>
                        <option value="">Select product</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.product_name} ({p.sku})</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      {item.product_id ? (
                        <span style={{ fontWeight: 600, color: item.available_stock < item.quantity ? '#ef4444' : '#10b981' }}>
                          {item.available_stock}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ width: '120px' }}>
                      <input className="form-input" type="number" min="1" value={item.quantity}
                        onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)} style={{ width: '100px' }} />
                    </td>
                    <td>{item.product_id ? `₹${item.unit_price.toLocaleString()}` : '—'}</td>
                    <td>
                      <button className="btn btn-danger btn-icon" onClick={() => removeItem(index)} title="Remove item">
                        <X size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <div className="card mb-6">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <div><span className="text-muted">Total Quantity:</span> <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{totalQuantity}</span></div>
              <div className="flex gap-3">
                <button className="btn btn-secondary" onClick={() => handleSave(false)} disabled={submitting}>
                  {submitting ? 'Saving...' : <><Save size={16} /> Save Draft</>}
                </button>
                <button className="btn btn-success" onClick={() => handleSave(true)} disabled={submitting}>
                  <CheckCircle size={16} /> Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDialog && (
        <div className="modal-overlay" onClick={() => setConfirmDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 600 }}>Confirm Challan</h3>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)' }} className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-warning flex-shrink-0" />
                <span>Confirming this challan will <strong>reduce inventory</strong> for all listed products. This action cannot be easily undone.</span>
              </p>
              <p style={{ marginTop: 'var(--sp-3)', fontWeight: 500, paddingLeft: '28px' }}>
                Total items: {items.length} | Total quantity: {totalQuantity}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmDialog(false)}>Cancel</button>
              <button className="btn btn-success" onClick={() => submitChallan(true)} disabled={submitting}>
                {submitting ? 'Confirming...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
