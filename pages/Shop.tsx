import React, { useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import BlurredProduct from '../components/BlurredProduct';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const Shop = () => {
  const { products, searchQuery, user } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(50000);

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

  // If not logged in, show sign in prompt at the top
  const renderContent = () => {
    if (!user) {
      return (
        <>
          {/* Sign in banner */}
          <div className="bg-primary-50 border border-primary-100 rounded-lg p-6 mb-8 text-center">
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              Sign in to view products
            </h3>
            <p className="text-gray-600 mb-4">
              Create an account or sign in to see detailed product information and make purchases.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild className="bg-primary-800 hover:bg-primary-900">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/register">Create Account</Link>
              </Button>
            </div>
          </div>

          {/* Blurred products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <BlurredProduct key={product.id} index={index} />
            ))}
          </div>
        </>
      );
    }

    // User is logged in - show actual products
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center mb-6">
              <Filter className="h-5 w-5 mr-2 text-gray-500" />
              <h2 className="font-bold text-lg">Filters</h2>
            </div>
            
            <div className="mb-8">
              <h3 className="font-medium mb-3 text-sm text-gray-900 uppercase tracking-wide">Category</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="h-4 w-4 text-primary-800 focus:ring-primary-500 border-gray-300"
                    />
                    <span className={`ml-3 text-sm ${selectedCategory === cat ? 'text-primary-800 font-medium' : 'text-gray-600'}`}>
                      {cat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3 text-sm text-gray-900 uppercase tracking-wide">Max Price: ₦{priceRange.toLocaleString()}</h3>
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
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Shop Products</h1>
            <span className="text-sm text-gray-500">{filteredProducts.length} results found</span>
          </div>

          {filteredProducts.length > 0 ? (
            renderContent()
          ) : (
            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">No products match your criteria.</p>
              <button 
                onClick={() => {setSelectedCategory('All'); setPriceRange(50000);}}
                className="mt-4 text-primary-800 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;