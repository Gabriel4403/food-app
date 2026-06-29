const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

// A single item row in the cart — shows name, quantity, price, and +/- controls
function CartItem({ name, quantity, price, onIncrease, onDecrease }) {
  return (
    <li className="flex justify-between items-center my-2">
      <p className="m-0">
        {name} - {quantity} x {currencyFormatter.format(price)}
      </p>
      <p className="flex items-center gap-4">
        <button className="w-6 h-6 text-[1rem] rounded-full border-none bg-[#312c1d] text-[#ffc404] flex justify-center items-center hover:bg-[#1d1a16] hover:text-[#ffab04]" onClick={onDecrease}>-</button>
        <span>{quantity}</span>
        <button className="w-6 h-6 text-[1rem] rounded-full border-none bg-[#312c1d] text-[#ffc404] flex justify-center items-center hover:bg-[#1d1a16] hover:text-[#ffab04]" onClick={onIncrease}>+</button>
      </p>
    </li>
  );
}

export default CartItem;