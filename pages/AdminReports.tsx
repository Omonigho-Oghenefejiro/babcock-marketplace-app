import { useEffect, useMemo, useState } from 'react';
import API from '../services/api';
import { useStore } from '../contexts/StoreContext';

const t = {
  green: '#1B4332',
  cream: '#FAF7F2',
  border: '#E8E2D9',
  muted: '#6B7280',
};

const AdminReports = () => {
  const { user } = useStore();
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data: report } = await API.get('/admin/reports/sales');
    setData(report);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      load();
    }
  }, [user]);

  if (user?.role !== 'admin') return null;

  const revenue = useMemo(
    () => (data?.salesHistory || []).reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0),
    [data]
  );

  const exportCsv = () => {
    window.location.href = `${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/reports/sales/export`;
  };

  const exportPdf = () => {
    window.location.href = `${(import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/reports/sales/export-pdf`;
  };

  const sendSummary = async (period: 'daily' | 'weekly') => {
    const { data } = await API.post('/admin/reports/sales/notify', { period });
    setMessage(data?.message || 'Summary sent.');
  };

  return (
    <div style={{ minHeight: '100vh', background: t.cream, padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 14 }}>Sales Reports</h1>

        {message && <p style={{ background: '#D8F3DC', color: t.green, padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>{message}</p>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 12, marginBottom: 18 }}>
          <Card label="Sales Orders" value={(data?.salesHistory || []).length} />
          <Card label="Total Revenue" value={`₦${Number(revenue || 0).toLocaleString()}`} />
          <Card label="Top Products" value={(data?.topSellingProducts || []).length} />
          <Card label="Low Stock Items" value={(data?.lowStockItems || []).length} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <button onClick={exportCsv} style={btn}>Export CSV</button>
          <button onClick={exportPdf} style={btn}>Export PDF</button>
          <button onClick={() => sendSummary('daily')} style={btn}>Send Daily Summary</button>
          <button onClick={() => sendSummary('weekly')} style={btn}>Send Weekly Summary</button>
        </div>

        <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Top Selling Products</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {(data?.topSellingProducts || []).slice(0, 10).map((p: any, idx: number) => (
              <li key={`${p.productId}-${idx}`} style={{ marginBottom: 4 }}>
                {p.title || 'Unknown product'} — {p.unitsSold} sold — ₦{Number(p.revenue || 0).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 14, padding: 16 }}>
          <h3 style={{ marginBottom: 8 }}>Sales Trend (Recent Days)</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {(data?.dailyTrend || []).slice(-14).map((d: any, idx: number) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                {`${d._id.year}-${String(d._id.month).padStart(2, '0')}-${String(d._id.day).padStart(2, '0')}`} — {d.orders} orders — ₦{Number(d.totalRevenue || 0).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const btn: React.CSSProperties = {
  background: t.green,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 12px',
  cursor: 'pointer',
};

const Card = ({ label, value }: { label: string; value: string | number }) => (
  <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 12, padding: 14 }}>
    <p style={{ color: t.muted, fontSize: '0.8rem', marginBottom: 6 }}>{label}</p>
    <p style={{ fontSize: '1.2rem', fontWeight: 700 }}>{value}</p>
  </div>
);

export default AdminReports;
