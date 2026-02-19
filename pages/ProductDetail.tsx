import { useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Shield, ArrowLeft, Plus, Minus, ShoppingCart, Smartphone, MessageSquare, Package } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import Reviews from '../components/Reviews';
import { fadeUpVariants } from '../lib/animations';

const ProductDetail = () => {
  const { id } = useParams();
  const { products, addToCart, user } = useStore();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  // Allow string to handle empty input during typing
  const [qty, setQty] = useState<number | string>(1);

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-500 mb-6">This product may have been removed or doesn't exist.</p>
          <Button asChild className="bg-primary-800 hover:bg-primary-900">
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: `/product/${id}`, 
          message: 'Sign in to add items to your cart',
          pendingAction: { type: 'cart', productId: product.id }
        } 
      });
      return;
    }
    const finalQty = typeof qty === 'number' ? qty : 1;
    addToCart(product, finalQty);
  };

  const handleChat = () => {
    if (!user) {
        navigate('/login', { 
          state: { 
            from: `/product/${id}`, 
            message: 'Sign in to message the seller' 
          } 
        });
        return;
    }
    navigate('/messages', { 
        state: { 
            sellerId: product.seller.id, 
            productId: product.id,
            sellerName: product.seller.fullName || 'Seller'
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
      if (num > 0) {
        setQty(num);
      } else {
        // If user tries to type invalid, keep 1
        setQty(1);
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
    setQty(current + 1);
  };

  const decrement = () => {
    const current = typeof qty === 'number' ? qty : 1;
    if (current > 1) setQty(current - 1);
  };

  const conditionColor = {
    'New': 'bg-green-100 text-green-800',
    'Like New': 'bg-blue-100 text-blue-800',
    'Good': 'bg-yellow-100 text-yellow-800',
    'Fair': 'bg-orange-100 text-orange-800'
  }[product.condition || 'Good'] || 'bg-gray-100 text-gray-800';

  const isOwnProduct = user?.id === product.seller.id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-primary-800 mb-8 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="h-96 md:h-auto bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8"
            >
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                src={product.images[0]} 
                alt={product.title} 
                className="max-h-full max-w-full object-contain rounded-xl shadow-lg" 
              />
            </motion.div>

            {/* Details */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <motion.div 
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-2 mb-4"
              >
                <Badge className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
                  {product.category}
                </Badge>
                {product.condition && (
                  <Badge className={conditionColor}>
                    {product.condition}
                  </Badge>
                )}
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-gray-900 mb-4"
              >
                {product.title}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center mb-6"
              >
                <div className="flex text-accent-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.ratings) ? 'fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 text-sm">({product.ratings} / 5.0)</span>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 text-lg mb-8 leading-relaxed"
              >
                {product.description}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col space-y-3 mb-8"
              >
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-green-700">Verified Seller</span>
                </div>
                {product.seller?.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-gray-500" />
                    </div>
                    <span>Seller Contact: {product.seller.phone}</span>
                  </div>
                )}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-auto border-t border-gray-100 pt-8"
              >
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Price</p>
                    <p className="text-4xl font-bold text-primary-900">₦{product.price.toLocaleString()}</p>
                  </div>
                  {!isOwnProduct && !isAdmin && (
                    <div className="flex items-center border border-gray-200 rounded-xl h-12 overflow-hidden">
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={decrement}
                        className="h-full px-4 hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition-colors"
                        disabled={typeof qty === 'number' && qty <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </motion.button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={qty}
                        onChange={(e) => handleQtyChange(e.target.value)}
                        onBlur={handleBlur}
                        className="w-16 h-full text-center font-semibold focus:outline-none focus:ring-2 focus:ring-primary-100 border-x border-gray-200"
                        aria-label="Quantity"
                      />
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        onClick={increment}
                        className="h-full px-4 hover:bg-gray-50 text-gray-500 disabled:opacity-50 transition-colors"
                        disabled={false}
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>
                    </div>
                  )}
                </div>

                {!isOwnProduct && !isAdmin ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToCart}
                      disabled={!product.inStock}
                      className="flex-1 bg-gradient-to-r from-primary-800 to-primary-900 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-lg shadow-primary-200 hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </motion.button>
                    
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleChat}
                      className="flex-1 sm:flex-none bg-primary-50 text-primary-800 border border-primary-200 py-4 px-8 rounded-xl font-bold text-lg hover:bg-primary-100 transition-all flex items-center justify-center"
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Chat with Seller
                    </motion.button>
                  </div>
                ) : (
                  <div className="bg-gray-100 text-gray-600 p-4 rounded-xl text-center font-medium">
                    {isAdmin 
                      ? 'Administrators cannot purchase items. Switch to a student account to order.' 
                      : 'You are the seller of this item.'}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          <Reviews productId={product.id} />
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
