import { useParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItem } from "../store/cartSlice";
import { useState, useEffect } from "react";
import Button from "../components/Button";
import Error from "../components/Error";

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORY_LABELS = {
  burgers: 'Burgers & Sandwiches',
  pizzas: 'Pizzas',
  sushi: 'Sushi',
};

function CategoryProducts() {
  const { category } = useParams();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/categories/${category}`)
      .then(res => res.json())
      .then(data => { setProducts(data); setLoading(false); })
      .catch(() => { setError('Failed to load products'); setLoading(false); });
  }, [category]);

  if (loading) return <p className="text-center mt-40 text-xl">Loading...</p>;
  if (error) return <Error title="Failed to load products" message={error} />;

  return (
    <div className="min-h-screen pt-[140px] pb-12 px-4">
      <h2 className="text-3xl font-bold text-center text-stone-900 mb-8">
        {CATEGORY_LABELS[category] || category}
      </h2>
      {products.length === 0 ? (
        <p className="text-center text-gray-500">No items in this category yet.</p>
      ) : (
        <ul className="w-[90%] max-w-[70rem] list-none mx-auto grid grid-cols-[repeat(auto-fit,_minmax(16rem,_1fr))] gap-4">
          {products.map((product) => (
            <li key={product.id} className="bg-[#67AE6E] rounded-2xl overflow-hidden text-center shadow-md">
              <article className="h-full flex flex-col justify-between">
                <Link to={`/products/${product.id}`}>
                  <img src={`${API_URL}/${product.image}`} alt={product.name} className="w-full h-48 object-cover" />
                </Link>
                <div>
                  <h3 className="text-xl font-bold my-2">{product.name}</h3>
                  <p className="inline-block bg-[#312c1d] text-[#ffc404] text-sm font-bold px-6 py-1 rounded mb-3">
                    {currencyFormatter.format(product.price)}
                  </p>
                </div>
                <p className="mb-4">
                  <Button
                    className="p-2 bg-[#312c1d] rounded transition hover:bg-amber-500"
                    onClick={() => dispatch(addItem(product))}
                  >
                    Add to Cart
                  </Button>
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CategoryProducts;