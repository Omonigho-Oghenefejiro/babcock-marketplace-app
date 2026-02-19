import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import API from '../services/api';
import { Button } from '../components/ui/button';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cart, clearCart, user } = useStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const processedRef = useRef(false);

  const reference = searchParams.get('reference');

  useEffect(() => {
    if (!reference || processedRef.current) return;
    processedRef.current = true;

    const verifyPayment = async () => {
      try {
        // 1. Verify on Backend
        const { data: verifyData } = await API.get(`/payment/verify/${reference}`);

        if (verifyData.status === 'success') {
          // 2. Create Order
          const orderData = {
            orderItems: cart.map(item => ({
                product: item.id,
                title: item.title,
                image: item.image,
                price: item.price,
                quantity: item.quantity
            })),
            itemsPrice: cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
            taxPrice: 500,
            totalPrice: cart.reduce((acc, item) => acc + item.price * item.quantity, 0) + 500,
            paymentInfo: {
              id: verifyData.paymentId,
              status: 'paid',
              reference: verifyData.reference
            }
          };

          await API.post('/orders', orderData);
          
          clearCart();
          setStatus('success');
        } else {
          setStatus('failed');
        }
      } catch (error) {
        console.error("Verification Error", error);
        setStatus('failed');
      }
    };

    verifyPayment();
  }, [reference, cart, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 flex items-center justify-center p-4">
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {status === 'verifying' && (
          <motion.div 
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 text-center border border-white/20 shadow-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-8"
            >
              <Loader className="h-20 w-20 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment...</h2>
            <p className="text-white/70">Please wait while we confirm your transaction.</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            className="bg-white rounded-3xl p-10 text-center shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
            >
              <CheckCircle className="h-12 w-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-500 mb-8">Thank you for your purchase. Your order has been placed.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to="/dashboard">
                  <Button className="w-full sm:w-auto bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white px-8 py-3 rounded-full font-medium shadow-lg">
                    <CreditCard className="h-4 w-4 mr-2" />
                    View Order
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="outline" className="w-full sm:w-auto border-2 border-gray-200 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-50">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div 
            className="bg-white rounded-3xl p-10 text-center shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
            >
              <XCircle className="h-12 w-12 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-500 mb-8">We couldn't verify your transaction. Please contact support if you were debited.</p>
              <Link to="/cart">
                <Button className="bg-gradient-to-r from-primary-700 to-primary-800 hover:from-primary-800 hover:to-primary-900 text-white px-8 py-3 rounded-full font-medium shadow-lg">
                  Return to Cart
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentCallback;