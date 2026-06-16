import ShoppingCartIcon from "./ShoppingCartIcon";
import { NavLink, useNavigate } from "react-router-dom";
import LogoIcon from "./Logo";
import { useDispatch, useSelector } from "react-redux";
import { showCart } from "../store/cartSlice";
import { logout } from "../store/authSlice";
import { clearCart } from "../store/cartSlice";

function NavigationBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(state => state.cart.items);
  const { user, token } = useSelector(state => state.auth);

  const totalCartItems = items.reduce((total, item) => total + item.quantity, 0);

  function handleShowCart(event) {
    event.preventDefault();
    dispatch(showCart());
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-1 font-semibold rounded-md transition ${
      isActive
        ? 'bg-[#EF9651] text-white'
        : 'bg-white text-[#3F7D58] hover:bg-[#EF9651] hover:text-white'
    }`;

  return (
    <div className="absolute inset-x-0 top-0 border-2 min-h-[15%] bg-[#123524] flex flex-col items-center shadow-xl justify-center py-4 md:rounded-2xl">
      <div className="w-full max-w-3xl flex items-center justify-between px-4 sm:px-8">
  <div className="flex items-center justify-center gap-2 sm:gap-4">
    <LogoIcon width={50} height={50} />
    <h1 className="font-bold text-2xl sm:text-4xl text-[#EFEFEF]">Food App</h1>
  </div>
  <button onClick={handleShowCart} className="relative group p-1 rounded-2xl transition hover:scale-110">
    <ShoppingCartIcon size="lg" itemCount={totalCartItems} />
  </button>
</div>

      <div className="w-full max-w-5xl flex flex-wrap justify-center gap-3 mt-4 px-4">
        <NavLink to="/" className={linkClass}>Home</NavLink>
        <NavLink to="/products" className={linkClass}>Products</NavLink>
        {token && user?.role !== 'admin' && (
          <NavLink to="/orders" className={linkClass}>My Orders</NavLink>
        )}
        <NavLink to="/aboutus" className={linkClass}>About Us</NavLink>
        {token && user?.role === 'admin' && (
          <NavLink to="/admin" className={linkClass}>Admin</NavLink>
        )}
        {token ? (
          <button
            onClick={() => { dispatch(logout()); dispatch(clearCart()); navigate('/'); }}
            className="px-3 py-1 font-semibold rounded-md bg-white text-red-600 hover:bg-red-600 hover:text-white transition"
          >
            Sign out
          </button>
        ) : (
          <NavLink to="/login" className={linkClass}>Sign in</NavLink>
        )}
      </div>
    </div>
  );
}

export default NavigationBar;