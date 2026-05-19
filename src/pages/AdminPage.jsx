import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../store/authSlice";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const EMPTY_FORM = {
  name: "",
  price: "",
  description: "",
  image: null,
  category: "burgers",
};

function AdminPage() {
  const { token, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const authHeaders = { Authorization: `Bearer ${token}` };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/products`);
      setProducts(await res.json());
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/login");
      return;
    }
    loadProducts();
  }, [token, user, navigate, loadProducts]);

  function startEdit(product) {
  setEditingId(product.id);
  setForm({ name: product.name, price: product.price, description: product.description, image: null, category: product.category || 'burgers' });
  setError('');
}

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("price", form.price);
      fd.append("description", form.description);
      fd.append('category', form.category);
      if (form.image) fd.append("image", form.image);

      const url = editingId
        ? `${API_URL}/products/${editingId}`
        : `${API_URL}/products`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: authHeaders, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccessMsg(editingId ? "Product updated!" : "Product added!");
      setTimeout(() => setSuccessMsg(""), 3000);
      cancelEdit();
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (!res.ok) throw new Error("Delete failed");
      setDeleteConfirm(null);
      setSuccessMsg("Product deleted.");
      setTimeout(() => setSuccessMsg(""), 3000);
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen pt-[140px] pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-stone-900">
            Admin — Products
          </h1>
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/");
            }}
            className="text-sm text-gray-500 hover:text-red-600 transition"
          >
            Sign out
          </button>
        </div>

        {successMsg && (
          <div className="bg-green-100 text-green-800 rounded-lg p-3 mb-6 text-sm">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingId ? "Edit product" : "Add new product"}
          </h2>
          <form
            onSubmit={handleSave}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <label className="flex flex-col gap-1 text-sm  text-stone-900 font-semibold">
              Name *
              <input
                required
                type="text"
                className="border border-gray-300 rounded p-2 font-normal focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1 text-stone-900 text-sm font-semibold">
              Price (USD) *
              <input
                required
                type="number"
                step="0.01"
                min="0"
                className="border border-gray-300 rounded p-2 font-normal focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col text-stone-900 gap-1 text-sm font-semibold md:col-span-2">
              Description
              <textarea
                rows={3}
                className="border border-gray-300 rounded p-2 font-normal focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Category
                <select
                  className="border border-gray-300 rounded p-2 font-normal focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                >
                  <option value="burgers">Burgers & Sandwiches</option>
                  <option value="pizzas">Pizzas</option>
                  <option value="sushi">Sushi</option>
                </select>
              </label>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Image{" "}
              {editingId && (
                <span className="font-normal text-gray-400">
                  (leave blank to keep current)
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="border border-gray-300 rounded p-1.5 font-normal"
                onChange={(e) =>
                  setForm((f) => ({ ...f, image: e.target.files[0] || null }))
                }
              />
            </label>
            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#312c1d] text-white rounded px-6 py-2 font-bold transition hover:bg-amber-500 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save changes"
                    : "Add product"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-red-600 text-white text-xs rounded px-3 py-1.5 hover:bg-red-800 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
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
                  <th className="text-left px-4 py-3 hidden md:table-cell">
                    Description
                  </th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.id}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3">
                      {p.image && (
                        <img
                          src={`${API_URL}/${p.image}`}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold">{p.name}</td>
                    <td className="px-4 py-3 text-amber-700 font-bold">
                      {currencyFormatter.format(p.price)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                      {p.description}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => startEdit(p)}
                          className="bg-[#312c1d] text-white text-xs rounded px-3 py-1.5 hover:bg-amber-500 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="bg-red-600 text-white text-xs rounded px-3 py-1.5 hover:bg-red-800 transition"
                        >
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
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold mb-2">Delete product?</h3>
            <p className="text-gray-600 text-sm mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-red-600 text-white rounded px-5 py-2 text-sm font-bold hover:bg-red-800 transition"
              >
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
