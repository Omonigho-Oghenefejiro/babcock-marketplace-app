import React, { useState } from 'react';
import { Star, ShoppingBag, Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const images = product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl 
                 transition-all duration-500 overflow-hidden relative
                 transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={images[currentImageIndex]} 
          alt={product.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />

        {/* Image Navigation Arrows */}
        {images.length > 1 && isHovered && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 
                       bg-white/90 backdrop-blur-sm rounded-full shadow-lg
                       flex items-center justify-center hover:bg-white
                       transition-all duration-200 opacity-0 group-hover:opacity-100
                       transform translate-x-0 group-hover:translate-x-0"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 
                       bg-white/90 backdrop-blur-sm rounded-full shadow-lg
                       flex items-center justify-center hover:bg-white
                       transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? 'w-6 bg-white' 
                    : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm 
                         font-medium transform translate-y-4 group-hover:translate-y-0 
                         transition-transform duration-300 flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Quick View</span>
          </span>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 
                         rounded-full text-xs font-semibold shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Condition Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm
            ${product.condition === 'New' ? 'bg-green-500 text-white' :
              product.condition === 'Like New' ? 'bg-blue-500 text-white' :
              product.condition === 'Good' ? 'bg-yellow-500 text-white' :
              'bg-orange-500 text-white'}`}
          >
            {product.condition}
          </span>
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className="absolute bottom-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-sm 
                   rounded-full shadow-lg flex items-center justify-center
                   hover:bg-white transition-all duration-200 transform 
                   hover:scale-110 active:scale-95"
        >
          <Heart className={`h-5 w-5 transition-colors ${
            isWishlisted 
              ? 'fill-pink-500 text-pink-500' 
              : 'text-gray-400 hover:text-pink-500'
          }`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link to={`/product/${product.id}`} className="block mb-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 
                       hover:text-blue-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.ratings)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-500">
            ({product.reviews?.length || 0} reviews)
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <span className="text-sm text-gray-500 line-through">
              ₦{(product.price * 1.2).toLocaleString()}
            </span>
            <span className="block text-2xl font-bold text-gray-900">
              ₦{product.price.toLocaleString()}
            </span>
          </div>
          
          <button
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            className={`relative p-3 rounded-xl transition-all duration-300 
                     transform hover:scale-110 active:scale-95 group
                     ${product.inStock 
                       ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-xl' 
                       : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                     }`}
          >
            <ShoppingBag className="h-5 w-5" />
            
            {/* Tooltip */}
            {product.inStock && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 
                             bg-gray-900 text-white text-xs py-1 px-2 rounded
                             opacity-0 group-hover:opacity-100 transition-opacity
                             whitespace-nowrap pointer-events-none">
                Add to Cart
              </span>
            )}
          </button>
        </div>

        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute bottom-20 left-5 right-5">
            <div className="bg-red-50 text-red-600 text-sm font-medium px-3 py-2 
                          rounded-lg text-center">
              Out of Stock
            </div>
          </div>
        )}
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/20 
                    rounded-2xl transition-colors duration-300 pointer-events-none" />
    </div>
  );
};

export default ProductCard;