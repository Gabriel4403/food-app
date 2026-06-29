import useHttp from "../hooks/useHttp";
import ProductItem from "../components/ProductItem";
import Error from "../components/Error";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const requestConfig = {};

// Products page — fetches and displays all products in a responsive grid
function Products() {
  const {
    data: loadedProducts,
    isLoading,
    error,
  } = useHttp(`${API_URL}/products`, requestConfig, []);

  if (isLoading) {
    return <p className="text-center mt-40 text-white text-xl">Loading products...</p>;
  }
  if (error) {
    return <Error title="Failed to load products" message={error} />;
  }

  return (
    // 2 columns on mobile, auto-fit with min 20rem per column on desktop
    <ul className="w-[100%] max-w-[80rem] list-none pt-4 mt-40 sm:mt-44 mx-auto p-0 sm:p-4 grid grid-cols-2 md:grid-cols-[repeat(auto-fit,_minmax(20rem,_1fr))] gap-2 sm:gap-4">
      {loadedProducts.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </ul>
  );
}

export default Products;