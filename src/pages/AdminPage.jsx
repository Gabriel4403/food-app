import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const EMPTY_FORM = { name: '', price: '', description: '', image: null, category: 'burgers' };

function ProductModal({ form, setForm, onSave, onClose, editingId, saving, error }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h2 className="text-xl font-bold mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        {error && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
        <form onSubmit={onSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Name *
            <input required type="text"
              className="border border-gray-300 rounded p-2 font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Price (USD) *
            <input required type="number" step="0.01" min="0"
              className="border border-gray-300 rounded p-2 font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.price}
              onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Description
            <textarea rows={3}
              className="border border-gray-300 rounded p-2 font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Category
            <select
              className="border border-gray-300 rounded p-2 font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            >
              <option value="burgers">Burgers & Sandwiches</option>
              <option value="pizzas">Pizzas</option>
              <option value="sushi">Sushi</option>
              <option value="">None</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Image {editingId && <span className="font-normal text-gray-400">(leave blank to keep current)</span>}
            <input type="file" accept="image/*"
              className="border border-gray-300 rounded p-1.5 font-normal text-gray-900"
              onChange={e => setForm(f => ({ ...f, image: e.target.files[0] || null }))}
            />
          </label>
          <div className="flex gap-3 justify-end mt-2">
            <button type="button" onClick={onClose}
              className="text-gray-500 hover:text-gray-800 transition text-sm px-4 py-2">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="bg-[#312c1d] text-white rounded px-6 py-2 font-bold transition hover:bg-amber-500 disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminPage() {
  const { token, user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showModal, setShowModal] = useState(false);

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      setProducts(await res.json());
    } catch {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch(`${API_URL}/orders`, { headers: authHeaders });
      setOrders(await res.json());
    } catch {
      setError('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token || user?.role !== 'admin') { navigate('/login'); return; }
    loadProducts();
    loadOrders();
  }, [token, user, navigate, loadProducts, loadOrders]);

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalError('');
    setShowModal(true);
  }

  function openEditModal(product) {
    setEditingId(product.id);
    setForm({ name: product.name, price: product.price, description: product.description, image: null, category: product.category || 'burgers' });
    setModalError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalError('');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('description', form.description);
      fd.append('category', form.category);
      if (form.image) fd.append('image', form.image);

      const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccessMsg(editingId ? 'Product updated!' : 'Product added!');
      setTimeout(() => setSuccessMsg(''), 3000);
      closeModal();
      loadProducts();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE', headers: authHeaders });
      if (!res.ok) throw new Error('Delete failed');
      setDeleteConfirm(null);
      setSuccessMsg('Product deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen pt-[140px] pb-12 px-4">
      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900">Admin Panel</h1>
          <button
            onClick={() => { dispatch(logout()); navigate('/'); }}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            Sign out
          </button>
        </div>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'products' ? 'bg-[#312c1d] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-lg font-bold transition ${activeTab === 'orders' ? 'bg-[#312c1d] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
          >
            Orders
          </button>
        </div>

        {successMsg && <div className="bg-green-100 text-green-800 rounded-lg p-3 mb-6 text-sm">{successMsg}</div>}
        {error && <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>}

        {activeTab === 'products' && (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={openAddModal}
                className="bg-[#312c1d] text-white rounded-lg px-6 py-2 font-bold transition hover:bg-amber-500"
              >
                + Add Product
              </button>
            </div>

            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#123524] text-white">
                    <tr>
                      <th className="text-left px-4 py-3">Image</th>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Price</th>
                      <th className="text-left px-4 py-3 hidden md:table-cell">Description</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3">
                          {p.image && <img src={`${API_URL}/${p.image}`} alt={p.name} className="w-14 h-14 object-cover rounded-lg" />}
                        </td>
                        <td className="px-4 py-3 font-semibold">{p.name}</td>
                        <td className="px-4 py-3 text-amber-700 font-bold">{currencyFormatter.format(p.price)}</td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">{p.description}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => openEditModal(p)}
                              className="bg-[#312c1d] text-white text-xs rounded px-3 py-1.5 hover:bg-amber-500 transition">
                              Edit
                            </button>
                            <button onClick={() => setDeleteConfirm(p.id)}
                              className="bg-red-600 text-white text-xs rounded px-3 py-1.5 hover:bg-red-800 transition">
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <h2 className="text-xl font-bold p-6 border-b">Orders</h2>
            {ordersLoading ? (
              <p className="text-center text-gray-500 p-6">Loading...</p>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-500 p-6">No orders yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-[#123524] text-white">
                  <tr>
                    <th className="text-left px-4 py-3">Order ID</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">City</th>
                    <th className="text-left px-4 py-3">Items</th>
                    <th className="text-left px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, i) => (
                    <tr key={order.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 font-semibold">{order.customer_name}</td>
                      <td className="px-4 py-3 text-gray-500">{order.customer_email}</td>
                      <td className="px-4 py-3">{order.customer_city}</td>
                      <td className="px-4 py-3">
                        <ul className="text-xs text-gray-600">
                          {order.items?.map((item, j) => (
                            <li key={j}>{item.quantity}x {item.product_name}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-700">
                        {currencyFormatter.format(
                          order.items?.reduce((sum, item) => sum + item.product_price * item.quantity, 0) || 0
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <ProductModal
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={closeModal}
          editingId={editingId}
          saving={saving}
          error={modalError}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Delete product?</h3>
            <p className="text-gray-600 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="text-gray-600 hover:text-gray-900 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 text-white rounded px-5 py-2 text-sm font-bold hover:bg-red-800 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;