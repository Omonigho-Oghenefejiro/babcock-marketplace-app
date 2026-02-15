import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  GraduationCap,
  BookOpen,
  Laptop,
  Coffee,
  Shirt,
  Smartphone,
  ArrowRight,
  Shield,
  Users,
  Clock,
  Star,
  ChevronRight,
  Package,
  CreditCard,
  MessageCircle,
  MapPin,
  TrendingUp,
  Zap
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import BlurredProduct from '../components/BlurredProduct';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const Home = () => {
  const { user, products } = useStore();
  const featuredProducts = products?.slice(0, 6) || [];

  const categories = [
    { name: 'Textbooks', icon: BookOpen, count: '150+', color: 'from-blue-500 to-blue-600' },
    { name: 'Electronics', icon: Laptop, count: '80+', color: 'from-purple-500 to-purple-600' },
    { name: 'Hostel', icon: Coffee, count: '200+', color: 'from-green-500 to-green-600' },
    { name: 'Fashion', icon: Shirt, count: '120+', color: 'from-pink-500 to-pink-600' },
    { name: 'Tech', icon: Smartphone, count: '60+', color: 'from-orange-500 to-orange-600' },
    { name: 'Stationery', icon: BookOpen, count: '90+', color: 'from-yellow-500 to-yellow-600' },
  ];

  const quickActions = [
    { label: 'Trending 🔥', color: 'red', href: '/shop?sort=trending' },
    { label: 'New Arrivals ✨', color: 'blue', href: '/shop?sort=new' },
    { label: 'Best Sellers ⭐', color: 'amber', href: '/shop?sort=bestsellers' },
    { label: 'Under ₦5000 💰', color: 'green', href: '/shop?price=under5000' },
    { label: 'Free Pickup 📦', color: 'purple', href: '/shop?pickup=free' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Compact */}
      <section className="bg-gradient-to-br from-primary-900 to-primary-800 py-12 md:py-16">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 text-center lg:text-left"
            >
              <Badge variant="outline" className="border-white/30 text-white mb-4">
                <GraduationCap className="h-3.5 w-3.5 mr-1" />
                Babcock University
              </Badge>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
                Campus Marketplace
              </h1>
              
              <p className="text-lg text-primary-100 mb-6 max-w-xl mx-auto lg:mx-0">
                Buy and sell with verified students. Safe, local, and designed for you.
              </p>

              {/* Quick action chips - Interactive */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-6">
                {quickActions.map((action, idx) => {
                  const colorClasses = {
                    red: 'bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200 border-red-500/30',
                    blue: 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 border-blue-500/30',
                    amber: 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 border-amber-500/30',
                    green: 'bg-green-500/10 text-green-300 hover:bg-green-500/20 hover:text-green-200 border-green-500/30',
                    purple: 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 border-purple-500/30',
                  };
                  
                  return (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to={action.href}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${colorClasses[action.color as keyof typeof colorClasses]} backdrop-blur-sm`}
                      >
                        {action.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-6 py-5 text-base" asChild>
                  <Link to="/shop">
                    Start Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 py-5 text-base" asChild>
                  <Link to="/sell">Sell an Item</Link>
                </Button>
              </div>
            </motion.div>

            {/* Stats - Compact grid */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 grid grid-cols-2 gap-3"
            >
              {[
                { label: 'Students', value: '2.5k+', icon: Users },
                { label: 'Items', value: '1.8k+', icon: Package },
                { label: 'Trades', value: '4.2k+', icon: CreditCard },
                { label: 'Active', value: '1.2k', icon: MessageCircle },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <Icon className="h-5 w-5 text-accent-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-primary-200">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions Row - More interactive chips */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Zap, label: 'Trending', color: 'red' },
              { icon: Clock, label: 'Recent', color: 'blue' },
              { icon: TrendingUp, label: 'Popular', color: 'green' },
              { icon: Star, label: 'Top Rated', color: 'amber' },
              { icon: MapPin, label: 'Near You', color: 'purple' },
            ].map((item, idx) => {
              const Icon = item.icon;
              const colorClasses = {
                red: 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200',
                blue: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200',
                green: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200',
                amber: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200',
                purple: 'text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-200',
              };
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={`/shop?sort=${item.label.toLowerCase()}`}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${colorClasses[item.color as keyof typeof colorClasses]} shadow-sm`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories - With interactive colors */}
      <section className="py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
            <Link to="/shop" className="text-primary-800 hover:text-primary-900 text-sm font-medium flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const colorMap = {
                'Textbooks': { bg: 'bg-blue-50', text: 'text-blue-600', hoverBg: 'hover:bg-blue-100', hoverText: 'hover:text-blue-700', gradient: 'from-blue-500 to-blue-600' },
                'Electronics': { bg: 'bg-purple-50', text: 'text-purple-600', hoverBg: 'hover:bg-purple-100', hoverText: 'hover:text-purple-700', gradient: 'from-purple-500 to-purple-600' },
                'Hostel': { bg: 'bg-green-50', text: 'text-green-600', hoverBg: 'hover:bg-green-100', hoverText: 'hover:text-green-700', gradient: 'from-green-500 to-green-600' },
                'Fashion': { bg: 'bg-pink-50', text: 'text-pink-600', hoverBg: 'hover:bg-pink-100', hoverText: 'hover:text-pink-700', gradient: 'from-pink-500 to-pink-600' },
                'Tech': { bg: 'bg-orange-50', text: 'text-orange-600', hoverBg: 'hover:bg-orange-100', hoverText: 'hover:text-orange-700', gradient: 'from-orange-500 to-orange-600' },
                'Stationery': { bg: 'bg-yellow-50', text: 'text-yellow-600', hoverBg: 'hover:bg-yellow-100', hoverText: 'hover:text-yellow-700', gradient: 'from-yellow-500 to-yellow-600' },
              };
              
              const colors = colorMap[category.name as keyof typeof colorMap];

              return (
                <motion.div
                  key={category.name}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    to={`/shop?category=${category.name.toLowerCase()}`}
                    className="group block"
                  >
                    <div className={`bg-white rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 border border-gray-100 relative overflow-hidden`}>
                      {/* Animated background on hover */}
                      <motion.div 
                        className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        initial={false}
                      />
                      
                      {/* Icon with gradient */}
                      <motion.div 
                        className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} mx-auto mb-2 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}
                        whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </motion.div>
                      
                      {/* Category name with color transition */}
                      <h3 className={`relative font-medium text-sm mb-1 transition-colors duration-300 ${colors.text} group-hover:${colors.hoverText}`}>
                        {category.name}
                      </h3>
                      
                      <p className="relative text-xs text-gray-500">{category.count}</p>
                      
                      {/* Animated underline on hover */}
                      <motion.div 
                        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colors.gradient}`}
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products - Denser grid */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Items</h2>
              <p className="text-sm text-gray-500">Popular on campus right now</p>
            </div>
            <Link to="/shop" className="text-primary-800 hover:text-primary-900 text-sm font-medium flex items-center">
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {user ? (
                    <ProductCard product={product} compact />
                  ) : (
                    <BlurredProduct index={index} compact />
                  )}
                </motion.div>
              ))
            ) : (
              // Compact skeleton
              [...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-100 rounded-lg p-3 animate-pulse"
                >
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features - With interactive colors */}
      <section className="py-12">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Built for Campus Life</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                icon: Shield, 
                title: 'Verified Students', 
                desc: 'Only Babcock students',
                gradient: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
                text: 'text-blue-600',
                hoverText: 'group-hover:text-blue-700'
              },
              { 
                icon: MapPin, 
                title: 'Campus Pickup', 
                desc: 'Meet on campus',
                gradient: 'from-green-500 to-green-600',
                bg: 'bg-green-50',
                text: 'text-green-600',
                hoverText: 'group-hover:text-green-700'
              },
              { 
                icon: Clock, 
                title: 'Quick Deals', 
                desc: 'Fast transactions',
                gradient: 'from-orange-500 to-orange-600',
                bg: 'bg-orange-50',
                text: 'text-orange-600',
                hoverText: 'group-hover:text-orange-700'
              },
              { 
                icon: Users, 
                title: 'Active Community', 
                desc: '2.5k+ students',
                gradient: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50',
                text: 'text-purple-600',
                hoverText: 'group-hover:text-purple-700'
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="group relative"
                >
                  <div className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                    {/* Animated background on hover */}
                    <motion.div 
                      className={`absolute inset-0 ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      initial={false}
                    />
                    
                    {/* Icon container */}
                    <motion.div 
                      className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} mx-auto mb-3 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}
                      whileHover={{ rotate: [0, -5, 5, -3, 3, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-7 w-7 text-white" />
                    </motion.div>
                    
                    {/* Title */}
                    <h3 className={`relative font-semibold text-gray-900 mb-1 transition-colors duration-300 ${feature.hoverText}`}>
                      {feature.title}
                    </h3>
                    
                    <p className="relative text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
                      {feature.desc}
                    </p>
                    
                    {/* Bottom accent line */}
                    <motion.div 
                      className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${feature.gradient}`}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section className="py-12 bg-primary-900">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Ready to sell?</h2>
              <p className="text-primary-100">List your items for free. Takes 2 minutes.</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-8" asChild>
                <Link to="/sell">
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;