import { useDispatch, useSelector } from "react-redux";
import Modal from "../components/Modal";
import Button from "../components/Button";
import CartItem from "../components/CartItem";
import {
  hideCart,
  showCheckout,
  addItem,
  removeItem,
} from "../store/cartSlice";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function Cart() {
  const dispatch = useDispatch();
  const { items, progress } = useSelector((state) => state.cart);

  const cartTotal = items.reduce(
    (totalPrice, item) => totalPrice + item.quantity * item.price,
    0
  );

  function handleCloseCart() {
    dispatch(hideCart());
  }

  function handleGoToCheckout() {
    dispatch(showCheckout());
  }

  return (
    <Modal open={progress === "cart"} onClose={handleCloseCart}>
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            name={item.name}
            quantity={item.quantity}
            price={item.price}
            onIncrease={() => dispatch(addItem(item))}
            onDecrease={() => dispatch(removeItem(item.id))}
          />
        ))}
      </ul>
      <p className="flex justify-end my-8 text-xl font-bold">
        {currencyFormatter.format(cartTotal)}
      </p>
      <div className="flex justify-end gap-4">
        <Button className="p-1 bg-[#312c1d] rounded transition hover:bg-amber-500"  textOnly onClick={handleCloseCart}>
          Close
        </Button>
        {items.length > 0 && (
          <Button className="bg-[#312c1d] rounded transition hover:bg-amber-500 p-2" onClick={handleGoToCheckout}>Go to Checkout</Button>
        )}
      </div>
    </Modal>
  );
}

export default Cart;
