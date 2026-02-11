import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import API from '../services/api';

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
    <div className="max-w-7xl mx-auto px-4 py-24 text-center">
      {status === 'verifying' && (
        <div>
          <Loader className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900">Verifying Payment...</h2>
          <p className="text-gray-500">Please wait while we confirm your transaction.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="animate-fade-in-up">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-8">Thank you for your purchase. Your order has been placed.</p>
          <div className="flex justify-center space-x-4">
             <Link to="/dashboard" className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
               View Order
             </Link>
             <Link to="/shop" className="bg-white border border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition-colors">
               Continue Shopping
             </Link>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="animate-fade-in-up">
          <div className="bg-red-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-500 mb-8">We couldn't verify your transaction. Please contact support if you were debited.</p>
          <Link to="/cart" className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
            Return to Cart
          </Link>
        </div>
      )}
    </div>
  );
};

export default PaymentCallback;