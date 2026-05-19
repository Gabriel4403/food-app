import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addItem } from "../store/cartSlice";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const popularItems = [
  { id: "m2", name: "Chicken Sandwich", price: 6.49, image: "/chicken-sandwich.jpg" },
  { id: "m13", name: "Buffalo Wings", price: 12.99, image: "/buffalo-wings.jpg" },
  { id: "m4", name: "Spicy Chicken Nuggets", price: 4.99, image: "/spicy-nuggets.jpg" },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function HomePage() {
  const dispatch = useDispatch();

  const featuredCategories = [
    { name: "Burgers", image: "/cheeseburger.jpg", link: "/category/burgers" },
    { name: "Pizzas", image: "/pepperoni-pizza.jpg", link: "/category/pizzas" },
    { name: "Sushi", image: "/sashimi-combo.jpg", link: "/category/sushi" },
  ];

  return (
    <div className="min-h-screen pt-[140px]">
      <section className="relative h-80 bg-[#3F7D58] flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Welcome to FoodApp</h1>
          <p className="text-xl mb-8">
            Delicious meals delivered to your doorstep
          </p>
          <Link
            to="/products"
            className="bg-white text-[#3F7D58] hover:bg-[#EF9651] hover:text-white font-bold py-3 px-6 rounded-lg text-lg transition"
          >
            Browse Menu
          </Link>
        </div>
      </section>

      <section className="rounded-2xl py-12 px-4 max-w-6xl mx-auto bg-white shadow-lg mt-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-stone-950 shadow-2xl">
          Our Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCategories.map((category) => (
            <Link
              to={category.link}
              key={category.name}
              className="bg-[#67AE6E] rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition"
            >
              <div className="h-48 bg-[#67AE6E] overflow-hidden">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 transition hover:bg-amber-500">
                <h3 className="text-xl font-semibold text-gray-800">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 bg-white rounded-2xl mt-2">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8 text-stone-950 shadow-2xl">
            Popular Items
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {popularItems.map((item) => (
              <div
                key={item.name}
                className="bg-[#67AE6E] rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="h-48 bg-[#67AE6E] overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {item.name}
                  </h3>
                  <p className="text-[#ffc404] font-bold mt-2">{currencyFormatter.format(item.price)}</p>
                  <button
                    className="mt-4 bg-[#312c1d] rounded transition hover:bg-amber-500 text-white py-2 px-4"
                    onClick={() => dispatch(addItem(item))}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-4 max-w-6xl mx-auto text-stone-950 bg-white rounded-2xl mt-2">
        <h2 className="text-3xl font-bold text-center mb-8 text-stone-950">
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🚚</div>
            <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
            <p className="text-gray-600">
              Get your food delivered in under 30 minutes
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🍔</div>
            <h3 className="text-xl font-semibold mb-2">Quality Food</h3>
            <p className="text-gray-600">
              Fresh ingredients from local suppliers
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Easy Payment</h3>
            <p className="text-gray-600">Multiple secure payment options</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
