import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState } from 'react';
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
  Flame,
  Zap,
  MapPin
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { staggerContainerVariants, fadeUpVariants } from '../lib/animations';

const Home = () => {
  const { products } = useStore();
  const [activeTab, setActiveTab] = useState('featured');
  
  const featuredProducts = products?.slice(0, 12) || [];
  const trendingProducts = products?.slice(0, 12).sort(() => Math.random() - 0.5) || [];
  const newProducts = products?.slice(6, 18) || [];

  const categories = [
    { name: 'Textbooks', icon: BookOpen, count: '150+', color: 'from-blue-500 to-blue-600' },
    { name: 'Electronics', icon: Laptop, count: '80+', color: 'from-purple-500 to-purple-600' },
    { name: 'Hostel', icon: Coffee, count: '200+', color: 'from-green-500 to-green-600' },
    { name: 'Fashion', icon: Shirt, count: '120+', color: 'from-pink-500 to-pink-600' },
    { name: 'Tech', icon: Smartphone, count: '60+', color: 'from-orange-500 to-orange-600' },
    { name: 'Stationery', icon: BookOpen, count: '90+', color: 'from-yellow-500 to-yellow-600' },
  ];

  const getDisplayProducts = () => {
    switch(activeTab) {
      case 'trending': return trendingProducts;
      case 'new': return newProducts;
      default: return featuredProducts;
    }
  };

  const displayProducts = getDisplayProducts();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section - Streamlined */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-12 md:py-16 relative overflow-hidden">
        {/* Gradient overlay effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="outline" className="border-white/30 text-white mb-4 inline-block">
              <GraduationCap className="h-3.5 w-3.5 mr-1" />
              Campus Verified
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              Buy & Sell on Campus
            </h1>
            
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Connect with verified Babcock students. Buy textbooks, electronics, fashion, and more safely on campus.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
              <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-8 py-6 text-base font-semibold" asChild>
                <Link to="/shop">
                  Browse Items
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold" asChild>
                <Link to="/sell">List for Free</Link>
              </Button>
            </div>

            {/* Stats bar */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-wrap gap-6 justify-center text-white text-sm md:text-base"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-accent-400" />
                <span><strong>2.5k+</strong> Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-accent-400" />
                <span><strong>1.8k+</strong> Items</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent-400" />
                <span><strong>4.2k+</strong> Trades</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products With Tabs */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Shop What's Popular</h2>
            <p className="text-gray-600">Discover trending items on campus right now</p>
          </div>

          {/* Tab Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-2 mb-10 border-b border-gray-200"
          >
            {[
              { id: 'featured', label: 'Featured', icon: Star },
              { id: 'trending', label: 'Trending', icon: Flame },
              { id: 'new', label: 'New Arrivals', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors duration-300 ${
                    activeTab === tab.id
                      ? 'text-primary-900 border-primary-900'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Products Grid */}
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {displayProducts.length > 0 ? (
              displayProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  whileHover={{ y: -8 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            ) : (
              [...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-100 rounded-lg aspect-square animate-pulse"
                />
              ))
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <Button size="lg" variant="outline" className="px-8 py-6 text-base" asChild>
              <Link to="/shop">
                View All Products
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid - 2x3 */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-600 mt-1">Find exactly what you need</p>
            </div>
            <Link to="/shop" className="text-primary-800 hover:text-primary-900 font-medium flex items-center gap-1">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {categories.map((category) => {
              const Icon = category.icon;
              const colorMap = {
                'Textbooks': { bg: 'bg-blue-50', text: 'text-blue-600', gradient: 'from-blue-500 to-blue-600' },
                'Electronics': { bg: 'bg-purple-50', text: 'text-purple-600', gradient: 'from-purple-500 to-purple-600' },
                'Hostel': { bg: 'bg-green-50', text: 'text-green-600', gradient: 'from-green-500 to-green-600' },
                'Fashion': { bg: 'bg-pink-50', text: 'text-pink-600', gradient: 'from-pink-500 to-pink-600' },
                'Tech': { bg: 'bg-orange-50', text: 'text-orange-600', gradient: 'from-orange-500 to-orange-600' },
                'Stationery': { bg: 'bg-yellow-50', text: 'text-yellow-600', gradient: 'from-yellow-500 to-yellow-600' },
              };
              
              const colors = colorMap[category.name as keyof typeof colorMap];

              return (
                <motion.div
                  key={category.name}
                  variants={fadeUpVariants}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link
                    to={`/shop?category=${category.name.toLowerCase()}`}
                    className="group block"
                  >
                    <div className={`bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-all duration-300 border border-gray-200 relative overflow-hidden h-full`}>
                      {/* Animated background on hover */}
                      <motion.div 
                        className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                        initial={false}
                      />
                      
                      {/* Icon with gradient */}
                      <motion.div 
                        className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${colors.gradient} mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                        whileHover={{ rotate: [0, -10, 10, -5, 5, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>
                      
                      {/* Category name */}
                      <h3 className={`relative font-semibold text-lg mb-1 transition-colors duration-300 ${colors.text} group-hover:text-gray-900`}>
                        {category.name}
                      </h3>
                      
                      <p className="relative text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-300">{category.count} items</p>
                      
                      {/* Animated underline on hover */}
                      <motion.div 
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`}
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>
      {/* Features - With interactive colors */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2 text-center">Why Shop on Babcock Campus</h2>
          <p className="text-gray-600 text-center mb-10">Everything you need, right here on campus</p>
          
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {[
              { 
                icon: Shield, 
                title: 'Verified Students', 
                desc: 'Only authenticated Babcock community members',
                gradient: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
              },
              { 
                icon: MapPin, 
                title: 'Campus Pickup', 
                desc: 'Meet safely on campus, anywhere you want',
                gradient: 'from-green-500 to-green-600',
                bg: 'bg-green-50',
              },
              { 
                icon: Clock, 
                title: 'Quick Deals', 
                desc: 'Fast transactions with verified peers',
                gradient: 'from-orange-500 to-orange-600',
                bg: 'bg-orange-50',
              },
              { 
                icon: Users, 
                title: 'Community Driven', 
                desc: '2.5k+ active students buying & selling',
                gradient: 'from-purple-500 to-purple-600',
                bg: 'bg-purple-50',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={idx}
                  variants={fadeUpVariants}
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="group relative"
                >
                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 text-center border border-gray-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
                    {/* Animated background on hover */}
                    <motion.div 
                      className={`absolute inset-0 ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      initial={false}
                    />
                    
                    {/* Icon container */}
                    <motion.div 
                      className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} mx-auto mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      whileHover={{ rotate: [0, -5, 5, -3, 3, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>
                    
                    {/* Title */}
                    <h3 className="relative font-semibold text-lg text-gray-900 mb-2 group-hover:text-gray-900 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="relative text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                      {feature.desc}
                    </p>
                    
                    {/* Bottom accent line */}
                    <motion.div 
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA - Full Width */}
      <section className="py-16 bg-gradient-to-br from-primary-900 to-primary-800 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Ready to sell your items?</h2>
              <p className="text-primary-100 text-lg">List for free in just 2 minutes. Reach 2.5k+ students today.</p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="bg-accent-500 hover:bg-accent-600 text-primary-900 px-10 py-6 font-semibold text-base" asChild>
                <Link to="/sell">
                  Start Selling
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;