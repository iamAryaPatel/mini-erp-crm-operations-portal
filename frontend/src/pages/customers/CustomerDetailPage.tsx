import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import type { Customer, FollowUp } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Edit, MessageSquarePlus, Clock, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canManage = user && ['ADMIN', 'SALES'].includes(user.role);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, fuRes] = await Promise.all([
          api.get(`/customers/${id}`),
          api.get(`/customers/${id}/followups`),
        ]);
        setCustomer(custRes.data.data);
        setFollowUps(fuRes.data.data);
      } catch {
        toast.error('Failed to load customer');
        navigate('/customers');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) { toast.error('Note is required'); return; }
    setSubmitting(true);
    try {
      await api.post(`/customers/${id}/followups`, {
        note, follow_up_date: followUpDate || null,
      });
      const fuRes = await api.get(`/customers/${id}/followups`);
      setFollowUps(fuRes.data.data);
      setNote('');
      setFollowUpDate('');
      toast.success('Follow-up added');
    } catch {
      toast.error('Failed to add follow-up');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!customer) return null;

  const statusBadge = (s: string) => {
    const m: Record<string, string> = { Active: 'badge-success', Lead: 'badge-warning', Inactive: 'badge-danger' };
    return m[s] || 'badge-default';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{customer.customer_name}</h1>
          <p className="page-subtitle flex items-center gap-2">
            <Briefcase size={14} /> {customer.business_name}
          </p>
        </div>
        <div className="flex gap-3">
          {canManage && (
            <Link to={`/customers/${id}/edit`} className="btn btn-primary">
              <Edit size={16} /> Edit
            </Link>
          )}
          <button className="btn btn-secondary" onClick={() => navigate('/customers')}>
            <ArrowLeft size={16} /> Back
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
        <div className="card">
          <div className="card-header"><h3 className="card-title">Customer Information</h3></div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Status</div><span className={`badge ${statusBadge(customer.status)}`}>{customer.status}</span></div>
              <div><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Type</div><span className="badge badge-default">{customer.customer_type}</span></div>
              <div><div className="text-muted flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}><Phone size={12}/> Mobile</div><div className="font-mono">{customer.mobile_number}</div></div>
              <div><div className="text-muted flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}><Mail size={12}/> Email</div><div>{customer.email || '—'}</div></div>
              <div><div className="text-muted flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}><Briefcase size={12}/> GST</div><div className="font-mono">{customer.gst_number || '—'}</div></div>
              <div><div className="text-muted flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}><Clock size={12}/> Follow-up</div><div>{customer.follow_up_date ? new Date(customer.follow_up_date).toLocaleDateString() : '—'}</div></div>
            </div>
            {customer.address && <div style={{ marginTop: 'var(--sp-5)' }}><div className="text-muted flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}><MapPin size={12}/> Address</div><div>{customer.address}</div></div>}
            {customer.notes && <div style={{ marginTop: 'var(--sp-4)' }}><div className="text-muted" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>Notes</div><div style={{ background: 'var(--color-bg)', padding: 'var(--sp-3)', borderRadius: 'var(--radius-md)' }}>{customer.notes}</div></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="card-title">Follow-ups</h3></div>
          <div className="card-body">
            {canManage && (
              <form onSubmit={handleAddFollowUp} style={{ marginBottom: 'var(--space-5)', paddingBottom: 'var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
                <div className="form-group">
                  <label className="form-label">Add Follow-up Note</label>
                  <textarea className="form-textarea" value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter follow-up note..." rows={3} />
                </div>
                <div className="flex gap-3 items-center">
                  <input type="date" className="form-input" style={{ width: 'auto' }} value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)} />
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Adding...' : <><MessageSquarePlus size={16}/> Add Note</>}
                  </button>
                </div>
              </form>
            )}
            {followUps.length === 0 ? (
              <div className="text-muted text-center" style={{ padding: 'var(--space-6)' }}>No follow-ups yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {followUps.map((fu) => (
                  <div key={fu.id} style={{ padding: 'var(--space-3)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 'var(--font-size-sm)' }}>{fu.note}</div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      <span>By {fu.creator_name || 'Unknown'}</span>
                      <span>{new Date(fu.created_at).toLocaleDateString()}</span>
                      {fu.follow_up_date && <span>Follow-up: {new Date(fu.follow_up_date).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
