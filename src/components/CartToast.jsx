import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

let toastId = 0;

function CartToast() {
  const lastAdded = useSelector(state => state.cart.lastAdded);
  const [toasts, setToasts] = useState([]);

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