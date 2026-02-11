import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, CreditCard, Loader, Plus, Minus, ShieldAlert } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useToast } from '../contexts/ToastContext';
import API from '../services/api';

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
          <div className="max-w-7xl mx-auto px-4 py-24 text-center">
             <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldAlert className="h-10 w-10 text-red-500" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">Administrator View</h2>
             <p className="text-gray-500 mb-8">Administrators cannot place orders or manage personal carts.</p>
             <Link to="/admin" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
               Go to Admin Dashboard
             </Link>
          </div>
      );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/shop" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => (
                <li key={item.id} className="p-6 flex flex-col sm:flex-row items-center">
                  <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-md bg-gray-100" />
                  <div className="mt-4 sm:mt-0 sm:ml-6 flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                      </div>
                      <p className="font-bold text-gray-900 mt-2 sm:mt-0">₦{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-md h-9">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-full px-3 hover:bg-gray-50 text-gray-500 border-r border-gray-200 disabled:opacity-30"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(e) => handleQtyInput(item.id, e.target.value, item.stock)}
                          className="w-12 h-full text-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                         <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="h-full px-3 hover:bg-gray-50 text-gray-500 border-l border-gray-200 disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="mt-4 sm:mt-0 text-red-500 hover:text-red-700 text-sm font-medium flex items-center transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
            <div className="flow-root">
              <dl className="-my-4 text-sm divide-y divide-gray-100">
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">₦{subtotal.toLocaleString()}</dd>
                </div>
                <div className="py-4 flex items-center justify-between">
                  <dt className="text-gray-600">Service Fee</dt>
                  <dd className="font-medium text-gray-900">₦{serviceFee.toLocaleString()}</dd>
                </div>
                <div className="py-4 flex items-center justify-between border-t border-gray-200">
                  <dt className="text-base font-bold text-gray-900">Order Total</dt>
                  <dd className="text-base font-bold text-blue-600">₦{total.toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            <button 
              onClick={handlePaystackCheckout}
              disabled={isProcessing}
              className="mt-6 w-full bg-green-600 text-white py-3 rounded-md font-bold hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader className="animate-spin h-5 w-5 mr-2" /> : <CreditCard className="mr-2 h-5 w-5" />}
              {isProcessing ? 'Processing...' : `Pay ₦${total.toLocaleString()}`}
            </button>
            <div className="mt-4 flex justify-center">
                <img src="https://upload.wikimedia.org/wikipedia/commons/1/1f/Paystack.png" alt="Secured by Paystack" className="h-6 opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;