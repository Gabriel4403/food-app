import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// Global counter to give each toast a unique ID without relying on array index
let toastId = 0;

// Stacking toast notifications shown when items are added to the cart
// Each toast auto-dismisses after 2.5 seconds and all are cleared when cart opens
function CartToast() {
  const lastAdded = useSelector(state => state.cart.lastAdded);
  const progress = useSelector(state => state.cart.progress);
  const [toasts, setToasts] = useState([]);

  // Clear all toasts when cart or checkout opens
  useEffect(() => {
    if (progress === 'cart' || progress === 'checkout') {
      setToasts([]);
    }
  }, [progress]);

  // Add a new toast when a product is added to cart, then auto-remove it after 2.5s
  useEffect(() => {
    if (!lastAdded) return;
    const id = ++toastId;
    setToasts(prev => [...prev, { id, name: lastAdded }]);
    const timer = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500);
    return () => clearTimeout(timer);
  }, [lastAdded]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="bg-[#312c1d] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in"
        >
          <span className="text-xl">🛒</span>
          <span className="font-semibold">{toast.name} added to cart!</span>
        </div>
      ))}
    </div>
  );
}

export default CartToast;