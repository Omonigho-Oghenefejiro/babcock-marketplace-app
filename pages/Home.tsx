import { Link } from 'react-router-dom';
import { Zap, Shield, Truck, TrendingUp } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';

const Home = () => {
  const { products } = useStore();

  // Get featured products (first 6 products)
  const featuredProducts = products.slice(0, 6);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Welcome to Babcock Campus Marketplace
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Buy and sell textbooks, electronics, clothing, food, and more. Connect with your campus community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/shop" 
                className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                Start Shopping
              </Link>
              <Link 
                to="/sell" 
                className="inline-block border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-blue-600 transition-colors"
              >
                Sell Items
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Secure Trading', desc: 'Safe transactions and buyer protection' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Quick campus delivery available' },
              { icon: TrendingUp, title: 'Best Prices', desc: 'Competitive pricing from students' },
              { icon: Zap, title: 'Easy Communication', desc: 'Direct messaging with sellers' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
                <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Link to="/shop" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              View All <Zap className="h-4 w-4 ml-2" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">Products will appear here soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Have Something to Sell?</h2>
          <p className="text-blue-100 text-lg mb-8">
            List your items for free and start earning today. It takes less than 5 minutes!
          </p>
          <Link 
            to="/sell" 
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
          >
            Create Your First Listing
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;