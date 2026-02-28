import { useEffect, useState } from 'react';
import API from '../services/api';
import { useStore } from '../contexts/StoreContext';

const t = {
  green: '#1B4332',
  cream: '#FAF7F2',
  border: '#E8E2D9',
  muted: '#6B7280',
};

type InventoryItem = {
  _id: string;
  title: string;
  category: string;
  quantity: number;
  inStock: boolean;
  isActive: boolean;
};

const AdminInventory = () => {
  const { user } = useStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [lowStock, setLowStock] = useState<InventoryItem[]>([]);
  const [csvData, setCsvData] = useState('title,quantity');
  const [message, setMessage] = useState('');

  const load = async () => {
    const [{ data: inventory }, { data: low }] = await Promise.all([
      API.get('/admin/inventory'),
      API.get('/admin/inventory/low-stock?threshold=5'),
    ]);
    setItems(Array.isArray(inventory) ? inventory : []);
    setLowStock(Array.isArray(low?.items) ? low.items : []);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      load();
    }
  }, [user]);

  if (user?.role !== 'admin') return null;

  const importCsv = async () => {
    setMessage('');
    const { data } = await API.post('/admin/inventory/import', { csvData });
    setMessage(data?.message || 'Inventory imported.');
    await load();
  };

  return (
    <div style={{ minHeight: '100vh', background: t.cream, padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 14 }}>Inventory Management</h1>

        {message && <p style={{ background: '#D8F3DC', color: t.green, padding: '10px 12px', borderRadius: 10, marginBottom: 12 }}>{message}</p>}

        <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Low Stock (≤ 5)</h3>
          <p style={{ color: t.muted, fontSize: '0.85rem', marginBottom: 10 }}>{lowStock.length} item(s) need restocking.</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {lowStock.slice(0, 10).map((item) => (
              <li key={item._id} style={{ marginBottom: 4 }}>{item.title} — {item.quantity} left</li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 14, padding: 16, marginBottom: 18 }}>
          <h3 style={{ marginBottom: 8 }}>Import Inventory CSV</h3>
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={8}
            style={{ width: '100%', border: `1.5px solid ${t.border}`, borderRadius: 10, padding: 10, marginBottom: 8, fontFamily: 'monospace', fontSize: '0.82rem' }}
          />
          <button onClick={importCsv} style={{ background: t.green, color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px' }}>
            Import CSV
          </button>
        </div>

        <div style={{ background: '#fff', border: `1.5px solid ${t.border}`, borderRadius: 14, padding: 16 }}>
          <h3 style={{ marginBottom: 10 }}>Current Stock Levels</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${t.border}` }}>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Category</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>Quantity</th>
                  <th style={{ textAlign: 'left', padding: '8px 6px' }}>In Stock</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: '8px 6px' }}>{item.title}</td>
                    <td style={{ padding: '8px 6px' }}>{item.category}</td>
                    <td style={{ padding: '8px 6px' }}>{item.quantity}</td>
                    <td style={{ padding: '8px 6px' }}>{item.inStock ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInventory;
