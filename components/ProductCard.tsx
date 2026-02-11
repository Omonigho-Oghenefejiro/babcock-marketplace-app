import React from 'react';
import { Star, ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();

  const isWishlisted = wishlist.some(item => item.id === product.id);

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col h-full relative group">
      {/* Wishlist Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
      >
        <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-pink-500 text-pink-500' : 'text-gray-400 hover:text-pink-500'}`} />
      </button>

      <Link to={`/product/${product.id}`} className="block relative h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 bg-blue-900/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white">
          {product.category}
        </div>
      </Link>
      
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.id}`} className="block mb-2">
          <h3 className="text-lg font-medium text-gray-900 line-clamp-1 hover:text-blue-600">{product.title}</h3>
        </Link>
        
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
          <span className="mx-2 text-gray-300">•</span>
          <span className="text-sm text-gray-500">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</span>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className="text-xl font-bold text-blue-900">₦{product.price.toLocaleString()}</span>
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`p-2 rounded-full transition-colors ${
              product.stock > 0 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;