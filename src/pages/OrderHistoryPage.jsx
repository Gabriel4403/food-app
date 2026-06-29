import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addItem } from '../store/cartSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// Shows the logged-in user's order history with "Order Again" and "Your Most Ordered" features
function OrderHistoryPage() {
  const { token } = useSelector(s => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reorderMsg, setReorderMsg] = useState('');

  // Redirect to login if not authenticated, then fetch this user's orders
  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    fetch(`${API_URL}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, navigate]);

  // Calculate the top 3 most ordered products across all of the user's orders
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

  // Add all items from a past order back to the cart
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
    <div className="min-h-screen pt-45 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">My Orders</h1>

        {reorderMsg && (
          <div className="bg-green-100 text-green-800 rounded-lg p-3 mb-6 text-sm">{reorderMsg}</div>
        )}

        {/* Top 3 most ordered products — shown only if user has order history */}
        {topProducts.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-stone-700 mb-4">Your Most Ordered</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topProducts.map((item, i) => (
                <div key={i} className="bg-[#67AE6E] rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl text-stone-700 font-bold flex-shrink-0">#{i + 1}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{item.product_name}</p>
                      <p className="text-sm text-white/80">Ordered {item.quantity}x</p>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(addItem({
                      id: item.product_id,
                      name: item.product_name,
                      price: item.product_price,
                      quantity: 1,
                    }))}
                    className="w-full bg-[#312c1d] text-white cursor-pointer text-xs rounded px-3 py-1.5 hover:bg-amber-500 transition"
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
                    <p className="font-bold text-stone-900">Order from {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-sm text-gray-500">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-700 text-lg">
                      {currencyFormatter.format(
                        order.items?.reduce((sum, i) => sum + i.product_price * i.quantity, 0) || 0
                      )}
                    </p>
                    {/* Order again button — adds all items from this order back to the cart */}
                    <button
                      onClick={() => handleOrderAgain(order)}
                      className="mt-2 bg-[#312c1d] text-white cursor-pointer text-sm rounded px-4 py-1.5 hover:bg-amber-500 transition"
                    >
                      Order Again
                    </button>
                  </div>
                </div>
                <ul className="divide-y divide-gray-100">
                  {order.items?.map((item, i) => (
                    <li key={i} className="py-2 text-stone-700 flex justify-between text-sm">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span className="text-stone-700">{currencyFormatter.format(item.product_price * item.quantity)}</span>
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