import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ShoppingCart, CreditCard, Loader, Plus, Minus, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import API from '../services/api';
import { fadeUpVariants, staggerContainerVariants } from '../lib/animations';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, user } = useStore();
  const { addToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const serviceFee = 500;
  const total = subtotal + serviceFee;

  const handlePaystackCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 1. Initialize Payment on Backend
      const { data } = await API.post('/payment/initialize', {
        email: user.email,
        amount: total
      });

      // 2. Redirect user to Paystack Payment Page
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        addToast('Failed to initialize payment', 'error');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error(error);
      addToast('Payment connection failed', 'error');
      setIsProcessing(false);
    }
  };

  const handleQtyInput = (id: string, val: string, stock: number) => {
    const num = parseInt(val);
    if (!isNaN(num) && num > 0) {
      updateQuantity(id, Math.min(num, stock));
    } else if (val === '') {
       // Allow empty temporarily while typing
    }
  };

  if (user?.role === 'admin') {
      return (
          <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="container-custom py-24 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <ShieldAlert className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrator View</h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">Administrators cannot place orders or manage personal carts.</p>
                <Button asChild className="bg-primary-800 hover:bg-primary-900 px-8 py-6 text-base font-semibold rounded-xl">
                  <Link to="/admin">Go to Admin Dashboard</Link>
                </Button>
              </motion.div>
            </div>
          </div>
      );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShoppingBag className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
            <Button asChild className="bg-primary-800 hover:bg-primary-900 px-8 py-6 text-base font-semibold rounded-xl">
              <Link to="/shop">Start Shopping</Link>
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 py-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-72 h-72 bg-accent-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/shop" className="inline-flex items-center text-primary-200 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Continue Shopping
            </Link>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-white/30 text-white">
                <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                {cart.length} items
              </Badge>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Shopping Cart</h1>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <motion.div 
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-8"
          >
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
              <ul className="divide-y divide-gray-100">
                {cart.map((item, index) => (
                  <motion.li 
                    key={item.id} 
                    variants={fadeUpVariants}
                    className="p-6 flex flex-col sm:flex-row items-center hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 w-full text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                          <Badge className="mt-1 bg-gray-100 text-gray-600">{item.category}</Badge>
                        </div>
                        <p className="font-bold text-xl text-primary-900 mt-2 sm:mt-0">₦{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-xl h-10 overflow-hidden">
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="h-full px-4 hover:bg-gray-50 text-gray-500 disabled:opacity-30 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </motion.button>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.quantity}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQtyInput(item.id, e.target.value, Number(item.stock))}
                            className="w-14 h-full text-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500 border-x border-gray-200"
                          />
                          <motion.button 
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= Number(item.stock)}
                            className="h-full px-4 hover:bg-gray-50 text-gray-500 disabled:opacity-30 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </motion.button>
                        </div>
                        
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeFromCart(item.id)} 
                          className="mt-4 sm:mt-0 text-red-500 hover:text-red-700 text-sm font-medium flex items-center transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove
                        </motion.button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 mt-8 lg:mt-0"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="flow-root">
                <dl className="-my-4 text-sm divide-y divide-gray-100">
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600">Subtotal</dt>
                    <dd className="font-semibold text-gray-900">₦{subtotal.toLocaleString()}</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-gray-600">Service Fee</dt>
                    <dd className="font-semibold text-gray-900">₦{serviceFee.toLocaleString()}</dd>
                  </div>
                  <div className="py-4 flex items-center justify-between">
                    <dt className="text-lg font-bold text-gray-900">Total</dt>
                    <dd className="text-xl font-bold text-primary-800">₦{total.toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePaystackCheckout}
                disabled={isProcessing}
                className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-green-200"
              >
                {isProcessing ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <CreditCard className="mr-2 h-5 w-5" />}
                {isProcessing ? 'Processing...' : `Pay ₦${total.toLocaleString()}`}
              </motion.button>
              <div className="mt-4 flex justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/1f/Paystack.png" alt="Secured by Paystack" className="h-6 opacity-70" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
