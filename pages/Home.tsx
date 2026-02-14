import { Link } from 'react-router-dom';
import { 
  Shield, 
  Truck, 
  TrendingUp, 
  ArrowRight,
  Star,
  Users,
  Clock,
  ShoppingBag,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';

const Home = () => {
  const { products } = useStore(); // This is correct - using useStore, not useState
  const featuredProducts = products?.slice(0, 6) || [];

  const categories = [
    { name: 'Textbooks', icon: '📚', count: '150+', color: 'from-blue-500 to-blue-600' },
    { name: 'Electronics', icon: '💻', count: '80+', color: 'from-purple-500 to-purple-600' },
    { name: 'Clothing', icon: '👕', count: '200+', color: 'from-pink-500 to-pink-600' },
    { name: 'Food & Snacks', icon: '🍕', count: '60+', color: 'from-orange-500 to-orange-600' },
    { name: 'Furniture', icon: '🪑', count: '40+', color: 'from-green-500 to-green-600' },
    { name: 'Stationery', icon: '✏️', count: '100+', color: 'from-yellow-500 to-yellow-600' },
  ];

  const features = [
    { icon: Shield, title: 'Secure Trading', desc: 'Safe transactions with buyer protection', color: 'blue' },
    { icon: Truck, title: 'Campus Delivery', desc: 'Quick delivery within campus', color: 'green' },
    { icon: TrendingUp, title: 'Best Prices', desc: 'Student-friendly prices', color: 'purple' },
    { icon: Users, title: 'Verified Students', desc: 'Only Babcock students', color: 'orange' },
  ];

  const stats = [
    { label: 'Active Users', value: '2,500+', icon: Users },
    { label: 'Items Sold', value: '10,000+', icon: ShoppingBag },
    { label: 'Daily Listings', value: '100+', icon: Clock },
    { label: 'Happy Students', value: '98%', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20"></div>
        </div>

        <div className="container-custom relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-yellow-300 mr-2" />
                <span className="text-sm text-white font-medium">The #1 Campus Marketplace</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Buy & Sell 
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300">
                  With Fellow Students
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
                Join thousands of Babcock students trading textbooks, electronics, and essentials securely on campus.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link 
                  to="/shop" 
                  className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold 
                           hover:shadow-2xl transform hover:scale-105 transition-all duration-300
                           flex items-center justify-center space-x-2"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link 
                  to="/sell" 
                  className="group border-2 border-white text-white px-8 py-4 rounded-xl 
                           font-semibold hover:bg-white/10 transform hover:scale-105 
                           transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>Sell Your Items</span>
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center justify-center lg:justify-start space-x-6 mt-8">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/40?img=${i}`}
                      alt="User"
                      className="w-8 h-8 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <p className="text-sm text-blue-100">
                  <span className="font-bold text-white">2,500+</span> active students
                </p>
              </div>
            </div>

            {/* Right Content - Stats Grid */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center 
                               transform hover:scale-105 transition-all duration-300
                               animate-float"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Icon className="h-8 w-8 text-white mx-auto mb-3" />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-blue-200">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path fill="#f9fafb" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </section>
      {/* Categories Section */}
      <section className="py-20">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find exactly what you need from thousands of items listed by students
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/shop?category=${category.name.toLowerCase()}`}
                className="group relative bg-white rounded-2xl p-6 text-center 
                         shadow-sm hover:shadow-xl transform hover:-translate-y-1 
                         transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 
                                group-hover:opacity-10 transition-opacity duration-300`} />
                <span className="text-4xl mb-3 block transform group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

            {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We make campus trading safe, easy, and convenient for everyone
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              const colorMap = {
                blue: 'from-blue-500 to-blue-600',
                green: 'from-green-500 to-green-600',
                purple: 'from-purple-500 to-purple-600',
                orange: 'from-orange-500 to-orange-600',
              };
              
              return (
                <div
                  key={idx}
                  className="group relative bg-gray-50 rounded-2xl p-8 
                           hover:shadow-xl transform hover:-translate-y-1 
                           transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[feature.color as keyof typeof colorMap]} 
                                  opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorMap[feature.color as keyof typeof colorMap]} 
                                  flex items-center justify-center mb-6 transform group-hover:scale-110 
                                  group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Discover the most popular items on campus right now
              </p>
            </div>
            <Link 
              to="/shop" 
              className="group flex items-center space-x-2 text-blue-600 font-semibold 
                       hover:text-blue-700 mt-4 md:mt-0"
            >
              <span>View All Products</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-float"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              // Skeleton loading state
              [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4 animate-shimmer"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-shimmer"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-shimmer"></div>
                  <div className="h-10 bg-gray-200 rounded animate-shimmer"></div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80" 
            alt="Students studying"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 to-indigo-900/95"></div>
        </div>

        <div className="container-custom relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Start Selling?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join hundreds of students earning money by selling their unused items. 
              It's free and takes less than 5 minutes!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/sell"
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold 
                         hover:shadow-2xl transform hover:scale-105 transition-all duration-300
                         flex items-center justify-center space-x-2"
              >
                <span>Start Selling Now</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/shop"
                className="group border-2 border-white text-white px-8 py-4 rounded-xl 
                         font-semibold hover:bg-white/10 transform hover:scale-105 
                         transition-all duration-300"
              >
                Browse Items
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold text-white">₦2.5M+</div>
                <div className="text-sm text-blue-200">Monthly Sales</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-blue-200">Active Sellers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">1k+</div>
                <div className="text-sm text-blue-200">Items Listed</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;