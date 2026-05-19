import { Outlet } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import Cart from "../components/Cart";
import Checkout from "../components/Checkout";
import CartToast from "../components/CartToast";


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
