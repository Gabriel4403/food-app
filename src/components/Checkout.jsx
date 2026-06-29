import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import Button from "./Button";
import Error from "./Error";
import { clearCart, hideCheckout } from "../store/cartSlice";
import Modal from "./Modal";
import Input from "./Input";

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Checkout modal — collects customer details and submits the order to the backend
function Checkout() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const { progress } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const cartTotal = items.reduce(
    (total, item) => total + item.quantity * item.price, 0
  );

  function handleClose() {
    dispatch(hideCheckout());
    setSuccess(false);
    setError(null);
  }

  // Clear the cart and close the modal after a successful order
  function handleFinishOrder() {
    dispatch(hideCheckout());
    dispatch(clearCart());
    setSuccess(false);
    setError(null);
  }

  // Submit the order to the backend with customer details and cart items
  // Includes the JWT token in the Authorization header if the user is logged in
  async function handleSubmit(event) {
    event.preventDefault();
    setIsSending(true);
    setError(null);

    const fd = new FormData(event.target);
    const customerData = Object.fromEntries(fd.entries());

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ order: { items, customer: customerData } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSending(false);
    }
  }

  let buttons = (
    <>
      <Button className="bg-[#312c1d] rounded transition hover:bg-amber-500 p-2" type="button" textOnly onClick={handleClose}>
        Close
      </Button>
      <Button className="bg-[#312c1d] rounded transition hover:bg-amber-500 p-2" type="submit">Submit Order</Button>
    </>
  );

  if (isSending) {
    buttons = <span>Sending order...</span>;
  }

  // Show success message after order is placed
  if (success) {
    return (
      <Modal open={progress === 'checkout'} onClose={handleFinishOrder}>
        <h2>Success!</h2>
        <p>Your order was submitted successfully.</p>
        <p>We will get back to you with more details via email within the next few minutes.</p>
        <p className="flex justify-end gap-4">
          <Button type="button" onClick={handleFinishOrder}>Okay</Button>
        </p>
      </Modal>
    );
  }

  return (
    <Modal open={progress === 'checkout'} onClose={handleClose}>
      <form onSubmit={handleSubmit}>
        <h2>Checkout</h2>
        <p>Total Amount: {currencyFormatter.format(cartTotal)}</p>
        <Input label="Full Name" type="text" id="name" />
        <Input label="E-Mail Address" type="email" id="email" />
        <Input label="Street" type="text" id="street" />
        <div className="flex justify-start gap-4">
          <Input label="Postal Code" type="text" id="postal-code" />
          <Input label="City" type="text" id="city" />
        </div>
        {error && <Error title="Failed to submit order" message={error} />}
        <p className="flex justify-end gap-4">{buttons}</p>
      </form>
    </Modal>
  );
}

export default Checkout;