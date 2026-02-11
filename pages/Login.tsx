import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Coffee, Monitor } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';

const Home = () => {
  const { products, user } = useStore();
  const navigate = useNavigate();
  const featuredProducts = products.slice(0, 3);

  const handleSellClick = () => {
    if (user) {
      navigate('/sell');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-blue-900 text-white overflow-hidden rounded-3xl mx-4 mt-4 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="md:w-2/3">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
              The Marketplace for <br />
              <span className="text-yellow-400">Babcock Students</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              Buy, sell, and trade textbooks, electronics, and hostel essentials securely within the campus community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/shop" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-blue-900 bg-yellow-400 hover:bg-yellow-300 md:text-lg transition-all shadow-lg hover:shadow-xl">
                Start Shopping
              </Link>
              <button 
                onClick={handleSellClick}
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-medium rounded-full text-white hover:bg-white hover:text-blue-900 md:text-lg transition-all"
              >
                Sell an Item
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'Textbooks', icon: BookOpen, color: 'bg-green-100 text-green-600' },
            { name: 'Electronics', icon: Monitor, color: 'bg-blue-100 text-blue-600' },
            { name: 'Food & Snacks', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
            { name: 'More', icon: ArrowRight, color: 'bg-gray-100 text-gray-600' },
          ].map((cat) => (
            <Link key={cat.name} to={`/shop?category=${cat.name}`} className="group p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col items-center justify-center text-center">
              <div className={`p-4 rounded-full mb-4 ${cat.color} group-hover:scale-110 transition-transform`}>
                <cat.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-900">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Items</h2>
          <Link to="/shop" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;