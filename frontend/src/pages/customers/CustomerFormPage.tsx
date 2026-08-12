import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

interface FormData {
  customer_name: string;
  mobile_number: string;
  email: string;
  business_name: string;
  gst_number: string;
  customer_type: string;
  address: string;
  status: string;
  follow_up_date: string;
  notes: string;
}

const initialForm: FormData = {
  customer_name: '', mobile_number: '', email: '', business_name: '',
  gst_number: '', customer_type: 'Retail', address: '', status: 'Lead',
  follow_up_date: '', notes: '',
};

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (isEdit) {
      api.get(`/customers/${id}`).then((res) => {
        const c = res.data.data;
        setForm({
          customer_name: c.customer_name || '',
          mobile_number: c.mobile_number || '',
          email: c.email || '',
          business_name: c.business_name || '',
          gst_number: c.gst_number || '',
          customer_type: c.customer_type || 'Retail',
          address: c.address || '',
          status: c.status || 'Lead',
          follow_up_date: c.follow_up_date ? c.follow_up_date.split('T')[0] : '',
          notes: c.notes || '',
        });
        setFetching(false);
      }).catch(() => { toast.error('Failed to load customer'); navigate('/customers'); });
    }
  }, [id, isEdit, navigate]);

  const validate = (): boolean => {
    const e: Partial<FormData> = {};
    if (!form.customer_name.trim()) e.customer_name = 'Name is required';
    if (!form.mobile_number.trim()) e.mobile_number = 'Mobile is required';
    else if (!/^[0-9]{10,15}$/.test(form.mobile_number)) e.mobile_number = 'Invalid mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.business_name.trim()) e.business_name = 'Business name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = { ...form, email: form.email || null, gst_number: form.gst_number || null,
        follow_up_date: form.follow_up_date || null, notes: form.notes || null };
      if (isEdit) {
        await api.put(`/customers/${id}`, data);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', data);
        toast.success('Customer created successfully');
      }
      navigate('/customers');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{isEdit ? 'Edit Customer' : 'Add Customer'}</h1></div>
        <button className="btn btn-secondary" onClick={() => navigate('/customers')}>
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input className={`form-input ${errors.customer_name ? 'error' : ''}`} value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              {errors.customer_name && <div className="form-error">{errors.customer_name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input className={`form-input ${errors.business_name ? 'error' : ''}`} value={form.business_name}
                onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
              {errors.business_name && <div className="form-error">{errors.business_name}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input className={`form-input ${errors.mobile_number ? 'error' : ''}`} value={form.mobile_number}
                onChange={(e) => setForm({ ...form, mobile_number: e.target.value })} />
              {errors.mobile_number && <div className="form-error">{errors.mobile_number}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className={`form-input ${errors.email ? 'error' : ''}`} value={form.email} type="email"
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Customer Type *</label>
              <select className="form-select" value={form.customer_type} onChange={(e) => setForm({ ...form, customer_type: e.target.value })}>
                <option value="Retail">Retail</option><option value="Wholesale">Wholesale</option><option value="Distributor">Distributor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Lead">Lead</option><option value="Active">Active</option><option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input className="form-input" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Follow-up Date</label>
              <input className="form-input" type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea className="form-textarea" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : <><Save size={16} /> {isEdit ? 'Update Customer' : 'Create Customer'}</>}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/customers')}>Cancel</button>
          </div>
        </form>
      </div></div>
    </div>
  );
}
