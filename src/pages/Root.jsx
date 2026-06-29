import { Outlet } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Cart from "../components/Cart";
import Checkout from "../components/Checkout";
import CartToast from "../components/CartToast";

// Root layout — wraps all pages with the shared navbar, cart modal, checkout modal, and toast notifications
function RootLayout() {
  return (
    <>
      <NavigationBar />
      <main>
        <Outlet />
      </main>
      <Cart />
      <Checkout />
      <CartToast />
    </>
  );
}

export default RootLayout;