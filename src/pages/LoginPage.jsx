import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/authSlice';
import { loadUserCart } from '../store/cartSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      dispatch(login(data));
      dispatch(loadUserCart());
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-[140px] flex items-start justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Sign in</h2>
        {error && <p className="bg-red-100 text-red-700 rounded p-3 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1  text-stone-900 font-semibold text-sm">
            Email
            <input
              type="email" required
              className="border border-gray-300  text-stone-900 rounded p-2 font-normal focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            />
          </label>
          <label className="flex flex-col text-stone-900 gap-1 font-semibold text-sm">
            Password
            <input
              type="password" required
              
              className="border border-gray-300 rounded p-2 font-normal focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            />
          </label>
          <button
            type="submit" disabled={loading}
            className="bg-[#312c1d] text-white rounded py-2 font-bold transition hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          No account?{' '}
          <Link to="/register" className="text-amber-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;