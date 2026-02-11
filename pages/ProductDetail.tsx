import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Shield, ArrowLeft, Plus, Minus, ShoppingCart, Smartphone, CheckCircle, MessageSquare } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import Reviews from '../components/Reviews';

const ProductDetail = () => {
  const { id } = useParams();
  const { products, addToCart, user, allUsers } = useStore();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  // Allow string to handle empty input during typing
  const [qty, setQty] = useState<number | string>(1);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <Link to="/shop" className="text-blue-600 hover:underline mt-4 block">Back to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    const finalQty = typeof qty === 'number' ? qty : 1;
    addToCart(product, finalQty);
  };

  const handleChat = () => {
    if (!user) {
        navigate('/login');
        return;
    }
    const seller = allUsers.find(u => u.id === product.sellerId);
    navigate('/messages', { 
        state: { 
            sellerId: product.sellerId, 
            productId: product.id,
            sellerName: seller ? seller.name : (product.contactPhone || 'Seller')
        } 
    });
  };

  const handleQtyChange = (val: string) => {
    if (val === '') {
      setQty('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) {
      if (num <= product.stock) {
        setQty(num);
      } else {
        // If user tries to type more than stock, cap it
        setQty(product.stock);
      }
    }
  };

  const handleBlur = () => {
    if (qty === '' || (typeof qty === 'number' && qty < 1)) {
      setQty(1);
    }
  };

  const increment = () => {
    const current = typeof qty === 'number' ? qty : 1;
    if (current < product.stock) setQty(current + 1);
  };

  const decrement = () => {
    const current = typeof qty === 'number' ? qty : 1;
    if (current > 1) setQty(current - 1);
  };

  const conditionColor = {
    'New': 'bg-green-100 text-green-800',
    'Like New': 'bg-blue-100 text-blue-800',
    'Used - Good': 'bg-yellow-100 text-yellow-800',
    'Used - Fair': 'bg-orange-100 text-orange-800'
  }[product.condition || 'Used - Good'] || 'bg-gray-100 text-gray-800';

  const isOwnProduct = user?.id === product.sellerId;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="h-96 md:h-auto bg-gray-50 flex items-center justify-center p-8">
            <img src={product.image} alt={product.title} className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
          </div>

          {/* Details */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold tracking-wide uppercase">
                {product.category}
                </span>
                {product.condition && (
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${conditionColor}`}>
                        {product.condition}
                    </span>
                )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>
            
            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="ml-2 text-gray-600 text-sm">({product.rating} / 5.0)</span>
            </div>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="flex flex-col space-y-3 mb-8">
                <div className="flex items-center space-x-2 text-sm text-green-600 font-medium">
                <Shield className="h-4 w-4" />
                <span>Verified Seller</span>
                </div>
                {product.contactPhone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Smartphone className="h-4 w-4" />
                        <span>Seller Contact: {product.contactPhone}</span>
                    </div>
                )}
            </div>

            <div className="mt-auto border-t border-gray-100 pt-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-4xl font-bold text-blue-900">₦{product.price.toLocaleString()}</p>
                </div>
                {!isOwnProduct && !isAdmin && (
                    <div className="flex items-center border border-gray-200 rounded-lg h-12">
                    <button 
                        onClick={decrement}
                        className="h-full px-4 hover:bg-gray-50 text-gray-500 border-r border-gray-200 disabled:opacity-50"
                        disabled={typeof qty === 'number' && qty <= 1}
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => handleQtyChange(e.target.value)}
                        onBlur={handleBlur}
                        className="w-16 h-full text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-100"
                        aria-label="Quantity"
                    />
                    <button 
                        onClick={increment}
                        className="h-full px-4 hover:bg-gray-50 text-gray-500 border-l border-gray-200 disabled:opacity-50"
                        disabled={typeof qty === 'number' && qty >= product.stock}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                    </div>
                )}
              </div>

              {!isOwnProduct && !isAdmin ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="flex-1 bg-blue-600 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    
                    <button 
                        onClick={handleChat}
                        className="flex-1 sm:flex-none bg-blue-50 text-blue-700 border border-blue-200 py-4 px-8 rounded-xl font-bold text-lg hover:bg-blue-100 transition-all flex items-center justify-center"
                    >
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Chat with Seller
                    </button>
                  </div>
              ) : (
                  <div className="bg-gray-100 text-gray-600 p-4 rounded-xl text-center font-medium">
                      {isAdmin 
                        ? 'Administrators cannot purchase items. Switch to a student account to order.' 
                        : 'You are the seller of this item.'}
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <Reviews productId={product.id} />
      </div>
    </div>
  );
};

export default ProductDetail;
