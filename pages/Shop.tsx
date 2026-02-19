import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, X, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { fadeUpVariants, staggerContainerVariants } from '../lib/animations';

const Shop = () => {
  const { products, searchQuery } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesPrice = product.price <= priceRange;
      
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  // Render products grid
  const renderContent = () => {
    return (
      <motion.div 
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filteredProducts.map((product, index) => (
          <motion.div 
            key={product.id} 
            variants={fadeUpVariants}
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge variant="outline" className="border-white/30 text-white mb-4">
              <ShoppingBag className="h-3.5 w-3.5 mr-1" />
              Browse & Discover
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Shop Products</h1>
            <p className="text-primary-100 text-lg">Find everything you need on campus</p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full justify-center gap-2 border-gray-200"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </div>

          {/* Filters Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`w-full lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-3">
                    <Filter className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="font-bold text-lg text-gray-900">Filters</h2>
                </div>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-sm text-gray-900 uppercase tracking-wide">Category</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <motion.label 
                      key={cat} 
                      className="flex items-center cursor-pointer group"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="h-4 w-4 text-primary-800 focus:ring-primary-500 border-gray-300"
                      />
                      <span className={`ml-3 text-sm transition-colors ${selectedCategory === cat ? 'text-primary-800 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {cat}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold mb-4 text-sm text-gray-900 uppercase tracking-wide">
                  Max Price: <span className="text-primary-800">₦{priceRange.toLocaleString()}</span>
                </h3>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-800"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>₦0</span>
                  <span>₦50k+</span>
                </div>
              </div>

              {(selectedCategory !== 'All' || priceRange < 50000) && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => { setSelectedCategory('All'); setPriceRange(50000); }}
                  className="w-full py-3 text-sm text-primary-800 font-medium hover:bg-primary-50 rounded-xl transition-colors border border-primary-100"
                >
                  Clear All Filters
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Product Grid */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100"
            >
              <div>
                <span className="text-gray-600">Showing </span>
                <span className="font-bold text-gray-900">{filteredProducts.length}</span>
                <span className="text-gray-600"> products</span>
              </div>
              {searchQuery && (
                <Badge className="bg-primary-100 text-primary-800">
                  Searching: "{searchQuery}"
                </Badge>
              )}
            </motion.div>

            {filteredProducts.length > 0 ? (
              renderContent()
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-gray-500 text-lg mb-2">No products match your criteria.</p>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters</p>
                <Button 
                  variant="outline"
                  onClick={() => { setSelectedCategory('All'); setPriceRange(50000); }}
                  className="text-primary-800 border-primary-200 hover:bg-primary-50"
                >
                  Clear all filters
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;