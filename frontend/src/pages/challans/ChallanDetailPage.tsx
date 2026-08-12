import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { Challan } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function ChallanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const canManage = user && ['ADMIN', 'SALES'].includes(user.role);

  useEffect(() => {
    const fetchChallan = async () => {
      try {
        const res = await api.get(`/challans/${id}`);
        setChallan(res.data.data);
      } catch {
        toast.error('Failed to load challan');
        navigate('/challans');
      } finally {
        setLoading(false);
      }
    };
    fetchChallan();
  }, [id, navigate]);

  const handleConfirm = async () => {
    setConfirming(true);
    setShowConfirmDialog(false);
    try {
      const res = await api.post(`/challans/${id}/confirm`);
      setChallan(res.data.data);
      toast.success('Challan confirmed! Stock has been updated.');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; details?: { productName?: string; available?: number; requested?: number } } } };
      const details = axiosErr.response?.data?.details;
      if (details && 'available' in details) {
        toast.error(`Insufficient stock for ${details.productName}: available ${details.available}, requested ${details.requested}`);
      } else {
        toast.error(axiosErr.response?.data?.message || 'Failed to confirm challan');
      }
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    setShowCancelDialog(false);
    try {
      const res = await api.post(`/challans/${id}/cancel`);
      setChallan(res.data.data);
      toast.success('Challan cancelled');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to cancel challan');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!challan) return null;

  const statusBadge = (s: string) => {
    const m: Record<string, string> = { Draft: 'badge-warning', Confirmed: 'badge-success', Cancelled: 'badge-danger' };
    return m[s] || 'badge-default';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{challan.challan_number}</h1>
          <p className="page-subtitle">{challan.customer_name} — {challan.business_name}</p>
        </div>
        <div className="flex gap-3 items-center">
          <span className={`badge ${statusBadge(challan.status)}`} style={{ fontSize: 'var(--text-sm)', padding: '4px 14px' }}>{challan.status}</span>
          {canManage && challan.status === 'Draft' && (
            <>
              <button className="btn btn-success" onClick={() => setShowConfirmDialog(true)} disabled={confirming}>
                {confirming ? 'Confirming...' : <><CheckCircle size={16} /> Confirm</>}
              </button>
              <button className="btn btn-danger" onClick={() => setShowCancelDialog(true)} disabled={cancelling}>
                <XCircle size={16} /> Cancel
              </button>
            </>
          )}
          {canManage && challan.status === 'Confirmed' && (
            <button className="btn btn-danger" onClick={() => setShowCancelDialog(true)} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : <><XCircle size={16} /> Cancel Challan</>}
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/challans')}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Challan Information</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Challan Number</div><div className="font-semibold font-mono">{challan.challan_number}</div></div>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Status</div><span className={`badge ${statusBadge(challan.status)}`}>{challan.status}</span></div>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Customer</div><div>{challan.customer_name}</div></div>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Business</div><div>{challan.business_name}</div></div>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Total Quantity</div><div className="font-semibold">{challan.total_quantity}</div></div>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Created By</div><div>{challan.creator_name || '—'}</div></div>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Created</div><div>{new Date(challan.created_at).toLocaleString()}</div></div>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Updated</div><div>{new Date(challan.updated_at).toLocaleString()}</div></div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Items (Snapshot)</h3></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Quantity</th><th>Subtotal</th></tr>
              </thead>
              <tbody>
                {challan.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.product_name_snapshot}</td>
                    <td style={{ fontFamily: 'monospace' }}>{item.sku_snapshot}</td>
                    <td>₹{Number(item.unit_price_snapshot).toLocaleString()}</td>
                    <td>{item.quantity}</td>
                    <td className="font-semibold">₹{(Number(item.unit_price_snapshot) * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="modal-overlay" onClick={() => setShowConfirmDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3 style={{ fontWeight: 600 }}>Confirm Challan</h3></div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)' }} className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-warning flex-shrink-0" />
                <span>Confirming this challan will <strong>reduce inventory</strong> for all listed products.</span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConfirmDialog(false)}>Cancel</button>
              <button className="btn btn-success" onClick={handleConfirm}>Yes, Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showCancelDialog && (
        <div className="modal-overlay" onClick={() => setShowCancelDialog(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header"><h3 style={{ fontWeight: 600 }}>Cancel Challan</h3></div>
            <div className="modal-body">
              <p style={{ color: 'var(--color-text-secondary)' }} className="flex items-start gap-2">
                <AlertTriangle size={20} className="text-warning flex-shrink-0" />
                <span>
                  {challan.status === 'Confirmed'
                    ? 'This challan has been confirmed. Cancelling will restore stock for all items.'
                    : 'Are you sure you want to cancel this draft challan?'}
                </span>
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCancelDialog(false)}>Go Back</button>
              <button className="btn btn-danger" onClick={handleCancel}>Yes, Cancel Challan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
