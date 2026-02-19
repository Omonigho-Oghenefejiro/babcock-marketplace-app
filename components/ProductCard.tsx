import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { user, addToCart, toggleWishlist, wishlist } = useStore();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const mainImage = product.images?.[0] || 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image';

  const handleAddToCart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!user) {
      navigate('/login', { 
        state: { 
          from: `/product/${product.id}`, 
          message: 'Sign in to add items to your cart',
          pendingAction: { type: 'cart', productId: product.id }
        } 
      });
      return;
    }
    addToCart(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login', { 
        state: { 
          from: `/product/${product.id}`, 
          message: 'Sign in to save items to your wishlist',
          pendingAction: { type: 'wishlist', productId: product.id }
        } 
      });
      return;
    }
    toggleWishlist(product);
  };

  // Compact view
  if (compact) {
    return (
      <Link to={`/product/${product.id}`} className="block group">
        <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-all">
          <div className="aspect-square overflow-hidden">
            <img 
              src={imageError ? 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image' : mainImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          </div>
          <div className="p-2">
            <h3 className="font-medium text-sm text-gray-900 line-clamp-1">{product.title}</h3>
            <p className="text-xs text-gray-500 mb-1">{product.category}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary-800">₦{product.price.toLocaleString()}</span>
              <Button 
                size="sm" 
                className="h-7 px-2 text-xs bg-primary-800 hover:bg-primary-900"
                onClick={handleAddToCart}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  const conditionColors = {
    'New': 'bg-green-100 text-green-800',
    'Like New': 'bg-blue-100 text-blue-800',
    'Good': 'bg-yellow-100 text-yellow-800',
    'Fair': 'bg-orange-100 text-orange-800',
  };

  return (
    <div 
      className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container - Refactoring UI: Everything has an intended size */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={imageError ? 'https://placehold.co/400x400/e2e8f0/1e293b?text=No+Image' : mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />

        {/* Quick view overlay - appears on hover */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Quick view
          </span>
        </div>

        {/* Condition badge - Refactoring UI: Use badges for metadata */}
        <Badge className={`absolute top-3 left-3 ${conditionColors[product.condition] || 'bg-gray-100 text-gray-800'}`}>
          {product.condition}
        </Badge>

        {/* Wishlist button - subtle until hover */}
        <button 
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isWishlisted 
              ? 'bg-pink-500 text-white' 
              : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-white' : ''}`} />
        </button>

        {/* Stock indicator - Refactoring UI: Don't rely on color alone */}
        {!product.inStock && (
          <div className="absolute bottom-3 left-3 right-3">
            <Badge variant="destructive" className="w-full justify-center">
              Out of Stock
            </Badge>
          </div>
        )}
      </Link>

      {/* Content - Refactoring UI: Hierarchy through de-emphasis */}
      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block mb-2">
          <h3 className="font-medium text-gray-900 hover:text-primary-800 transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>
        
        {/* Category and rating - de-emphasized */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500">{product.category}</span>
          <div className="flex items-center">
            <Star className="h-3 w-3 fill-accent-500 text-accent-500 mr-1" />
            <span className="text-xs text-gray-600">{product.ratings.toFixed(1)}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {product.description}
        </p>

        {/* Price and add to cart - Refactoring UI: Action hierarchy */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Price</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">₦{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">₦{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={() => handleAddToCart()}
            disabled={!product.inStock}
            className={product.inStock 
              ? 'bg-primary-800 hover:bg-primary-900 text-white' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;