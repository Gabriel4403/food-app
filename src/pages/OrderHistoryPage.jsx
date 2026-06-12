import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addItem } from '../store/cartSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function OrderHistoryPage() {
  const { token, user } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderMsg, setReorderMsg] = useState('');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch(`${API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setOrders(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, navigate]);

  // Fix 3: top ordered products for this user
  const topProducts = (Array.isArray(orders) ? orders : [])
  .flatMap(o => o.items || [])
  .reduce((acc, item) => {
    const existing = acc.find(i => i.product_id === item.product_id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      acc.push({ ...item });
    }
    return acc;
  }, [])
  .sort((a, b) => b.quantity - a.quantity)
  .slice(0, 3);

  // Fix 1: order again
  function handleOrderAgain(order) {
    order.items.forEach(item => {
      dispatch(addItem({
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        quantity: 1,
      }));
    });
    setReorderMsg('Items added to cart!');
    setTimeout(() => setReorderMsg(''), 3000);
  }

  if (loading) return <p className="text-center mt-40 text-xl">Loading...</p>;

  return (
    <div className="min-h-screen pt-[140px] pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-stone-900 mb-8">My Orders</h1>

        {reorderMsg && (
          <div className="bg-green-100 text-green-800 rounded-lg p-3 mb-6 text-sm">{reorderMsg}</div>
        )}

        {/* Fix 3: top ordered products */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-stone-700 mb-4">Your Most Ordered</h2>
            <div className="flex gap-4 flex-wrap">
              {topProducts.map((item, i) => (
                <div key={i} className="bg-[#67AE6E] rounded-xl px-4 py-3 flex items-center gap-3">
                  <span className="text-2xl text-stone-700 font-bold ">#{i + 1}</span>
                  <div>
                    <p className="font-semibold text-white">{item.product_name}</p>
                    <p className="text-sm text-white/80">Ordered {item.quantity}x</p>
                  </div>
                  <button
                    onClick={() => dispatch(addItem({
                      id: item.product_id,
                      name: item.product_name,
                      price: item.product_price,
                      quantity: 1,
                    }))}
                    className="ml-2 bg-[#312c1d] text-white text-xs rounded px-3 py-1.5 hover:bg-amber-500 transition"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-stone-700  font-mono">{order.id.slice(0, 8)}...</p>
                    <p className="text-sm text-stone-700 ">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-700 text-lg">
                      {currencyFormatter.format(
                        order.items?.reduce((sum, i) => sum + i.product_price * i.quantity, 0) || 0
                      )}
                    </p>
                    {/* Fix 1: order again button */}
                    <button
                      onClick={() => handleOrderAgain(order)}
                      className="mt-2 bg-[#312c1d] text-white text-sm rounded px-4 py-1.5 hover:bg-amber-500 transition"
                    >
                      Order Again
                    </button>
                  </div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {order.items?.map((item, i) => (
                    <li key={i} className="py-2 text-stone-700  flex justify-between text-sm">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="text-stone-700 ">{currencyFormatter.format(item.product_price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrderHistoryPage;