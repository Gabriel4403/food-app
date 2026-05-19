import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

function CartToast() {
  const lastAdded = useSelector(state => state.cart.lastAdded);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAdded) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [lastAdded]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
    }`}>
      <div className="bg-[#312c1d] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
        <span className="text-xl">🛒</span>
        <span className="font-semibold">{lastAdded} added to cart!</span>
      </div>
    </div>
  );
}

export default CartToast;