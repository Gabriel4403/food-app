import useHttp from "../hooks/useHttp";
import ProductItem from "../components/ProductItem";
import Error from "../components/Error";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const requestConfig = {};

function Products() {
  const {
    data: loadedProducts,
    isLoading,
    error,
  } = useHttp(`${API_URL}/products`, requestConfig, []);
  if (isLoading) {
    return <p>Loading products...</p>;
  }
  if (error) {
    return <Error title="Failed to load products" message={error} />;
  }

  return (
    <ul className="w-[90%] max-w-[70rem] list-none pt-12 mt-20 top-20 mx-auto p-4 grid grid-cols-[repeat(auto-fit,_minmax(16rem,_1fr))] gap-4">
      {loadedProducts.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </ul>
  );
}

export default Products;
