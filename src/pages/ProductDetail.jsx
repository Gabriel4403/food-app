import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import useHttp from "../hooks/useHttp";
import { addItem } from "../store/cartSlice";
import Button from "../components/Button";
import Error from "../components/Error";

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const requestConfig = {};

function ProductDetailPage() {
  const { productId } = useParams();
  const dispatch = useDispatch();

  const { data: products, isLoading, error } = useHttp(
    `${API_URL}/products`,
    requestConfig,
    []
  );

  const product = products?.find((p) => p.id === productId);

  function handleAddToCart() {
    dispatch(addItem(product));
  }

  if (isLoading) {
    return <p className="text-center mt-40 text-xl">Loading...</p>;
  }

  if (error) {
    return <Error title="Failed to load product" message={error} />;
  }

  if (!product) {
    return (
      <div className="text-center mt-40">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products" className="text-amber-500 underline">Back to menu</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[140px] pb-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <img
          src={`${API_URL}/${product.image}`}
          alt={product.name}
          className="w-full h-80 object-cover"
        />
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-stone-900">{product.name}</h1>
            <span className="inline-block bg-[#312c1d] text-[#ffc404] text-lg font-bold px-6 py-2 rounded">
              {currencyFormatter.format(product.price)}
            </span>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">{product.description}</p>
          <div className="flex gap-4">
            <Button
              className="bg-[#312c1d] rounded  cursor-pointer transition hover:bg-amber-500 p-3 text-lg"
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>
            <Link
              to="/products"
              className="px-4 py-3 rounded font-semibold text-[#3F7D58] border-2 border-[#3F7D58] hover:bg-[#3F7D58] hover:text-white transition"
            >
              ← Back to menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetailPage;
