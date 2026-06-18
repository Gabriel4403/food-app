import { FaLeaf, FaClock, FaHeart, FaAward, FaUtensils } from "react-icons/fa";

export default function AboutPage() {
  return (
     <div className="min-h-screen  mt-50 sm:mt-30  px-6 py-12 ">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-[#3F7D58] mb-6">
          Our story
        </h1>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          At <span className="font-semibold text-[#EF9651]">FoodApp</span>, we believe food should be fresh, fast, and full of flavor. Our mission is to connect people with their favorite meals at the tap of a button.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed mb-4">
          Whether you're craving a quick lunch, a cozy dinner, or a healthy snack, we've got you covered. Our team partners with top-rated local restaurants and ensures fast, reliable delivery — so your food arrives hot and on time.
        </p>
        <p className="text-gray-700 text-lg leading-relaxed">
          Thank you for choosing <span className="font-semibold text-[#EF9651]">FoodApp</span>. We’re more than a delivery service — we’re your daily dose of deliciousness.
        </p>
      </div>
       <div className="max-w-4xl mx-auto bg-white py-10 rounded-2xl shadow-lg mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#3F7D58] mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="bg-amber-100 p-6 rounded-lg text-center">
              <FaLeaf className="mx-auto text-4xl text-green-600 mb-4" />
              <h3 className="text-xl text-[#3F7D58] font-semibold mb-2">Fresh Ingredients</h3>
              <p className="text-gray-600">
                We source 90% of our produce from local organic farms within.
              </p>
            </div>

            
            <div className="bg-amber-100 p-6 rounded-lg text-center">
              <FaClock className="mx-auto text-4xl text-blue-500 mb-4" />
              <h3 className="text-xl text-[#3F7D58] font-semibold mb-2">Quick Delivery</h3>
              <p className="text-gray-600">
                98% of orders arrive within 30 minutes or it's on us.
              </p>
            </div>

            
            <div className="bg-amber-100 p-6 rounded-lg text-center">
              <FaHeart className="mx-auto text-4xl text-red-500 mb-4" />
              <h3 className="text-xl text-[#3F7D58] font-semibold mb-2">Made with Love</h3>
              <p className="text-gray-600">
                Every dish is prepared by chefs who care about your dining
                experience.
              </p>
            </div>

            7
          </div>
        </div>
      </div>
    </div>
  );
}