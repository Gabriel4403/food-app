import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { addItem } from "../store/cartSlice";
import Button from "./Button";

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


function ProductItem ({product}) {
    const dispatch = useDispatch()

    function handleAddProductToCart () {
        dispatch(addItem(product))
    }

     return (
    <li className="bg-[#67AE6E] rounded-2xl overflow-hidden text-center shadow-md">
      <article className="h-full flex flex-col justify-between">
        <Link to={`/products/${product.id}`}>
          <img src={`${API_URL}/${product.image}`} alt={product.name} className="w-full h-80 object-cover"/>
        </Link>
        <div>
          <h3 className="text-2xl font-bold my-2">{product.name}</h3>
          <p className="inline-block bg-[#312c1d] text-[#ffc404] text-sm font-bold px-8 py-2 rounded mb-4">
            {currencyFormatter.format(product.price)}
          </p>
          <p className="font-semibold mx-4 my-4">{product.description}</p>
        </div>
        <p className="mb-6">
          <Button className="p-2 bg-[#312c1d] rounded transition cursor-pointer hover:bg-amber-500 "  onClick={handleAddProductToCart}>Add to Cart</Button>
        </p>
      </article>
    </li>
  );

}

export default ProductItem