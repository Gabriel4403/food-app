import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen mt-50 sm:mt-40  flex items-start justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-stone-900 mb-6">Create account</h2>
        {error && <p className="bg-red-100 text-red-700 rounded p-3 mb-4 text-sm">{error}</p>}
        {success && (
          <div className="bg-green-100 text-green-800 rounded p-3 mb-4 text-sm">
            Account created! Redirecting to login...
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {[['Name','text','name'],['Email','email','email'],['Password','password','password']].map(([label, type, key]) => (
            <label key={key} className="flex flex-col text-gray-500 gap-1 font-semibold text-sm">
              {label}
              <input
                type={type} required
                className="border border-gray-400 rounded p-2 font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
            </label>
          ))}
          <button
            type="submit" disabled={loading || success}
            className="bg-[#312c1d] text-white cursor-pointer rounded py-2 font-bold transition hover:bg-amber-500 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          Have an account?{' '}
          <Link to="/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;