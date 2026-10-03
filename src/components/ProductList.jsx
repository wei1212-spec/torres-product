import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductList({ user, onLogout }) {
  const isAdmin = user?.role === 'admin';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  const inventoryValue = products.reduce((sum, p) => sum + Number(p.price || 0) * Number(p.quantity || 0), 0);

  return (
    <div className="container dashboard-shell">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Product management</span>
          <h1>Inventory dashboard</h1>
        </div>
        <div className="header-right">
          <div className="user-pill">
            <span className="user-label">{user.username}</span>
            <span className={`role-badge ${isAdmin ? 'admin' : 'user'}`}>{isAdmin ? 'Admin' : 'Viewer'}</span>
          </div>
          <button className="secondary" onClick={onLogout}>Logout</button>
        </div>
      </header>

      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert success" onClick={() => setNotice('')}>{notice}</div>}

      <section className="stats-grid">
        <div className="stat-card accent">
          <span>Total products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="stat-card">
          <span>Inventory value</span>
          <strong>{peso.format(inventoryValue)}</strong>
        </div>
        <div className="stat-card">
          <span>Access level</span>
          <strong>{isAdmin ? 'Admin' : 'View only'}</strong>
        </div>
      </section>

      {isAdmin ? (
        <div className="toolbar">
          <button onClick={() => setFormFor({})}>+ Add product</button>
        </div>
      ) : (
        <div className="toolbar muted-panel">
          <span>Viewing mode: only administrators can add, edit, or delete products.</span>
        </div>
      )}

      <div className="card table-wrap">
        {loading ? <p className="center">Loading…</p> : (
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Description</th><th className="num">Price</th><th className="num">Qty</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr><td colSpan="7" className="center muted">No products yet.</td></tr>
              )}
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><strong>{p.product_name}</strong></td>
                  <td className="muted">{p.description}</td>
                  <td className="num">{peso.format(p.price)}</td>
                  <td className="num">{p.quantity}</td>
                  <td className="muted">{p.created_at}</td>
                  <td className="actions">
                    {isAdmin ? (
                      <>
                        <button className="secondary small" onClick={() => setFormFor(p)}>Edit</button>
                        <button className="danger small" onClick={() => handleDelete(p)}>Delete</button>
                      </>
                    ) : (
                      <span className="muted">View only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {formFor && (
        <ProductForm
          product={formFor.id ? formFor : null}
          onSaved={handleSaved}
          onCancel={() => setFormFor(null)}
        />
      )}
    </div>
  );
}
